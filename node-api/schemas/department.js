const mongoose = require('mongoose');

// Department Model - Separate from Company for scalability
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },
  code: { type: String, trim: true }, // e.g., ENG, HR, FIN
  description: { type: String, trim: true },
  
  // Department head/manager
  headId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  
  // Parent department for hierarchy (e.g., Backend under Engineering)
  parentDepartmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department' 
  },
  
  // Financial management
  budget: { type: Number },
  budgetPeriod: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly'] },
  
  // Location (if multi-office company)
  location: { type: String, trim: true },
  
  // Settings specific to this department
  settings: {
    requiresApproval: { type: Boolean, default: false }, // For transfers
    autoAssignProjects: { type: Boolean, default: false }
  },
  
  // Audit fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for uniqueness
departmentSchema.index({ name: 1, companyId: 1 }, { unique: true });

// Virtual for employee count in department
departmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { isDeleted: false, status: 'Active' }
});

module.exports = mongoose.model('Department', departmentSchema);
