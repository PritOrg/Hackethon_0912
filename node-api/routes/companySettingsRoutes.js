/**
 * Company Settings Routes
 * Defines endpoints for company settings and billing management
 * 
 * @module routes/companySettingsRoutes
 */

const express = require('express');
const router = express.Router();
const companySettingsController = require('../controllers/companySettingsController');
const authMiddleware = require('./auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/company/settings
 * @desc    Fetch company rules (Attendance, Leave policies)
 * @access  Admin, HR
 */
router.get('/settings', companySettingsController.getSettings);

/**
 * @route   PUT /api/company/settings
 * @desc    Update rules (e.g., toggle Geo-fencing, set Pay Day)
 * @access  Admin
 */
router.put('/settings', companySettingsController.updateSettings);

/**
 * @route   GET /api/company/billing
 * @desc    View SaaS subscription & invoice history
 * @access  Admin
 */
router.get('/billing', companySettingsController.getBillingInfo);

/**
 * @route   PUT /api/company/billing/upgrade
 * @desc    Upgrade subscription plan
 * @access  Admin
 */
router.put('/billing/upgrade', companySettingsController.upgradeSubscription);

/**
 * @route   GET /api/company/audit-logs
 * @desc    View system-wide audit trail (Who changed what?)
 * @access  Admin
 */
router.get('/audit-logs', companySettingsController.getAuditLogs);

module.exports = router;
