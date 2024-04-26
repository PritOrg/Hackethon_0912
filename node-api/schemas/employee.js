const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  status: String,
  reason: String,
  leaveType: String, // Half day, Full day, etc.
  approverId: String, // User ID of the approver
  approverComment: String, // Comment by the approver
  acceptedDate: Date, // Date when the request was accepted
  createdAt: { type: Date, default: Date.now }, // Creation date of the leave request
});

const leaveBalanceSchema = new mongoose.Schema({
  annualLeave: Number,
  maternityLeave: Number,
  privilegeLeave: Number,
  halfDayLeave: Number,
  casualLeave: Number,
  sickLeave: Number,
  createdAt: { type: Date, default: Date.now },
});

const employeeSchema = new mongoose.Schema({
  // Personal Information
  username: String,
  email: { type: String, unique: true }, // Ensure email uniqueness
  password: String,
  firstName: String,
  middleName: String,
  lastName: String,
  birthdate: Date, // Birthdate of the employee
  profilePic: String, // URL to profile picture
  // Organizational Information
  role: String,
  joiningDate: Date,
  expertise: [String], // Array of expertise fields
  projects: [String], // Array of projects
  achievements: [String], // Array of achievements
  jobShift: String,
  leaveRequests: [leaveRequestSchema],
  leaveBalance: leaveBalanceSchema,
  specialRemarks: String,
  salary: {
    type: Map,
    of: Number
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
