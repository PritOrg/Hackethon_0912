/**
 * Authentication Routes
 * Defines all authentication and security endpoints
 * 
 * @module routes/authRoutes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('./auth.middleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new company (SaaS setup)
 * @access  Public
 */
router.post('/register', createLimiter, authController.registerCompany);

/**
 * @route   POST /api/auth/register-company
 * @desc    Register new company (SaaS setup) - Alias for /register
 * @access  Public
 */
router.post('/register-company', createLimiter, authController.registerCompany);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post('/login', authLimiter, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', authLimiter, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', authLimiter, authController.resetPassword);

/**
 * @route   POST /api/auth/verify-2fa-login
 * @desc    Verify 2FA code during login
 * @access  Public (requires temp token)
 */
router.post('/verify-2fa-login', authLimiter, authController.verify2FALogin);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (invalidate refresh token)
 * @access  All authenticated users
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  All authenticated users
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/setup-2fa
 * @desc    Generate QR code for 2FA setup
 * @access  All authenticated users
 */
router.post('/setup-2fa', authMiddleware, authController.setup2FA);

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Verify and enable 2FA
 * @access  All authenticated users
 */
router.post('/verify-2fa', authMiddleware, authController.verify2FA);

module.exports = router;
