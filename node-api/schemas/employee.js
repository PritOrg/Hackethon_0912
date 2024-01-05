const mongoose = require('mongoose');
const leaveRequest = require('./leave-request')
const leaveBalance = require('./LeaveBalance')
const employeeSchema = new mongoose.Schema( {
    username: String,
    email: String,
    password: String,
    role: String,
    leaveRequests: [
      leaveRequest
    ],
    leaveBalance: leaveBalance
  });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;