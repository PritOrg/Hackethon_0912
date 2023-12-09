const mongoose = require('mongoose')

const Approval = new mongoose.Schema({
    id: String,
    leaveRequestId: String,
    approverId: String, // User ID of the approver
    status: String, // Approved, Rejected, Pending, etc.
    comments: String,
    createdAt: Date,
  });
module.exports = new mongoose.model('Approval', Approval);