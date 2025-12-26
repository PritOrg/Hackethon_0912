/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 * 
 * @module controllers/authController
 */

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse 
} = require('../utils/responseHandler');

/**
 * Register new company (SaaS setup)
 * @route POST /api/auth/register
 */
const registerCompany = asyncHandler(async (req, res) => {
  const result = await authService.registerCompany(req.body);
  createdResponse(res, result, 'Company registered successfully');
});

/**
 * Login with email/password
 * @route POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return badRequestResponse(res, 'Email and password are required');
  }

  const result = await authService.login(email, password);
  
  if (result.requires2FA) {
    return successResponse(res, result, '2FA verification required');
  }

  successResponse(res, result, 'Login successful');
});

/**
 * Logout (invalidate token)
 * @route POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  successResponse(res, null, 'Logout successful');
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return badRequestResponse(res, 'Refresh token is required');
  }

  const result = await authService.refreshAccessToken(refreshToken);
  successResponse(res, result, 'Token refreshed successfully');
});

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return badRequestResponse(res, 'Email is required');
  }

  const result = await authService.forgotPassword(email);
  successResponse(res, result, 'Password reset instructions sent');
});

/**
 * Reset password using token
 * @route POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return badRequestResponse(res, 'Token and new password are required');
  }

  if (newPassword.length < 8) {
    return badRequestResponse(res, 'Password must be at least 8 characters');
  }

  const result = await authService.resetPassword(token, newPassword);
  successResponse(res, result, 'Password reset successful');
});

/**
 * Setup 2FA (generate QR code)
 * @route POST /api/auth/setup-2fa
 */
const setup2FA = asyncHandler(async (req, res) => {
  const result = await authService.setup2FA(req.user._id);
  successResponse(res, result, '2FA setup initiated');
});

/**
 * Verify 2FA code and enable
 * @route POST /api/auth/verify-2fa
 */
const verify2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return badRequestResponse(res, 'Verification code is required');
  }

  const result = await authService.verify2FA(req.user._id, code);
  successResponse(res, result, '2FA enabled successfully');
});

/**
 * Verify 2FA during login
 * @route POST /api/auth/verify-2fa-login
 */
const verify2FALogin = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body;
  
  if (!tempToken || !code) {
    return badRequestResponse(res, 'Temporary token and code are required');
  }

  const result = await authService.verify2FALogin(tempToken, code);
  successResponse(res, result, 'Login successful');
});

module.exports = {
  registerCompany,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  verify2FALogin
};
