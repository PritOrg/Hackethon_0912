/**
 * Authentication Service
 * Handles authentication business logic including 2FA, password reset, and token management
 * 
 * @module services/authService
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Employee = require('../schemas/employee');
const Company = require('../schemas/company');
const config = require('../config/environment');

/**
 * Register new company (SaaS setup)
 * @param {Object} companyData - Company registration data
 * @returns {Promise<Object>} Created company and admin user
 */
const registerCompany = async (companyData) => {
  const { 
    companyName,
    companyType,
    industry,
    registrationNumber,
    taxId,
    website,
    phone,
    email,
    address,
    adminUser,
    subscriptionPlan
  } = companyData;

  console.log('Received registration data:', JSON.stringify(companyData, null, 2));

  // Check if company with same email exists
  const existingCompany = await Company.findOne({ 'contact.email': { $regex: email, $options: 'i' } });
  if (existingCompany) {
    throw new Error('Company with this email already exists');
  }

  // Check if admin email already exists
  const existingAdmin = await Employee.findOne({ email: adminUser.email });
  if (existingAdmin) {
    throw new Error('Admin email already exists');
  }

  // Create company
  const company = new Company({
    name: companyName,
    industry: industry,
    type: companyType,
    registrationNumber: registrationNumber || `REG-${Date.now()}`,
    contact: {
      email: email,
      phone: phone,
      website: website || ''
    },
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    },
    subscriptionStatus: 'Trial',
    subscriptionPlan: subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1), // Capitalize first letter
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    settings: {
      attendance: {
        enableGeoFencing: false,
        allowedRadius: 500,
        workingDays: [1, 2, 3, 4, 5],
        standardWorkHours: 8,
        lateThreshold: 15
      },
      leave: {
        requireManagerApproval: true,
        requireHRApproval: false,
        autoApproveHalfDay: false
      },
      payroll: {
        currency: 'USD',
        payPeriod: 'Monthly',
        payDayOfMonth: 1
      }
    }
  });

  await company.save();
  console.log('Company saved successfully:', company._id);

  // Create admin employee - Don't hash password here, pre-save hook will do it
  const adminEmployee = new Employee({
    companyId: company._id,
    empCode: `EMP-${company._id.toString().slice(-6).toUpperCase()}-001`,
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
    email: adminUser.email,
    password: adminUser.password, // Pre-save hook will hash this
    phoneNumber: adminUser.phone,
    role: 'Admin',
    designation: 'Company Administrator',
    joiningDate: new Date(),
    status: 'Active',
    employmentType: 'Full-Time',
    salary: {
      amount: 50000,
      currency: 'USD',
      structure: 'Fixed'
    }
  });

  await adminEmployee.save();
  console.log('Admin employee saved successfully:', adminEmployee._id);

  // Update company admins array
  company.admins.push(adminEmployee._id);
  await company.save();
  console.log('Company admins updated');

  // Generate tokens
  const accessToken = generateAccessToken(adminEmployee);
  const refreshToken = generateRefreshToken(adminEmployee);

  // Store refresh token
  adminEmployee.refreshToken = refreshToken;
  await adminEmployee.save();

  // Remove sensitive data
  const employeeObject = adminEmployee.toObject();
  delete employeeObject.password;
  delete employeeObject.refreshToken;

  return {
    company,
    employee: employeeObject,
    accessToken,
    refreshToken
  };
};

/**
 * Login with email and password
 * @param {string} email - Employee email
 * @param {string} password - Employee password
 * @returns {Promise<Object>} Employee data and tokens
 */
const login = async (email, password) => {
  console.log('Login attempt:', { email, passwordLength: password?.length });
  
  // Find employee and explicitly select password field (since it has select: false in schema)
  const employee = await Employee.findOne({ email, status: 'Active' })
    .select('+password')
    .populate('companyId', 'name subscriptionStatus');

  console.log('Employee found:', {
    found: !!employee,
    email: employee?.email,
    hasPassword: !!employee?.password,
    passwordLength: employee?.password?.length,
    status: employee?.status,
    role: employee?.role
  });

  if (!employee) {
    console.log('Login failed: Employee not found or inactive');
    throw new Error('Invalid credentials');
  }

  // Check password
  console.log('Comparing passwords...');
  const isPasswordValid = await bcrypt.compare(password, employee.password);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    console.log('Login failed: Invalid password');
    throw new Error('Invalid credentials');
  }

  // Check if company subscription is active
  if (employee.companyId.subscriptionStatus === 'expired') {
    throw new Error('Company subscription has expired. Please contact your administrator.');
  }

  // Check if 2FA is enabled
  if (employee.twoFactorEnabled) {
    // Return a special status indicating 2FA is required
    return {
      requires2FA: true,
      tempToken: generateTempToken(employee),
      employeeId: employee._id
    };
  }

  // Generate tokens
  const accessToken = generateAccessToken(employee);
  const refreshToken = generateRefreshToken(employee);

  // Store refresh token
  employee.refreshToken = refreshToken;
  employee.lastLogin = new Date();
  await employee.save();

  // Remove sensitive data
  const employeeObject = employee.toObject();
  delete employeeObject.password;
  delete employeeObject.refreshToken;

  return {
    employee: employeeObject,
    accessToken,
    refreshToken
  };
};

/**
 * Logout (invalidate refresh token)
 * @param {string} employeeId - Employee ID
 * @returns {Promise<void>}
 */
const logout = async (employeeId) => {
  await Employee.findByIdAndUpdate(employeeId, { 
    $unset: { refreshToken: 1 } 
  });
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Find employee
    const employee = await Employee.findOne({ 
      _id: decoded.id, 
      refreshToken,
      status: 'Active'
    });

    if (!employee) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(employee);

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Request password reset
 * @param {string} email - Employee email
 * @returns {Promise<Object>} Reset token (in production, send via email)
 */
const forgotPassword = async (email) => {
  const employee = await Employee.findOne({ email, status: 'Active' });

  if (!employee) {
    // Don't reveal if email exists for security
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  employee.passwordResetToken = resetTokenHash;
  employee.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await employee.save();

  // In production, send this via email
  // For now, return it (REMOVE IN PRODUCTION)
  return {
    message: 'Password reset token generated',
    resetToken, // DO NOT return this in production
    resetUrl: `${config.app.frontendUrl}/reset-password?token=${resetToken}`
  };
};

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const resetPassword = async (token, newPassword) => {
  // Hash the token to compare with stored hash
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const employee = await Employee.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() },
    status: 'Active'
  });

  if (!employee) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
  employee.password = await bcrypt.hash(newPassword, salt);

  // Clear reset token fields
  employee.passwordResetToken = undefined;
  employee.passwordResetExpires = undefined;
  await employee.save();

  return { message: 'Password reset successful' };
};

/**
 * Setup 2FA (generate secret and QR code)
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} QR code URL and secret
 */
const setup2FA = async (employeeId) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error('Employee not found');
  }

  if (employee.twoFactorEnabled) {
    throw new Error('2FA is already enabled');
  }

  // Generate secret (using crypto for simplicity, in production use speakeasy)
  const secret = crypto.randomBytes(20).toString('hex');

  employee.twoFactorSecret = secret;
  await employee.save();

  // In production, use speakeasy to generate QR code
  // For now, return the secret
  return {
    secret,
    qrCodeUrl: `otpauth://totp/EMS:${employee.email}?secret=${secret}&issuer=EMS`,
    message: 'Scan QR code with Google Authenticator app'
  };
};

/**
 * Verify 2FA code and enable 2FA
 * @param {string} employeeId - Employee ID
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Success message
 */
const verify2FA = async (employeeId, code) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error('Employee not found');
  }

  if (!employee.twoFactorSecret) {
    throw new Error('2FA setup not initiated');
  }

  // In production, use speakeasy.totp.verify()
  // For demo purposes, accept any 6-digit code
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code');
  }

  employee.twoFactorEnabled = true;
  await employee.save();

  return { 
    message: '2FA enabled successfully',
    backupCodes: generateBackupCodes() // Generate backup codes
  };
};

/**
 * Verify 2FA during login
 * @param {string} tempToken - Temporary token from login
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Employee data and tokens
 */
const verify2FALogin = async (tempToken, code) => {
  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, config.jwt.secret);

    const employee = await Employee.findById(decoded.id)
      .populate('companyId', 'name');

    if (!employee || !employee.twoFactorEnabled) {
      throw new Error('Invalid request');
    }

    // In production, verify code using speakeasy
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code');
    }

    // Generate full tokens
    const accessToken = generateAccessToken(employee);
    const refreshToken = generateRefreshToken(employee);

    employee.refreshToken = refreshToken;
    employee.lastLogin = new Date();
    await employee.save();

    const employeeObject = employee.toObject();
    delete employeeObject.password;
    delete employeeObject.refreshToken;

    return {
      employee: employeeObject,
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new Error('Invalid temporary token');
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate JWT access token
 * @param {Object} employee - Employee document
 * @returns {string} JWT token
 */
const generateAccessToken = (employee) => {
  return jwt.sign(
    { 
      id: employee._id, 
      email: employee.email,
      role: employee.role,
      companyId: employee.companyId
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} employee - Employee document
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (employee) => {
  return jwt.sign(
    { id: employee._id },
    config.jwt.refreshSecret,
    { expiresIn: '7d' }
  );
};

/**
 * Generate temporary token (for 2FA flow)
 * @param {Object} employee - Employee document
 * @returns {string} JWT temp token
 */
const generateTempToken = (employee) => {
  return jwt.sign(
    { id: employee._id, temp: true },
    config.jwt.secret,
    { expiresIn: '10m' }
  );
};

/**
 * Generate backup codes for 2FA
 * @returns {Array<string>} Array of backup codes
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

module.exports = {
  registerCompany,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  verify2FALogin
};
