const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true },
  coordinates: { lat: Number, lng: Number } // For geo-fencing
}, { _id: false });

const contactSchema = new mongoose.Schema({
  phone: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  fax: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false });

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  registrationNumber: { type: String, unique: true, required: true, trim: true }, // EIN/GST/VAT
  domain: { type: String, unique: true, sparse: true, trim: true }, // e.g., @google.com (Auto-join logic)
  logo: { type: String }, // CDN URL
  industry: { type: String, trim: true },
  type: { type: String, trim: true }, // LLC, Corporation, etc.
  description: { type: String, trim: true },
  establishedDate: { type: Date },
  
  address: addressSchema,
  contact: contactSchema,
  
  // Settings for company-wide logic
  settings: {
    attendance: {
      enableGeoFencing: { type: Boolean, default: false },
      allowedRadius: { type: Number, default: 500 }, // meters
      ipRestriction: [String], // Only allow clock-in from office IP
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // 0=Sunday, 1=Monday, etc.
      standardWorkHours: { type: Number, default: 8 },
      lateThreshold: { type: Number, default: 15 } // minutes
    },
    leave: {
      requireManagerApproval: { type: Boolean, default: true },
      requireHRApproval: { type: Boolean, default: false },
      autoApproveHalfDay: { type: Boolean, default: false }
    },
    payroll: {
      currency: { type: String, default: 'USD' },
      payPeriod: { type: String, enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'], default: 'Monthly' },
      payDayOfMonth: { type: Number, default: 1 }
    }
  },
  
  // Admin users who can manage the company
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  
  // Subscription management (SaaS ready)
  subscriptionStatus: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Trial', 'Suspended'], 
    default: 'Trial' 
  },
  subscriptionPlan: { 
    type: String, 
    enum: ['Basic', 'Professional', 'Enterprise'], 
    default: 'Basic' 
  },
  subscriptionExpiry: Date,
  
  // Audit fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isDeleted: { type: Boolean, default: false, index: true }, // Soft delete
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
companySchema.index({ name: 1, isDeleted: 1 });
companySchema.index({ subscriptionStatus: 1 });

// Virtual for active employees count (can be populated)
companySchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'companyId',
  count: true,
  match: { isDeleted: false, status: 'Active' }
});

module.exports = mongoose.model('Company', companySchema);
