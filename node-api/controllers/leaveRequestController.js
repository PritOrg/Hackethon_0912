/**
 * Leave Request Controller
 * Handles HTTP requests for leave request operations
 * 
 * @module controllers/leaveRequestController
 */

const leaveRequestService = require('../services/leaveRequestService');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse,
  paginatedResponse
} = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Apply for leave
 * POST /api/leaves
 * Access: All
 */
const applyLeave = asyncHandler(async (req, res) => {
  const leaveRequest = await leaveRequestService.createLeaveRequest(req.body);
  createdResponse(res, leaveRequest, 'Leave request submitted successfully');
});

/**
 * Get my leave history
 * GET /api/leaves/me
 * Access: All
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const filters = {
    employeeId: req.user.id,
    status: req.query.status,
    leaveType: req.query.leaveType,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const { requests, total } = await leaveRequestService.getLeaveRequests(filters);
  
  paginatedResponse(
    res,
    requests,
    filters.page,
    filters.limit,
    total,
    'Leave requests retrieved successfully'
  );
});

/**
 * Get all leave requests
 * GET /api/leaves
 * Access: Admin, HR, Manager
 */
const getAllLeaves = asyncHandler(async (req, res) => {
  const filters = {
    companyId: req.query.companyId,
    employeeId: req.query.employeeId,
    status: req.query.status,
    leaveType: req.query.leaveType,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const { requests, total } = await leaveRequestService.getLeaveRequests(filters);
  
  paginatedResponse(
    res,
    requests,
    filters.page,
    filters.limit,
    total,
    'Leave requests retrieved successfully'
  );
});

/**
 * Get leave request by ID
 * GET /api/leaves/:id
 * Access: All (with ownership check)
 */
const getLeaveById = asyncHandler(async (req, res) => {
  const leaveRequest = await leaveRequestService.getLeaveRequestById(req.params.id);
  successResponse(res, leaveRequest, 'Leave request retrieved successfully');
});

/**
 * Get my leave balance
 * GET /api/leaves/balance
 * Access: All
 */
const getBalance = asyncHandler(async (req, res) => {
  const balance = await leaveRequestService.getLeaveBalance(req.user.id);
  successResponse(res, balance, 'Leave balance retrieved successfully');
});

/**
 * Get pending approvals
 * GET /api/leaves/pending
 * Access: Manager, HR
 */
const getPendingApprovals = asyncHandler(async (req, res) => {
  const requests = await leaveRequestService.getPendingApprovals(req.user.id);
  successResponse(res, requests, 'Pending approvals retrieved successfully');
});

/**
 * Approve or reject leave request
 * PUT /api/leaves/:id/approve
 * Access: Manager, HR
 */
const processLeave = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return badRequestResponse(res, 'Valid status (Approved/Rejected) is required');
  }

  const leaveRequest = await leaveRequestService.processLeaveRequest(
    req.params.id,
    req.user.id,
    status,
    comment
  );

  successResponse(res, leaveRequest, `Leave request ${status.toLowerCase()}`);
});

/**
 * Cancel leave request
 * PUT /api/leaves/:id/cancel
 * Access: Employee (own requests only)
 */
const cancelLeave = asyncHandler(async (req, res) => {
  const leaveRequest = await leaveRequestService.cancelLeaveRequest(
    req.params.id,
    req.user.id
  );

  successResponse(res, leaveRequest, 'Leave request cancelled successfully');
});

/**
 * Get leave calendar
 * GET /api/leaves/calendar
 * Access: All
 */
const getCalendar = asyncHandler(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return badRequestResponse(res, 'Company ID, start date, and end date are required');
  }

  const calendar = await leaveRequestService.getLeaveCalendar(companyId, startDate, endDate);
  successResponse(res, calendar, 'Leave calendar retrieved successfully');
});

/**
 * Get leave statistics
 * GET /api/leaves/stats
 * Access: Admin, HR, Manager
 */
const getStats = asyncHandler(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return badRequestResponse(res, 'Company ID, start date, and end date are required');
  }

  const stats = await leaveRequestService.getLeaveStatistics(companyId, startDate, endDate);
  successResponse(res, stats, 'Statistics retrieved successfully');
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  getBalance,
  getPendingApprovals,
  processLeave,
  cancelLeave,
  getCalendar,
  getStats
};
