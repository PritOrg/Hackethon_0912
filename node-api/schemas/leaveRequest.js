const mongoose = require('mongoose')

const leaveRequestSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reason: String,
  leaveType: { type: String, enum: ['Half Day', 'Full Day', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave', 'Privilege Leave'] },
  approverId: {type: mongoose.Schema.Types.ObjectId, ref: 'Employee'}, 
  approverComment: String, 
  acceptedDate: {type: Date,default:Date.now()},
  createdAt: { type: Date, default: Date.now() }, 
});
module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);