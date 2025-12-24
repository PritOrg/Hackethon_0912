const mongoose = require('mongoose');

// Asset Management Model - Track laptops, phones, licenses assigned to employees
const assetSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true
  },
  
  // Asset Identification
  assetId: { type: String, required: true, unique: true, trim: true }, // e.g., LAP-2025-001
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Laptop', 'Desktop', 'Mobile', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Software License', 'Other'],
    index: true
  },
  subcategory: { type: String, trim: true }, // e.g., MacBook Pro, Dell XPS
  
  // Hardware Details
  manufacturer: { type: String, trim: true },
  model: { type: String, trim: true },
  serialNumber: { type: String, trim: true, unique: true, sparse: true },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    screenSize: String,
    os: String,
    other: String
  },
  
  // Purchase Details
  purchaseDate: Date,
  purchasePrice: Number,
  vendor: String,
  invoiceNumber: String,
  warrantyExpiry: Date,
  
  // Status & Condition
  status: { 
    type: String, 
    enum: ['Available', 'Assigned', 'In Repair', 'Retired', 'Lost', 'Stolen'], 
    default: 'Available',
    index: true
  },
  condition: { 
    type: String, 
    enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'], 
    default: 'New' 
  },
  
  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
  assignedDate: Date,
  returnDate: Date,
  expectedReturnDate: Date,
  
  // Assignment History (Audit trail)
  assignmentHistory: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: String, // Cached for historical records
    assignedDate: Date,
    returnedDate: Date,
    condition: String,
    remarks: String
  }],
  
  // Maintenance
  maintenanceSchedule: [{
    type: { type: String, enum: ['Preventive', 'Corrective'] },
    scheduledDate: Date,
    completedDate: Date,
    cost: Number,
    vendor: String,
    remarks: String
  }],
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  
  // Location
  location: {
    office: String,
    building: String,
    floor: String,
    room: String
  },
  
  // Software Licenses (if applicable)
  licenseDetails: {
    licenseKey: { type: String, select: false }, // Encrypted
    licenseType: { type: String, enum: ['Perpetual', 'Subscription', 'Trial'] },
    validFrom: Date,
    validUntil: Date,
    maxUsers: Number,
    currentUsers: Number
  },
  
  // Documents
  documents: [{
    name: String,
    type: { type: String, enum: ['Invoice', 'Warranty', 'Manual', 'Other'] },
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Depreciation
  depreciationRate: Number, // Annual percentage
  currentValue: Number,
  salvageValue: Number,
  
  // Notes
  remarks: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date
}, { 
  timestamps: true 
});

// Indexes
assetSchema.index({ assetId: 1, companyId: 1 });
assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ serialNumber: 1 });

// Method to calculate current value with depreciation
assetSchema.methods.calculateCurrentValue = function() {
  if (!this.purchasePrice || !this.purchaseDate || !this.depreciationRate) {
    return this.purchasePrice || 0;
  }
  
  const yearsOwned = (Date.now() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  const depreciation = this.purchasePrice * (this.depreciationRate / 100) * yearsOwned;
  this.currentValue = Math.max(this.purchasePrice - depreciation, this.salvageValue || 0);
  
  return this.currentValue;
};

// Method to assign asset to employee
assetSchema.methods.assignToEmployee = async function(employeeId, employeeName, remarks) {
  if (this.status === 'Assigned') {
    throw new Error('Asset is already assigned');
  }
  
  this.assignedTo = employeeId;
  this.assignedDate = new Date();
  this.status = 'Assigned';
  
  this.assignmentHistory.push({
    employeeId,
    employeeName,
    assignedDate: new Date(),
    condition: this.condition,
    remarks
  });
  
  return this.save();
};

// Method to return asset
assetSchema.methods.returnFromEmployee = async function(condition, remarks) {
  if (this.status !== 'Assigned') {
    throw new Error('Asset is not assigned');
  }
  
  const lastAssignment = this.assignmentHistory[this.assignmentHistory.length - 1];
  if (lastAssignment) {
    lastAssignment.returnedDate = new Date();
    lastAssignment.condition = condition;
    if (remarks) lastAssignment.remarks += ` | Return: ${remarks}`;
  }
  
  this.assignedTo = null;
  this.returnDate = new Date();
  this.status = 'Available';
  this.condition = condition;
  
  return this.save();
};

module.exports = mongoose.model('Asset', assetSchema);
