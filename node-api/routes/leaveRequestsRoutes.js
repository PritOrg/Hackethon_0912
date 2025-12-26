/**
 * Leave Request Routes
 * Defines all leave request-related endpoints with proper MVC structure
 * 
 * @module routes/leaveRequestRoutes
 */

const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/leaves
 * @desc    Apply for leave
 * @access  All authenticated users
 */
router.post('/', authMiddleware, leaveRequestController.applyLeave);

/**
 * @route   GET /api/leaves/me
 * @desc    Get my leave history
 * @access  All authenticated users
 */
router.get('/me', authMiddleware, leaveRequestController.getMyLeaves);

/**
 * @route   GET /api/leaves/balance
 * @desc    Get my leave balance
 * @access  All authenticated users
 */
router.get('/balance', authMiddleware, leaveRequestController.getBalance);

/**
 * @route   GET /api/leaves/pending
 * @desc    Get pending approvals for manager
 * @access  Manager, HR
 */
router.get('/pending', authMiddleware, leaveRequestController.getPendingApprovals);

/**
 * @route   GET /api/leaves/calendar
 * @desc    Get team leave calendar
 * @access  All authenticated users
 */
router.get('/calendar', authMiddleware, leaveRequestController.getCalendar);

/**
 * @route   GET /api/leaves/stats
 * @desc    Get leave statistics
 * @access  Admin, HR, Manager
 */
router.get('/stats', authMiddleware, leaveRequestController.getStats);

/**
 * @route   GET /api/leaves/:id
 * @desc    Get leave request by ID
 * @access  All authenticated users
 */
router.get('/:id', authMiddleware, leaveRequestController.getLeaveById);

/**
 * @route   GET /api/leaves
 * @desc    Get all leave requests with filtering
 * @access  Admin, HR, Manager
 */
router.get('/', authMiddleware, leaveRequestController.getAllLeaves);

/**
 * @route   PUT /api/leaves/:id/approve
 * @desc    Approve or reject leave request
 * @access  Manager, HR
 */
router.put('/:id/approve', authMiddleware, leaveRequestController.processLeave);

/**
 * @route   PUT /api/leaves/:id/cancel
 * @desc    Cancel leave request
 * @access  Employee (own requests only)
 */
router.put('/:id/cancel', authMiddleware, leaveRequestController.cancelLeave);

module.exports = router;
