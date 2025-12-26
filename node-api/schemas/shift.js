/**
 * Shift Schema
 * Manages shift templates and roster assignments
 * 
 * @module schemas/shift
 */

const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true
  },
  
  // Shift Template
  name: { 
    type: String, 
    required: true,
    trim: true // e.g., 'Morning Shift', 'Night Shift', 'Afternoon Shift'
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true // e.g., 'SHIFT-MORNING', 'SHIFT-NIGHT'
  },
  
  // Shift Timing
  startTime: { 
    type: String, 
    required: true // Format: "HH:mm" (e.g., "09:00")
  },
  endTime: { 
    type: String, 
    required: true // Format: "HH:mm" (e.g., "17:00")
  },
  
  // Break Configuration
  breakDuration: { 
    type: Number, 
    default: 60 // Minutes
  },
  
  // Shift Rules
  gracePeriod: { 
    type: Number, 
    default: 15 // Minutes late allowed before marking as late
  },
  minimumHours: { 
    type: Number, 
    default: 8 // Minimum hours to complete shift
  },
  
  // Working Days
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Description
  description: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true 
});

// Roster Assignment Schema
const rosterSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true
  },
  
  // Assignment
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    index: true
  },
  shiftId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift', 
    required: true
  },
  
  // Date Range
  startDate: { 
    type: Date, 
    required: true,
    index: true
  },
  endDate: { 
    type: Date 
  },
  
  // Specific dates (for one-off assignments)
  dates: [Date],
  
  // Recurring pattern
  recurring: {
    enabled: { type: Boolean, default: false },
    pattern: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Daily'
    },
    interval: { type: Number, default: 1 } // Every X days/weeks/months
  },
  
  // Status
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
    default: 'Scheduled',
    index: true
  },
  
  // Swap Request
  swapRequest: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    swapWithEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    requestDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvalDate: Date,
    reason: String
  },
  
  // Notes
  remarks: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true 
});

// Indexes
shiftSchema.index({ companyId: 1, name: 1 });
shiftSchema.index({ code: 1 }, { unique: true });

rosterSchema.index({ companyId: 1, employeeId: 1, startDate: 1 });
rosterSchema.index({ shiftId: 1, startDate: 1 });

const Shift = mongoose.model('Shift', shiftSchema);
const Roster = mongoose.model('Roster', rosterSchema);

module.exports = { Shift, Roster };
