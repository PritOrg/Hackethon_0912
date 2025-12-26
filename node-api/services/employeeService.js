/**
 * Employee Service
 * Business logic for employee management operations
 * Handles CRUD operations, authentication, and employee-specific calculations
 * 
 * @module services/employeeService
 */

const Employee = require('../schemas/employee');
const Department = require('../schemas/department');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const { buildSearchFilter, buildFilter } = require('../utils/queryHelper');

/**
 * Create a new employee
 * @param {Object} employeeData - Employee data
 * @param {string} createdBy - ID of user creating the employee
 * @returns {Promise<Object>} Created employee
 */
const createEmployee = async (employeeData, createdBy = null) => {
  // Check if email already exists
  const existingEmployee = await Employee.findOne({ 
    email: employeeData.email,
    isDeleted: false 
  });
  
  if (existingEmployee) {
    throw new Error('Email already exists');
  }

  // Validate department exists
  if (employeeData.department) {
    const department = await Department.findOne({ 
      _id: employeeData.department,
      companyId: employeeData.companyId,
      isDeleted: false 
    });
    if (!department) {
      throw new Error('Department not found');
    }
  }

  // Generate employee code if not provided
  if (!employeeData.empCode) {
    const count = await Employee.countDocuments({ 
      companyId: employeeData.companyId 
    });
    employeeData.empCode = `EMP${(count + 1).toString().padStart(4, '0')}`;
  }

  // Hash password (pre-save hook in model will handle this)
  const employee = new Employee({
    ...employeeData,
    createdBy
  });

  await employee.save();
  
  // Return employee without sensitive fields
  const employeeObject = employee.toObject();
  delete employeeObject.password;
  delete employeeObject.bankDetails;
  delete employeeObject.twoFactorSecret;
  
  return employeeObject;
};

/**
 * Get employees with filtering, pagination, and search
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} { employees, total }
 */
const getEmployees = async (filters) => {
  const {
    companyId,
    department,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = '-createdAt'
  } = filters;

  // Build query filter
  const query = buildFilter({ companyId, department, status }, ['companyId', 'department', 'status']);
  query.isDeleted = false;

  // Add search if provided
  if (search) {
    const searchFilter = buildSearchFilter(search, ['firstName', 'lastName', 'email', 'empCode']);
    Object.assign(query, searchFilter);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Parse sort
  const sortObj = {};
  if (sortBy.startsWith('-')) {
    sortObj[sortBy.substring(1)] = -1;
  } else {
    sortObj[sortBy] = 1;
  }

  // Execute query
  const [employees, total] = await Promise.all([
    Employee.find(query)
      .select('-password -bankDetails -twoFactorSecret')
      .populate('department', 'name')
      .populate('managerId', 'firstName lastName empCode')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(query)
  ]);

  return { employees, total };
};

/**
 * Get employee by ID
 * @param {string} employeeId - Employee ID
 * @param {boolean} includeSensitive - Include sensitive fields (default: false)
 * @returns {Promise<Object>} Employee data
 */
const getEmployeeById = async (employeeId, includeSensitive = false) => {
  let query = Employee.findOne({ _id: employeeId, isDeleted: false });

  if (!includeSensitive) {
    query = query.select('-password -bankDetails -twoFactorSecret');
  }

  const employee = await query
    .populate('department', 'name headId')
    .populate('managerId', 'firstName lastName empCode email position')
    .populate('companyId', 'name')
    .lean();

  if (!employee) {
    throw new Error('Employee not found');
  }

  return employee;
};

/**
 * Update employee data
 * @param {string} employeeId - Employee ID
 * @param {Object} updateData - Data to update
 * @param {string} updatedBy - ID of user making the update
 * @returns {Promise<Object>} Updated employee
 */
const updateEmployee = async (employeeId, updateData, updatedBy = null) => {
  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check email uniqueness if email is being updated
  if (updateData.email && updateData.email !== employee.email) {
    const existingEmployee = await Employee.findOne({ 
      email: updateData.email,
      _id: { $ne: employeeId },
      isDeleted: false 
    });
    if (existingEmployee) {
      throw new Error('Email already exists');
    }
  }

  // Validate department if being updated
  if (updateData.department) {
    const department = await Department.findOne({ 
      _id: updateData.department,
      companyId: employee.companyId,
      isDeleted: false 
    });
    if (!department) {
      throw new Error('Department not found');
    }
  }

  // Prevent updating sensitive fields directly
  delete updateData.password;
  delete updateData.createdBy;
  delete updateData.createdAt;

  // Update fields
  Object.assign(employee, updateData);
  employee.updatedBy = updatedBy;
  await employee.save();

  // Return without sensitive data
  const employeeObject = employee.toObject();
  delete employeeObject.password;
  delete employeeObject.bankDetails;
  delete employeeObject.twoFactorSecret;
  
  return employeeObject;
};

/**
 * Soft delete employee
 * @param {string} employeeId - Employee ID
 * @param {string} deletedBy - ID of user performing deletion
 * @returns {Promise<void>}
 */
const deleteEmployee = async (employeeId, deletedBy = null) => {
  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  employee.isDeleted = true;
  employee.deletedAt = new Date();
  employee.deletedBy = deletedBy;
  employee.status = 'Inactive';
  
  await employee.save();
};

/**
 * Authenticate employee and generate JWT token
 * @param {string} email - Employee email
 * @param {string} password - Employee password
 * @returns {Promise<Object>} { employee, token }
 */
const authenticateEmployee = async (email, password) => {
  // Find employee with password field included
  const employee = await Employee.findOne({ 
    email, 
    isDeleted: false 
  }).select('+password');

  if (!employee) {
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (employee.isLocked()) {
    const lockTime = Math.round((employee.lockUntil - Date.now()) / 1000 / 60);
    throw new Error(`Account is locked. Try again in ${lockTime} minutes`);
  }

  // Verify password
  const isMatch = await employee.comparePassword(password);
  
  if (!isMatch) {
    // Increment login attempts
    await employee.incLoginAttempts();
    throw new Error('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (employee.loginAttempts > 0) {
    await employee.resetLoginAttempts();
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: employee._id, 
      email: employee.email,
      companyId: employee.companyId,
      role: employee.role 
    },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpire }
  );

  // Return employee without sensitive data
  const employeeObject = employee.toObject();
  delete employeeObject.password;
  delete employeeObject.bankDetails;
  delete employeeObject.twoFactorSecret;

  return { employee: employeeObject, token };
};

/**
 * Update employee salary
 * @param {string} employeeId - Employee ID
 * @param {Object} salaryData - New salary data
 * @param {string} updatedBy - ID of user making the update
 * @returns {Promise<Object>} Updated employee
 */
const updateSalary = async (employeeId, salaryData, updatedBy = null) => {
  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  employee.salary = salaryData;
  employee.updatedBy = updatedBy;
  await employee.save();

  const employeeObject = employee.toObject();
  delete employeeObject.password;
  delete employeeObject.twoFactorSecret;
  
  return employeeObject;
};

/**
 * Get employee hierarchy (manager and subordinates)
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Hierarchy data
 */
const getEmployeeHierarchy = async (employeeId) => {
  const employee = await getEmployeeById(employeeId);

  // Get manager
  const manager = employee.managerId ? 
    await getEmployeeById(employee.managerId) : null;

  // Get direct reports (subordinates)
  const subordinates = await Employee.find({ 
    managerId: employeeId,
    isDeleted: false,
    status: 'Active'
  })
    .select('firstName lastName empCode position email')
    .lean();

  return {
    employee,
    manager,
    subordinates
  };
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  authenticateEmployee,
  updateSalary,
  getEmployeeHierarchy
};
