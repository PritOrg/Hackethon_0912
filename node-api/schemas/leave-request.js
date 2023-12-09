const mongoose = require('mongoose')

const LeaveRequest = new mongoose.Schema({
    "userId": String, // User making the request
    "startDate": Date,
    "endDate": Date,
    "status": String, // Pending, Approved, Rejected, etc.
    "reason": String,
    "createdAt": Date,
  });
module.exports = new mongoose.model('LeaveRequest', LeaveRequest);
  