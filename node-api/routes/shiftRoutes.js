/**
 * Shift Management Routes
 * Defines endpoints for shift templates and roster management
 * 
 * @module routes/shiftRoutes
 */

const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('./auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/shifts
 * @desc    List available shift templates (Morning, Night)
 * @access  Admin, HR
 */
router.get('/', shiftController.getShifts);

/**
 * @route   POST /api/shifts
 * @desc    Create new shift template
 * @access  Admin, HR
 */
router.post('/', createLimiter, shiftController.createShift);

/**
 * @route   POST /api/shifts/assign
 * @desc    Assign shift to employee/team for a date range
 * @access  Manager, HR
 */
router.post('/assign', shiftController.assignShift);

/**
 * @route   GET /api/shifts/roster
 * @desc    View team schedule (Calendar view data)
 * @access  All
 */
router.get('/roster', shiftController.getTeamRoster);

/**
 * @route   PUT /api/shifts/swap
 * @desc    Request shift swap with colleague
 * @access  Employee
 */
router.put('/swap', shiftController.requestShiftSwap);

/**
 * @route   PUT /api/shifts/swap/:rosterId/approve
 * @desc    Approve/Reject shift swap request
 * @access  Manager, HR
 */
router.put('/swap/:rosterId/approve', shiftController.approveShiftSwap);

module.exports = router;
