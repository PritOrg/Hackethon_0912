const mongoose = require('mongoose')

const LeaveBalance = new mongoose.Schema({
    id: String,
    userId: String,
    annualLeave: Number,
    meternityLeave: Number,
    privilegeLeave : Number,
    createdAt: Date,
  });
module.exports = new mongoose.model('LeaveBalance',LeaveBalance);
  