const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema( {
    username: String,
    email: String,
    password: String,
    role: String,
    leaveRequests: [
      {
        _id: String,
        startDate: String,
        endDate: String,
        status: String,
        reason: String,
        createdAt: Date,
      }
    ]
  });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;