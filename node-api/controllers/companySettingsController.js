/**
 * Company Settings Controller
 * Handles HTTP requests for company settings and billing
 * 
 * @module controllers/companySettingsController
 */

const companySettingsService = require('../services/companySettingsService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, badRequestResponse } = require('../utils/responseHandler');

/**
 * Get company settings
 * @route GET /api/company/settings
 */
const getSettings = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const settings = await companySettingsService.getCompanySettings(companyId);
  successResponse(res, settings, 'Company settings retrieved successfully');
});

/**
 * Update company settings
 * @route PUT /api/company/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const settings = await companySettingsService.updateCompanySettings(companyId, req.body);
  successResponse(res, settings, 'Company settings updated successfully');
});

/**
 * Get billing information
 * @route GET /api/company/billing
 */
const getBillingInfo = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const billing = await companySettingsService.getBillingInfo(companyId);
  successResponse(res, billing, 'Billing information retrieved successfully');
});

/**
 * Upgrade subscription plan
 * @route PUT /api/company/billing/upgrade
 */
const upgradeSubscription = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const result = await companySettingsService.upgradeSubscription(companyId, req.body);
  successResponse(res, result, 'Subscription upgraded successfully');
});

/**
 * Get audit logs
 * @route GET /api/company/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { companyId } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const logs = await companySettingsService.getAuditLogs(companyId, req.query);
  successResponse(res, logs, 'Audit logs retrieved successfully');
});

module.exports = {
  getSettings,
  updateSettings,
  getBillingInfo,
  upgradeSubscription,
  getAuditLogs
};
