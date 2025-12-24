const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },
  
  // Auth & Security
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false // Never return password in queries by default
  },
  role: { 
    type: String, 
    enum: ['Admin', 'HR', 'Manager', 'Employee'], 
    default: 'Employee', 
    index: true 
  },
  permissions: [{ type: String }], // e.g., ['approve_leave', 'view_all_salaries', 'manage_departments']
  
  // Security features
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  
  // Profile
  empCode: { type: String, unique: true, required: true, trim: true }, // Internal ID (e.g., EMP001)
  username: { type: String, trim: true }, // Optional display name
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  birthdate: { type: Date },
  profilePic: String, // CDN URL
  
  // Contact Information
  phoneNumber: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  
  // Organizational Hierarchy
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  designation: { type: String, required: true, trim: true }, // Job title
  position: { type: String, trim: true }, // Alternative to designation
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    index: true // Self-reference for org chart
  },
  
  // Employment Details
  status: { 
    type: String, 
    enum: ['Active', 'Probation', 'Notice Period', 'Terminated', 'Resigned', 'On Leave'], 
    default: 'Active',
    index: true
  },
  employmentType: { 
    type: String, 
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'], 
    default: 'Full-Time' 
  },
  joiningDate: { type: Date, required: true },
  confirmationDate: Date, // End of probation
  lastWorkingDate: Date,
  
  // Work Details
  jobShift: { 
    type: String, 
    enum: ['Morning', 'Evening', 'Night', 'Flexible'], 
    default: 'Morning' 
  },
  expertise: [{ type: String, trim: true }], // Skills
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  achievements: [{ type: String, trim: true }],
  
  // Financial Details (IMPROVED - No more Map)
  salary: {
    structure: { 
      type: String, 
      enum: ['Hourly', 'Fixed', 'Contract'], 
      default: 'Fixed' 
    },
    amount: { type: Number, required: true }, // CTC or Gross Annual
    currency: { type: String, default: 'USD' },
    breakdown: {
      basic: Number,
      hra: Number, // House Rent Allowance
      allowances: Number,
      bonus: Number,
      deductions: Number
    },
    bankDetails: {
      accountNumber: { type: String, select: false }, // Encrypted
      bankName: String,
      ifscCode: String,
      holderName: String
    }
  },
  
  // Leave Balances
  leaveBalance: {
    annualLeave: { type: Number, default: 0 },
    sickLeave: { type: Number, default: 0 },
    casualLeave: { type: Number, default: 0 },
    privilegeLeave: { type: Number, default: 0 },
    maternityLeave: { type: Number, default: 0 },
    paternityLeave: { type: Number, default: 0 },
    halfDayLeave: { type: Number, default: 0 },
    unpaidLeave: { type: Number, default: 0 }
  },
  
  // Document Management (NEW)
  documents: [{
    name: { type: String, required: true }, // e.g., "Resume", "NDA", "ID Proof"
    type: { 
      type: String, 
      enum: ['Resume', 'Contract', 'ID Proof', 'Tax Form', 'Certificate', 'Other'] 
    },
    url: { type: String, required: true }, // S3/CDN Link
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date, // For Visas, Licenses
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    verifiedAt: Date
  }],
  
  // Device Management (for push notifications)
  deviceTokens: [String],
  
  // Audit & Special Fields
  specialRemarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Compound indexes for performance
employeeSchema.index({ companyId: 1, isDeleted: 1, status: 1 });
employeeSchema.index({ email: 1, companyId: 1 });
employeeSchema.index({ empCode: 1, companyId: 1 });

// Text index for search
employeeSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text',
  empCode: 'text' 
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
employeeSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
employeeSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
employeeSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model('Employee', employeeSchema);
