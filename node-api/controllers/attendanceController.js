/**
 * Attendance Controller
 * Handles HTTP requests for attendance-related operations
 * 
 * @module controllers/attendanceController
 */

const attendanceService = require('../services/attendanceService');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse,
  paginatedResponse
} = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Clock in
 * POST /api/attendance/clock-in
 * Access: All
 */
const clockIn = asyncHandler(async (req, res) => {
  const { employeeId, companyId, location, deviceInfo, ipAddress, userAgent } = req.body;

  if (!employeeId || !companyId) {
    return badRequestResponse(res, 'Employee ID and Company ID are required');
  }

  const attendance = await attendanceService.clockIn({
    employeeId,
    companyId,
    location,
    deviceInfo,
    ipAddress: ipAddress || req.ip,
    userAgent: userAgent || req.get('user-agent')
  });

  createdResponse(res, attendance, 'Clocked in successfully');
});

/**
 * Clock out
 * POST /api/attendance/clock-out
 * Access: All
 */
const clockOut = asyncHandler(async (req, res) => {
  const { employeeId, location } = req.body;

  if (!employeeId) {
    return badRequestResponse(res, 'Employee ID is required');
  }

  const attendance = await attendanceService.clockOut(employeeId, location);
  successResponse(res, attendance, 'Clocked out successfully');
});

/**
 * Start break
 * POST /api/attendance/break/start
 * Access: All
 */
const startBreak = asyncHandler(async (req, res) => {
  const { employeeId, breakType } = req.body;

  if (!employeeId) {
    return badRequestResponse(res, 'Employee ID is required');
  }

  const attendance = await attendanceService.startBreak(employeeId, breakType);
  successResponse(res, attendance, 'Break started');
});

/**
 * End break
 * POST /api/attendance/break/end
 * Access: All
 */
const endBreak = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return badRequestResponse(res, 'Employee ID is required');
  }

  const attendance = await attendanceService.endBreak(employeeId);
  successResponse(res, attendance, 'Break ended');
});

/**
 * Get my attendance
 * GET /api/attendance/me
 * Access: All
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const filters = {
    employeeId: req.user.id,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const { records, total } = await attendanceService.getAttendance(filters);
  
  paginatedResponse(
    res,
    records,
    filters.page,
    filters.limit,
    total,
    'Attendance records retrieved successfully'
  );
});

/**
 * Get all attendance
 * GET /api/attendance
 * Access: Admin, HR, Manager
 */
const getAllAttendance = asyncHandler(async (req, res) => {
  const filters = {
    companyId: req.query.companyId,
    employeeId: req.query.employeeId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const { records, total } = await attendanceService.getAttendance(filters);
  
  paginatedResponse(
    res,
    records,
    filters.page,
    filters.limit,
    total,
    'Attendance records retrieved successfully'
  );
});

/**
 * Request regularization
 * POST /api/attendance/regularize
 * Access: All
 */
const requestRegularization = asyncHandler(async (req, res) => {
  const { attendanceId, reason, clockIn, clockOut } = req.body;

  if (!attendanceId || !reason) {
    return badRequestResponse(res, 'Attendance ID and reason are required');
  }

  const attendance = await attendanceService.requestRegularization({
    attendanceId,
    reason,
    clockIn,
    clockOut
  });

  successResponse(res, attendance, 'Regularization request submitted');
});

/**
 * Approve/reject regularization
 * PUT /api/attendance/:id/approve
 * Access: Manager, HR
 */
const approveRegularization = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return badRequestResponse(res, 'Valid status (Approved/Rejected) is required');
  }

  const attendance = await attendanceService.processRegularization(
    req.params.id,
    status,
    req.user.id
  );

  successResponse(res, attendance, `Regularization ${status.toLowerCase()}`);
});

/**
 * Get attendance statistics
 * GET /api/attendance/stats
 * Access: Admin, HR, Manager
 */
const getStats = asyncHandler(async (req, res) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return badRequestResponse(res, 'Company ID, start date, and end date are required');
  }

  const stats = await attendanceService.getAttendanceStats(companyId, startDate, endDate);
  successResponse(res, stats, 'Statistics retrieved successfully');
});

module.exports = {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyAttendance,
  getAllAttendance,
  requestRegularization,
  approveRegularization,
  getStats
};
