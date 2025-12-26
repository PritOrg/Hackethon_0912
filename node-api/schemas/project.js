const mongoose = require('mongoose');

// Industry-Grade Project Model with Resource Allocation and Billing
const projectSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, unique: true, sparse: true }, // Project code (e.g., PROJ-2025-001)
  description: String,
  
  // Client Information
  client: {
    name: String,
    email: String,
    phone: String,
    company: String,
    contactPerson: String
  },
  
  // Timeline
  startDate: { type: Date, required: true, index: true },
  endDate: Date,
  estimatedDuration: Number, // In days
  actualDuration: Number,
  
  // Status & Priority
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived'], 
    default: 'Planning',
    index: true
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  
  // Billing & Budget (NEW)
  billingType: { 
    type: String, 
    enum: ['Fixed', 'Hourly', 'Milestone', 'Non-Billable'], 
    default: 'Fixed' 
  },
  budget: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    spent: { type: Number, default: 0 },
    remaining: Number
  },
  hourlyRate: Number, // For hourly billing
  
  // Milestones (NEW - Critical for project tracking)
  milestones: [{
    name: { type: String, required: true },
    description: String,
    dueDate: Date,
    completedDate: Date,
    status: { 
      type: String, 
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'], 
      default: 'Pending' 
    },
    paymentAmount: Number, // For milestone-based billing
    deliverables: [String],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
  }],
  
  // Team Management
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    required: true
  },
  members: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    role: { type: String, default: 'Developer' }, // Developer, Designer, QA, etc.
    allocation: { type: Number, default: 100 }, // % of time allocated (0-100)
    billable: { type: Boolean, default: true },
    hourlyRate: Number,
    startDate: Date,
    endDate: Date
  }],
  
  // Technology Stack
  technologies: [{ type: String, trim: true }],
  
  // Repository & Links
  repository: {
    url: String,
    branch: String,
    accessToken: { type: String, select: false }
  },
  links: {
    documentation: String,
    staging: String,
    production: String,
    design: String
  },
  
  // Risk Management
  risks: [{
    description: String,
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    mitigation: String,
    status: { type: String, enum: ['Open', 'Mitigated', 'Closed'] }
  }],
  
  // Documents
  documents: [{
    name: String,
    type: { type: String, enum: ['Proposal', 'Contract', 'Specification', 'Report', 'Other'] },
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Progress
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
projectSchema.index({ name: 1, companyId: 1 });
projectSchema.index({ status: 1, startDate: -1 });
projectSchema.index({ 'members.employeeId': 1 });

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return this.members ? this.members.length : 0;
});

// Method to calculate budget remaining
projectSchema.methods.updateBudget = function() {
  if (this.budget && this.budget.amount) {
    this.budget.remaining = this.budget.amount - (this.budget.spent || 0);
  }
  return this;
};

// Method to check if project is on track
projectSchema.methods.isOnTrack = function() {
  if (!this.endDate) return true;
  
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const elapsed = now - this.startDate;
  const expectedProgress = (elapsed / totalDuration) * 100;
  
  return this.completionPercentage >= expectedProgress - 10; // 10% tolerance
};

module.exports = mongoose.model('Project', projectSchema);
