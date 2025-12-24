const mongoose = require('mongoose');

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
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true }, 
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true }, 
  profilePic: String, 
  phoneNumber: { type: String, required: true },
  address: { 
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: { 
    name: String,
    relationship: String,
    phoneNumber: String,
  },
  // Organizational Information
  role: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  expertise: [String],
  projects: [String], 
  achievements: [String],
  jobShift: { type: String, enum: ['Morning', 'Evening', 'Night'], required: true },
  leaveRequests: [{type:mongoose.Schema.Types.ObjectId, ref:'LeaveRequest'}],
  leaveBalance: leaveBalanceSchema,
  specialRemarks: String,
  salary: {
    type: Map,
    of: Number,
    required: true,
  },
  department: { type: String, required: true }, 
  position: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Employee', employeeSchema);
