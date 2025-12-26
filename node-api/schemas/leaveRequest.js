const mongoose = require('mongoose');

// Industry-Grade Leave Request Model with Approval Workflow
const leaveRequestSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true
  },
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true, 
    index: true 
  },
  
  // Leave Details
  leaveType: { 
    type: String, 
    enum: ['Sick', 'Casual', 'Earned', 'Annual', 'Privilege', 'Maternity', 'Paternity', 'Unpaid', 'Half-Day'], 
    required: true,
    index: true
  },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true },
  dayCount: { type: Number, required: true }, // e.g., 0.5 for half day, 1.5 for 1.5 days
  
  // Request Information
  reason: { type: String, required: true },
  attachments: [String], // S3/CDN URLs for medical certificates, etc.
  
  // Status
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Withdrawn'], 
    default: 'Pending',
    index: true
  },
  
  // Approval Workflow (CRITICAL - Audit trail)
  workflow: [{
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    approverName: String, // Cached for historical records
    approverRole: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], required: true },
    comment: String,
    actionDate: { type: Date, default: Date.now },
    notificationSent: { type: Boolean, default: false }
  }],
  
  // Additional Fields
  isEmergency: { type: Boolean, default: false },
  contactDuringLeave: {
    phone: String,
    alternateEmail: String,
    address: String
  },
  
  // Handover details (for managers/seniors)
  handoverTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  handoverNotes: String,
  
  // Cancel/Withdraw
  cancellationReason: String,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  cancelledAt: Date,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ companyId: 1, status: 1, startDate: -1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if currently on leave
leaveRequestSchema.virtual('isCurrentlyOnLeave').get(function() {
  const now = new Date();
  return this.status === 'Approved' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Method to calculate day count including weekends/holidays
leaveRequestSchema.methods.calculateDayCount = function(workingDays = [1,2,3,4,5], holidays = []) {
  let count = 0;
  let currentDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  while (currentDate <= endDate) {
    const day = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Check if it's a working day and not a holiday
    if (workingDays.includes(day) && !holidays.includes(dateStr)) {
      count++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  this.dayCount = count;
  return count;
};

// Method to add approval step
leaveRequestSchema.methods.addApproval = function(approverId, approverName, approverRole, status, comment) {
  this.workflow.push({
    approverId,
    approverName,
    approverRole,
    status,
    comment,
    actionDate: new Date()
  });
  
  // Update overall status based on workflow
  const allApproved = this.workflow.every(w => w.status === 'Approved');
  const anyRejected = this.workflow.some(w => w.status === 'Rejected');
  
  if (anyRejected) {
    this.status = 'Rejected';
  } else if (allApproved) {
    this.status = 'Approved';
  }
  
  return this.save();
};

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
