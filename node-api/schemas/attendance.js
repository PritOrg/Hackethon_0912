const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: Date, default: Date.now, required: true }, 
  clockIn: { type: Date },
  clockOut: { type: Date },
  totalHours: { type: Number, default: 0 }, 
  overtime: { type: Number, default: 0 }, 
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'On Leave'], default: 'Absent' }, 
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Attendance', attendanceSchema);