/**
 * Company Controller
 * Handles HTTP requests for company operations
 * 
 * @module controllers/companyController
 */

const companyService = require('../services/companyService');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse
} = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Register new company (SaaS)
 * POST /api/company
 * Access: Public
 */
const registerCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  createdResponse(res, company, 'Company registered successfully');
});

/**
 * Get company by ID
 * GET /api/company/:id
 * Access: Admin, HR
 */
const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  successResponse(res, company, 'Company retrieved successfully');
});

/**
 * Update company
 * PUT /api/company/:id
 * Access: Admin
 */
const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(
    req.params.id,
    req.body,
    req.user?.id
  );
  successResponse(res, company, 'Company updated successfully');
});

/**
 * Get company settings
 * GET /api/company/:id/settings
 * Access: Admin, HR
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await companyService.getSettings(req.params.id);
  successResponse(res, settings, 'Settings retrieved successfully');
});

/**
 * Update company settings
 * PUT /api/company/:id/settings
 * Access: Admin
 */
const updateSettings = asyncHandler(async (req, res) => {
  const company = await companyService.updateSettings(
    req.params.id,
    req.body,
    req.user?.id
  );
  successResponse(res, company, 'Settings updated successfully');
});

/**
 * Update subscription
 * PUT /api/company/:id/subscription
 * Access: Admin
 */
const updateSubscription = asyncHandler(async (req, res) => {
  const { status, endDate } = req.body;

  if (!status) {
    return badRequestResponse(res, 'Subscription status is required');
  }

  const company = await companyService.updateSubscription(
    req.params.id,
    status,
    endDate
  );

  successResponse(res, company, 'Subscription updated successfully');
});

/**
 * Get company statistics
 * GET /api/company/:id/stats
 * Access: Admin, HR
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await companyService.getCompanyStats(req.params.id);
  successResponse(res, stats, 'Statistics retrieved successfully');
});

module.exports = {
  registerCompany,
  getCompany,
  updateCompany,
  getSettings,
  updateSettings,
  updateSubscription,
  getStats
};
