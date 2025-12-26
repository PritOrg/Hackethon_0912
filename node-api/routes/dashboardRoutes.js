/**
 * Dashboard Routes
 * Defines endpoints for dashboard analytics and global search
 * 
 * @module routes/dashboardRoutes
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('./auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/admin
 * @desc    Headcount, Attrition, Total Payroll Cost
 * @access  Admin
 */
router.get('/admin', dashboardController.getAdminDashboard);

/**
 * @route   GET /api/dashboard/hr
 * @desc    Leave trends, Hiring pipeline, Compliance status
 * @access  HR
 */
router.get('/hr', dashboardController.getHRDashboard);

/**
 * @route   GET /api/dashboard/manager
 * @desc    Team attendance, Project deadlines, Budget usage
 * @access  Manager
 */
router.get('/manager', dashboardController.getManagerDashboard);

/**
 * @route   GET /api/search
 * @desc    Global Search (Employees, Projects, Assets, Files)
 * @access  All authenticated users
 */
router.get('/search', dashboardController.globalSearch);

module.exports = router;
