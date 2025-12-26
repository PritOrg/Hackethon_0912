/**
 * Performance Review Service
 * Business logic for performance review management
 * Handles review creation, KPIs, goals, and feedback
 * 
 * @module services/performanceReviewService
 */

const PerformanceReview = require('../schemas/performanceReview');
const Employee = require('../schemas/employee');

/**
 * Initiate a performance review
 * @param {Object} reviewData - Review information
 * @returns {Promise<Object>} Created review
 * @throws {Error} If employee or reviewer not found
 */
const initiateReview = async (reviewData) => {
  const { employeeId, reviewerId, companyId } = reviewData;

  // Verify employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Verify reviewer exists
  const reviewer = await Employee.findById(reviewerId);
  if (!reviewer) {
    throw new Error('Reviewer not found');
  }

  // Create review
  const review = new PerformanceReview({
    ...reviewData,
    status: 'Draft',
    reviewDate: new Date()
  });

  await review.save();
  return review.populate('employeeId reviewerId', 'firstName lastName email empCode');
};

/**
 * Get reviews with filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Reviews with pagination
 */
const getReviews = async (filters) => {
  const { 
    companyId,
    employeeId, 
    reviewerId,
    status, 
    reviewType,
    page = 1, 
    limit = 20 
  } = filters;

  // Build query
  const query = { companyId };

  if (employeeId) query.employeeId = employeeId;
  if (reviewerId) query.reviewerId = reviewerId;
  if (status) query.status = status;
  if (reviewType) query.reviewType = reviewType;

  // Count total documents
  const total = await PerformanceReview.countDocuments(query);

  // Fetch reviews
  const reviews = await PerformanceReview.find(query)
    .populate('employeeId', 'firstName lastName email empCode')
    .populate('reviewerId', 'firstName lastName email empCode')
    .sort({ reviewDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get my reviews (as employee)
 * @param {String} employeeId - Employee ID
 * @returns {Promise<Array>} My reviews
 */
const getMyReviews = async (employeeId) => {
  const reviews = await PerformanceReview.find({ employeeId })
    .populate('reviewerId', 'firstName lastName email empCode')
    .sort({ reviewDate: -1 })
    .lean();

  return reviews;
};

/**
 * Get team reviews (as manager)
 * @param {String} managerId - Manager ID
 * @returns {Promise<Array>} Team reviews
 */
const getTeamReviews = async (managerId) => {
  // Find all employees reporting to this manager
  const teamMembers = await Employee.find({ managerId }).select('_id');
  const employeeIds = teamMembers.map(emp => emp._id);

  const reviews = await PerformanceReview.find({
    employeeId: { $in: employeeIds }
  })
    .populate('employeeId', 'firstName lastName email empCode')
    .sort({ reviewDate: -1 })
    .lean();

  return reviews;
};

/**
 * Get review by ID
 * @param {String} reviewId - Review ID
 * @returns {Promise<Object>} Review details
 * @throws {Error} If review not found
 */
const getReviewById = async (reviewId) => {
  const review = await PerformanceReview.findById(reviewId)
    .populate('employeeId', 'firstName lastName email empCode department')
    .populate('reviewerId', 'firstName lastName email empCode')
    .populate('peerFeedback.peerId', 'firstName lastName email empCode')
    .lean();

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

/**
 * Submit self-assessment
 * @param {String} reviewId - Review ID
 * @param {Object} selfAssessmentData - Self-assessment data
 * @returns {Promise<Object>} Updated review
 * @throws {Error} If review not found
 */
const submitSelfAssessment = async (reviewId, selfAssessmentData) => {
  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  review.selfAssessment = {
    ...selfAssessmentData,
    submittedDate: new Date()
  };

  await review.save();
  return review;
};

/**
 * Submit manager assessment
 * @param {String} reviewId - Review ID
 * @param {Object} assessmentData - Manager assessment data
 * @returns {Promise<Object>} Updated review
 * @throws {Error} If review not found
 */
const submitManagerAssessment = async (reviewId, assessmentData) => {
  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  // Update review with manager's assessment
  Object.assign(review, assessmentData);
  review.status = 'Under Review';
  review.managerApproved = true;
  review.managerApprovedDate = new Date();

  await review.save();
  return review.populate('employeeId reviewerId', 'firstName lastName email empCode');
};

/**
 * Add peer feedback
 * @param {String} reviewId - Review ID
 * @param {Object} feedbackData - Peer feedback data
 * @returns {Promise<Object>} Updated review
 * @throws {Error} If review not found
 */
const addPeerFeedback = async (reviewId, feedbackData) => {
  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  // Get peer name
  const peer = await Employee.findById(feedbackData.peerId);
  if (!peer) {
    throw new Error('Peer not found');
  }

  review.peerFeedback.push({
    ...feedbackData,
    peerName: `${peer.firstName} ${peer.lastName}`,
    submittedDate: new Date()
  });

  await review.save();
  return review;
};

/**
 * Acknowledge review (employee sign-off)
 * @param {String} reviewId - Review ID
 * @param {String} comments - Employee comments
 * @returns {Promise<Object>} Updated review
 * @throws {Error} If review not found
 */
const acknowledgeReview = async (reviewId, comments) => {
  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  review.employeeAcknowledged = true;
  review.employeeAcknowledgedDate = new Date();
  review.employeeComments = comments;
  review.status = 'Acknowledged';

  await review.save();
  return review;
};

/**
 * Update review status
 * @param {String} reviewId - Review ID
 * @param {String} status - New status
 * @returns {Promise<Object>} Updated review
 * @throws {Error} If review not found or invalid status
 */
const updateReviewStatus = async (reviewId, status) => {
  const validStatuses = ['Draft', 'Submitted', 'Under Review', 'Completed', 'Acknowledged'];
  
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  review.status = status;

  if (status === 'Completed') {
    review.hrApproved = true;
    review.hrApprovedDate = new Date();
  }

  await review.save();
  return review;
};

/**
 * Get review report (final summary)
 * @param {String} reviewId - Review ID
 * @returns {Promise<Object>} Review report
 * @throws {Error} If review not found
 */
const getReviewReport = async (reviewId) => {
  const review = await getReviewById(reviewId);

  // Calculate weighted KPI score
  let weightedScore = 0;
  if (review.kpis && review.kpis.length > 0) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    review.kpis.forEach(kpi => {
      totalWeight += kpi.weight || 1;
      weightedSum += (kpi.rating * (kpi.weight || 1));
    });
    
    weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Calculate goal achievement percentage
  let goalAchievement = 0;
  if (review.previousGoals && review.previousGoals.length > 0) {
    const achievedGoals = review.previousGoals.filter(g => g.achieved).length;
    goalAchievement = (achievedGoals / review.previousGoals.length) * 100;
  }

  return {
    review,
    metrics: {
      weightedKpiScore: weightedScore.toFixed(2),
      goalAchievementPercentage: goalAchievement.toFixed(2),
      peerFeedbackCount: review.peerFeedback?.length || 0,
      actionItemsTotal: review.actionItems?.length || 0,
      actionItemsCompleted: review.actionItems?.filter(a => a.status === 'Completed').length || 0
    }
  };
};

/**
 * Get performance review statistics
 * @param {String} companyId - Company ID
 * @returns {Promise<Object>} Review statistics
 */
const getReviewStats = async (companyId) => {
  // Count by status
  const statusStats = await PerformanceReview.aggregate([
    { $match: { companyId: companyId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Count by review type
  const typeStats = await PerformanceReview.aggregate([
    { $match: { companyId: companyId } },
    { $group: { _id: '$reviewType', count: { $sum: 1 } } }
  ]);

  // Average overall rating
  const avgRating = await PerformanceReview.aggregate([
    { $match: { companyId: companyId, status: 'Completed' } },
    { $group: { _id: null, avgRating: { $avg: '$overallRating' } } }
  ]);

  // Pending reviews (overdue)
  const overdueReviews = await PerformanceReview.countDocuments({
    companyId,
    status: { $nin: ['Completed', 'Acknowledged'] },
    'reviewPeriod.endDate': { $lt: new Date() }
  });

  const byStatus = {};
  statusStats.forEach(stat => {
    byStatus[stat._id] = stat.count;
  });

  const byType = {};
  typeStats.forEach(stat => {
    byType[stat._id] = stat.count;
  });

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
    byType,
    averageRating: avgRating[0]?.avgRating?.toFixed(2) || 0,
    overdueReviews
  };
};

module.exports = {
  initiateReview,
  getReviews,
  getMyReviews,
  getTeamReviews,
  getReviewById,
  submitSelfAssessment,
  submitManagerAssessment,
  addPeerFeedback,
  acknowledgeReview,
  updateReviewStatus,
  getReviewReport,
  getReviewStats
};
