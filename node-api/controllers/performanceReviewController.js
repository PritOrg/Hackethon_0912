/**
 * Performance Review Controller
 * HTTP handlers for performance review endpoints
 * 
 * @module controllers/performanceReviewController
 */

const performanceReviewService = require('../services/performanceReviewService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, badRequestResponse, paginatedResponse } = require('../utils/responseHandler');

/**
 * Initiate a new performance review
 * @route   POST /api/reviews
 * @access  Admin, HR
 */
const initiateReview = asyncHandler(async (req, res) => {
  const review = await performanceReviewService.initiateReview(req.body);
  createdResponse(res, 'Performance review initiated successfully', review);
});

/**
 * Get all reviews with filtering
 * @route   GET /api/reviews
 * @access  Admin, HR, Manager
 */
const getReviews = asyncHandler(async (req, res) => {
  const { companyId, employeeId, reviewerId, status, reviewType, page, limit } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const result = await performanceReviewService.getReviews({
    companyId,
    employeeId,
    reviewerId,
    status,
    reviewType,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20
  });

  paginatedResponse(res, 'Reviews retrieved successfully', result.reviews, result.pagination);
});

/**
 * Get my reviews (as employee)
 * @route   GET /api/reviews/me
 * @access  All authenticated users
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const reviews = await performanceReviewService.getMyReviews(employeeId);

  successResponse(res, 'My reviews retrieved successfully', reviews);
});

/**
 * Get team reviews (as manager)
 * @route   GET /api/reviews/team
 * @access  Manager
 */
const getTeamReviews = asyncHandler(async (req, res) => {
  const managerId = req.user._id;

  const reviews = await performanceReviewService.getTeamReviews(managerId);

  successResponse(res, 'Team reviews retrieved successfully', reviews);
});

/**
 * Get review by ID
 * @route   GET /api/reviews/:id
 * @access  Admin, HR, Manager, Employee (own reviews)
 */
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await performanceReviewService.getReviewById(id);

  successResponse(res, 'Review retrieved successfully', review);
});

/**
 * Submit self-assessment
 * @route   PUT /api/reviews/:id/self
 * @access  Employee
 */
const submitSelfAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await performanceReviewService.submitSelfAssessment(id, req.body);

  successResponse(res, 'Self-assessment submitted successfully', review);
});

/**
 * Submit manager assessment
 * @route   PUT /api/reviews/:id/manager
 * @access  Manager
 */
const submitManagerAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await performanceReviewService.submitManagerAssessment(id, req.body);

  successResponse(res, 'Manager assessment submitted successfully', review);
});

/**
 * Add peer feedback
 * @route   POST /api/reviews/:id/peer-feedback
 * @access  All authenticated users
 */
const addPeerFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await performanceReviewService.addPeerFeedback(id, {
    ...req.body,
    peerId: req.user._id
  });

  successResponse(res, 'Peer feedback added successfully', review);
});

/**
 * Acknowledge review (employee sign-off)
 * @route   PUT /api/reviews/:id/acknowledge
 * @access  Employee
 */
const acknowledgeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;

  const review = await performanceReviewService.acknowledgeReview(id, comments);

  successResponse(res, 'Review acknowledged successfully', review);
});

/**
 * Update review status
 * @route   PUT /api/reviews/:id/status
 * @access  Admin, HR
 */
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return badRequestResponse(res, 'Status is required');
  }

  const review = await performanceReviewService.updateReviewStatus(id, status);

  successResponse(res, 'Review status updated successfully', review);
});

/**
 * Get review report
 * @route   GET /api/reviews/:id/report
 * @access  Admin, HR, Manager
 */
const getReviewReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await performanceReviewService.getReviewReport(id);

  successResponse(res, 'Review report generated successfully', report);
});

/**
 * Get review statistics
 * @route   GET /api/reviews/stats/:companyId
 * @access  Admin, HR
 */
const getReviewStats = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const stats = await performanceReviewService.getReviewStats(companyId);

  successResponse(res, 'Review statistics retrieved successfully', stats);
});

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
