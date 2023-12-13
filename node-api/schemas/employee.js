const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema( {
    username: String,
    email: String,
    password: String,
    role: String,
    leaveRequests: [
      {
        startDate: String,
        endDate: String,
        status: String
      }
    ]
  });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;