/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard and analytics
 * 
 * @module controllers/dashboardController
 */

const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, badRequestResponse } = require('../utils/responseHandler');

/**
 * Get Admin Dashboard
 * @route GET /api/dashboard/admin
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const dashboard = await dashboardService.getAdminDashboard(companyId);
  successResponse(res, dashboard, 'Admin dashboard retrieved successfully');
});

/**
 * Get HR Dashboard
 * @route GET /api/dashboard/hr
 */
const getHRDashboard = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const dashboard = await dashboardService.getHRDashboard(companyId);
  successResponse(res, dashboard, 'HR dashboard retrieved successfully');
});

/**
 * Get Manager Dashboard
 * @route GET /api/dashboard/manager
 */
const getManagerDashboard = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const dashboard = await dashboardService.getManagerDashboard(req.user._id, companyId);
  successResponse(res, dashboard, 'Manager dashboard retrieved successfully');
});

/**
 * Global Search
 * @route GET /api/search
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { companyId, q } = req.query;

  if (!companyId || !q) {
    return badRequestResponse(res, 'Company ID and search term are required');
  }

  if (q.length < 2) {
    return badRequestResponse(res, 'Search term must be at least 2 characters');
  }

  const results = await dashboardService.globalSearch(companyId, q);
  successResponse(res, results, 'Search results retrieved successfully');
});

module.exports = {
  getAdminDashboard,
  getHRDashboard,
  getManagerDashboard,
  globalSearch
};
