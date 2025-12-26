/**
 * Company Routes
 * Defines all company-related endpoints with proper MVC structure
 * 
 * @module routes/companyRoutes
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/company
 * @desc    Register new company (SaaS)
 * @access  Public
 */
router.post('/', companyController.registerCompany);

/**
 * @route   GET /api/company/:id
 * @desc    Get company by ID
 * @access  Admin, HR
 */
router.get('/:id', authMiddleware, companyController.getCompany);

/**
 * @route   PUT /api/company/:id
 * @desc    Update company
 * @access  Admin
 */
router.put('/:id', authMiddleware, companyController.updateCompany);

/**
 * @route   GET /api/company/:id/settings
 * @desc    Get company settings
 * @access  Admin, HR
 */
router.get('/:id/settings', authMiddleware, companyController.getSettings);

/**
 * @route   PUT /api/company/:id/settings
 * @desc    Update company settings
 * @access  Admin
 */
router.put('/:id/settings', authMiddleware, companyController.updateSettings);

/**
 * @route   PUT /api/company/:id/subscription
 * @desc    Update subscription status
 * @access  Admin
 */
router.put('/:id/subscription', authMiddleware, companyController.updateSubscription);

/**
 * @route   GET /api/company/:id/stats
 * @desc    Get company statistics
 * @access  Admin, HR
 */
router.get('/:id/stats', authMiddleware, companyController.getStats);

module.exports = router;