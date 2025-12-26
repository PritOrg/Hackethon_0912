
/**
 * Attendance Routes
 * Defines all attendance-related endpoints with proper MVC structure
 * 
 * @module routes/attendanceRoutes
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/attendance/clock-in
 * @desc    Clock in for the day
 * @access  All authenticated users
 */
router.post('/clock-in', authMiddleware, attendanceController.clockIn);

/**
 * @route   POST /api/attendance/clock-out
 * @desc    Clock out for the day
 * @access  All authenticated users
 */
router.post('/clock-out', authMiddleware, attendanceController.clockOut);

/**
 * @route   POST /api/attendance/break/start
 * @desc    Start a break
 * @access  All authenticated users
 */
router.post('/break/start', authMiddleware, attendanceController.startBreak);

/**
 * @route   POST /api/attendance/break/end
 * @desc    End a break
 * @access  All authenticated users
 */
router.post('/break/end', authMiddleware, attendanceController.endBreak);

/**
 * @route   GET /api/attendance/me
 * @desc    Get my attendance history
 * @access  All authenticated users
 */
router.get('/me', authMiddleware, attendanceController.getMyAttendance);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  Admin, HR, Manager
 */
router.get('/stats', authMiddleware, attendanceController.getStats);

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records with filtering
 * @access  Admin, HR, Manager
 */
router.get('/', authMiddleware, attendanceController.getAllAttendance);

/**
 * @route   POST /api/attendance/regularize
 * @desc    Request attendance regularization
 * @access  All authenticated users
 */
router.post('/regularize', authMiddleware, attendanceController.requestRegularization);

/**
 * @route   PUT /api/attendance/:id/approve
 * @desc    Approve/reject regularization request
 * @access  Manager, HR
 */
router.put('/:id/approve', authMiddleware, attendanceController.approveRegularization);

module.exports = router;