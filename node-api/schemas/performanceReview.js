const mongoose = require('mongoose');

// Performance Review Model - Appraisals, KPIs, and Feedback
const performanceReviewSchema = new mongoose.Schema({
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
  
  // Review Details
  reviewType: { 
    type: String, 
    enum: ['Probation', 'Annual', 'Mid-Year', 'Quarterly', 'Project-End', 'Spot'], 
    required: true,
    index: true
  },
  reviewPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  reviewDate: { type: Date, default: Date.now },
  
  // Reviewer Information
  reviewerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  reviewerRole: { type: String, enum: ['Manager', 'HR', 'Peer', 'Self'] },
  
  // Status
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Under Review', 'Completed', 'Acknowledged'], 
    default: 'Draft',
    index: true
  },
  
  // Overall Rating
  overallRating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    required: true 
  }, // 1-5 scale
  overallComments: String,
  
  // KPI Scores (Key Performance Indicators)
  kpis: [{
    name: { type: String, required: true }, // e.g., "Quality of Work", "Communication"
    description: String,
    weight: { type: Number, default: 1 }, // For weighted average
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: String,
    evidence: [String] // URLs to supporting documents/work
  }],
  
  // Competencies Assessment
  competencies: {
    technical: [{
      skill: String,
      currentLevel: { type: Number, min: 1, max: 5 },
      targetLevel: { type: Number, min: 1, max: 5 },
      comments: String
    }],
    behavioral: [{
      trait: String, // e.g., Leadership, Teamwork, Communication
      rating: { type: Number, min: 1, max: 5 },
      comments: String
    }]
  },
  
  // Achievements & Highlights
  achievements: [String],
  strengths: [String],
  areasForImprovement: [String],
  
  // Goals
  previousGoals: [{
    goal: String,
    targetDate: Date,
    achieved: { type: Boolean, default: false },
    achievementPercentage: Number,
    comments: String
  }],
  newGoals: [{
    goal: String,
    targetDate: Date,
    kpi: String,
    supportNeeded: String
  }],
  
  // Training & Development
  trainingRecommendations: [{
    title: String,
    type: { type: String, enum: ['Course', 'Workshop', 'Certification', 'Mentoring'] },
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    estimatedCost: Number,
    estimatedDuration: String
  }],
  
  // Career Path
  careerDiscussion: {
    currentRole: String,
    desiredRole: String,
    timeline: String, // e.g., "6 months", "1 year"
    readinessLevel: { type: String, enum: ['Ready Now', 'Ready Soon', 'Needs Development'] },
    requiredSkills: [String]
  },
  
  // Compensation Discussion
  compensationReview: {
    currentSalary: { type: Number, select: false },
    recommendedIncrease: Number, // Percentage
    bonus: Number,
    effectiveDate: Date,
    justification: String
  },
  
  // Employee Self-Assessment (if applicable)
  selfAssessment: {
    overallRating: { type: Number, min: 1, max: 5 },
    achievements: [String],
    challenges: [String],
    supportNeeded: String,
    careerAspirations: String,
    comments: String,
    submittedDate: Date
  },
  
  // Additional Feedback (360-degree)
  peerFeedback: [{
    peerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    peerName: String,
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    submittedDate: Date
  }],
  
  // Action Items
  actionItems: [{
    description: String,
    owner: { type: String, enum: ['Employee', 'Manager', 'HR'] },
    dueDate: Date,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    completedDate: Date
  }],
  
  // Sign-off
  employeeAcknowledged: { type: Boolean, default: false },
  employeeAcknowledgedDate: Date,
  employeeComments: String,
  managerApproved: { type: Boolean, default: false },
  managerApprovedDate: Date,
  hrApproved: { type: Boolean, default: false },
  hrApprovedDate: Date,
  
  // Documents
  attachments: [String], // URLs to supporting documents
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { 
  timestamps: true 
});

// Indexes
performanceReviewSchema.index({ employeeId: 1, reviewDate: -1 });
performanceReviewSchema.index({ companyId: 1, status: 1 });
performanceReviewSchema.index({ reviewType: 1, 'reviewPeriod.startDate': 1 });

// Method to calculate weighted KPI score
performanceReviewSchema.methods.calculateWeightedScore = function() {
  if (!this.kpis || this.kpis.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  this.kpis.forEach(kpi => {
    totalWeight += kpi.weight || 1;
    weightedSum += (kpi.rating * (kpi.weight || 1));
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

// Method to check if review is overdue
performanceReviewSchema.methods.isOverdue = function() {
  return this.status !== 'Completed' && 
         this.reviewPeriod.endDate < new Date();
};

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
