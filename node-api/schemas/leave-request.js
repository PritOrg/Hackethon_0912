const mongoose = require('mongoose')

const leaveRequest = new mongoose.Schema({
  "employeeId": String, // Employee making the request
    "startDate": Date,
    "endDate": Date,
    "status": String, // Pending, Approved, Rejected, etc.
    "reason": String,
    "createdAt": Date,
    "leaveType": String,
  });
  module.exports = leaveRequest;