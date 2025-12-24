const mongoose = require('mongoose');

// Industry-Grade Attendance Model with Breaks, Geo-fencing, and Device Tracking
const attendanceSchema = new mongoose.Schema({
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
  date: { 
    type: Date, 
    required: true, 
    index: true 
  }, // Normalized to midnight UTC
  
  // Support multiple shifts/breaks in one day
  shifts: [{
    clockIn: { type: Date, required: true },
    clockOut: Date,
    
    // Geo-fencing data
    inLocation: { 
      lat: Number, 
      lng: Number, 
      address: String,
      accuracy: Number // GPS accuracy in meters
    },
    outLocation: { 
      lat: Number, 
      lng: Number, 
      address: String,
      accuracy: Number
    },
    
    // Device information (prevent buddy punching)
    deviceInfo: String, // e.g., "iPhone 13 - Safari 15.0"
    ipAddress: String,
    userAgent: String,
    
    // Break tracking (NEW - Critical for labor law compliance)
    breaks: [{
      startTime: { type: Date, required: true },
      endTime: Date,
      type: { 
        type: String, 
        enum: ['Lunch', 'Tea', 'Personal', 'Other'], 
        default: 'Personal' 
      },
      duration: Number // Minutes
    }],
    
    // Calculated fields
    grossHours: Number, // Total time between clock in/out
    netHours: Number, // Gross hours minus breaks
    overtimeHours: Number
  }],
  
  // Daily summary
  totalHours: { type: Number, default: 0 }, // Net hours for the day
  totalBreakTime: { type: Number, default: 0 }, // Minutes
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half-Day', 'Late', 'Holiday', 'Weekend', 'On Leave'], 
    required: true,
    index: true
  },
  
  // Flags
  isLate: { type: Boolean, default: false },
  lateBy: { type: Number, default: 0 }, // Minutes
  isEarlyLeave: { type: Boolean, default: false },
  earlyBy: { type: Number, default: 0 }, // Minutes
  
  // Regularization (If employee forgot to punch out)
  isRegularized: { type: Boolean, default: false },
  regularizationReason: String,
  regularizationApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  regularizationApprovedAt: Date,
  
  // Notes
  remarks: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true 
});

// Ensure one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ status: 1, date: 1 });

// Method to calculate hours
attendanceSchema.methods.calculateHours = function() {
  let totalGross = 0;
  let totalBreaks = 0;
  
  this.shifts.forEach(shift => {
    if (shift.clockIn && shift.clockOut) {
      const gross = (shift.clockOut - shift.clockIn) / (1000 * 60 * 60); // hours
      totalGross += gross;
      
      if (shift.breaks && shift.breaks.length > 0) {
        shift.breaks.forEach(brk => {
          if (brk.startTime && brk.endTime) {
            const breakDuration = (brk.endTime - brk.startTime) / (1000 * 60); // minutes
            brk.duration = breakDuration;
            totalBreaks += breakDuration;
          }
        });
      }
      
      shift.grossHours = gross;
      shift.netHours = gross - (totalBreaks / 60);
    }
  });
  
  this.totalHours = totalGross - (totalBreaks / 60);
  this.totalBreakTime = totalBreaks;
  
  return this.totalHours;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
