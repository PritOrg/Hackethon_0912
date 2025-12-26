/**
 * Shift Management Controller
 * Handles HTTP requests for shift and roster management
 * 
 * @module controllers/shiftController
 */

const shiftService = require('../services/shiftService');
const asyncHandler = require('../utils/asyncHandler');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse 
} = require('../utils/responseHandler');

/**
 * Get all shift templates
 * @route GET /api/shifts
 */
const getShifts = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const shifts = await shiftService.getShifts(companyId);
  successResponse(res, shifts, 'Shifts retrieved successfully');
});

/**
 * Create shift template
 * @route POST /api/shifts
 */
const createShift = asyncHandler(async (req, res) => {
  const shift = await shiftService.createShift(req.body, req.user._id);
  createdResponse(res, shift, 'Shift created successfully');
});

/**
 * Assign shift to employee/team
 * @route POST /api/shifts/assign
 */
const assignShift = asyncHandler(async (req, res) => {
  const rosters = await shiftService.assignShift(req.body, req.user._id);
  createdResponse(res, rosters, 'Shift assigned successfully');
});

/**
 * Get team roster/schedule
 * @route GET /api/shifts/roster
 */
const getTeamRoster = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const roster = await shiftService.getTeamRoster(companyId, req.query);
  successResponse(res, roster, 'Team roster retrieved successfully');
});

/**
 * Request shift swap
 * @route PUT /api/shifts/swap
 */
const requestShiftSwap = asyncHandler(async (req, res) => {
  const { rosterId, swapWithEmployeeId, reason } = req.body;

  if (!rosterId || !swapWithEmployeeId) {
    return badRequestResponse(res, 'Roster ID and target employee ID are required');
  }

  const roster = await shiftService.requestShiftSwap(rosterId, {
    requestedBy: req.user._id,
    swapWithEmployeeId,
    reason
  });

  successResponse(res, roster, 'Shift swap request submitted successfully');
});

/**
 * Approve/Reject shift swap
 * @route PUT /api/shifts/swap/:rosterId/approve
 */
const approveShiftSwap = asyncHandler(async (req, res) => {
  const { rosterId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (!action || !['approve', 'reject'].includes(action)) {
    return badRequestResponse(res, 'Valid action (approve/reject) is required');
  }

  const roster = await shiftService.approveShiftSwap(rosterId, {
    approvedBy: req.user._id,
    action
  });

  successResponse(res, roster, `Shift swap ${action}d successfully`);
});

module.exports = {
  getShifts,
  createShift,
  assignShift,
  getTeamRoster,
  requestShiftSwap,
  approveShiftSwap
};
