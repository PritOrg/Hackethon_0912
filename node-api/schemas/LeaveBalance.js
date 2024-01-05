const mongoose = require('mongoose')

const leaveBalance = new mongoose.Schema({
    id: String,
    userId: String,
    annualLeave: Number,
    meternityLeave: Number,
    privilegeLeave : Number,
    createdAt: Date,
  });
  module.exports = leaveBalance
  