const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reason: String,
  leaveType: { type: String, enum: ['Half Day', 'Full Day', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave', 'Privilege Leave'] },
  approverId: String, // User ID of the approver
  approverComment: String, // Comment by the approver
  acceptedDate: Date, // Date when the request was accepted
  createdAt: { type: Date, default: Date.now }, // Creation date of the leave request
});

const leaveBalanceSchema = new mongoose.Schema({
  annualLeave: { type: Number, default: 0 },
  maternityLeave: { type: Number, default: 0 },
  privilegeLeave: { type: Number, default: 0 },
  halfDayLeave: { type: Number, default: 0 },
  casualLeave: { type: Number, default: 0 },
  sickLeave: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const employeeSchema = new mongoose.Schema({
  // Personal Information
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true }, // Ensure email uniqueness
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true }, // Birthdate of the employee
  profilePic: String, // URL to profile picture
  phoneNumber: { type: String, required: true }, // Added phone number
  address: { // Added address
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: { // Added emergency contact
    name: String,
    relationship: String,
    phoneNumber: String,
  },
  // Organizational Information
  role: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  expertise: [String], // Array of expertise fields
  projects: [String], // Array of projects
  achievements: [String], // Array of achievements
  jobShift: { type: String, enum: ['Morning', 'Evening', 'Night'], required: true },
  leaveRequests: [leaveRequestSchema],
  leaveBalance: leaveBalanceSchema,
  specialRemarks: String,
  salary: {
    type: Map,
    of: Number,
    required: true,
  },
  department: { type: String, required: true }, // Added department
  position: { type: String, required: true }, // Added position
  supervisorId: String, // Added supervisor ID
  createdAt: { type: Date, default: Date.now }, // Added creation date
});

module.exports = mongoose.model('Employee', employeeSchema);
