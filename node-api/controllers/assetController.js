/**
 * Asset Controller
 * HTTP handlers for asset management endpoints
 * 
 * @module controllers/assetController
 */

const assetService = require('../services/assetService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, badRequestResponse, paginatedResponse } = require('../utils/responseHandler');

/**
 * Create a new asset
 * @route   POST /api/assets
 * @access  Admin, IT
 */
const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body);
  createdResponse(res, 'Asset created successfully', asset);
});

/**
 * Get all assets with filtering
 * @route   GET /api/assets
 * @access  Admin, IT, HR
 */
const getAssets = asyncHandler(async (req, res) => {
  const { companyId, category, status, assignedTo, search, page, limit } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const result = await assetService.getAssets({
    companyId,
    category,
    status,
    assignedTo,
    search,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20
  });

  paginatedResponse(res, 'Assets retrieved successfully', result.assets, result.pagination);
});

/**
 * Get assets assigned to current user
 * @route   GET /api/assets/me
 * @access  All authenticated users
 */
const getMyAssets = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const assets = await assetService.getMyAssets(employeeId);

  successResponse(res, 'My assets retrieved successfully', assets);
});

/**
 * Get asset by ID
 * @route   GET /api/assets/:id
 * @access  Admin, IT, HR
 */
const getAssetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const asset = await assetService.getAssetById(id);

  successResponse(res, 'Asset retrieved successfully', asset);
});

/**
 * Update asset
 * @route   PUT /api/assets/:id
 * @access  Admin, IT
 */
const updateAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const asset = await assetService.updateAsset(id, req.body);

  successResponse(res, 'Asset updated successfully', asset);
});

/**
 * Assign asset to employee
 * @route   POST /api/assets/:id/assign
 * @access  Admin, IT
 */
const assignAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employeeId, expectedReturnDate, remarks } = req.body;

  if (!employeeId) {
    return badRequestResponse(res, 'Employee ID is required');
  }

  const asset = await assetService.assignAsset(id, {
    employeeId,
    expectedReturnDate,
    remarks
  });

  successResponse(res, 'Asset assigned successfully', asset);
});

/**
 * Return asset from employee
 * @route   POST /api/assets/:id/return
 * @access  Admin, IT
 */
const returnAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { condition, remarks } = req.body;

  if (!condition) {
    return badRequestResponse(res, 'Asset condition is required');
  }

  const asset = await assetService.returnAsset(id, {
    condition,
    remarks
  });

  successResponse(res, 'Asset returned successfully', asset);
});

/**
 * Add maintenance record
 * @route   POST /api/assets/:id/maintenance
 * @access  Admin, IT
 */
const addMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const asset = await assetService.addMaintenance(id, req.body);

  successResponse(res, 'Maintenance record added successfully', asset);
});

/**
 * Delete asset (soft delete)
 * @route   DELETE /api/assets/:id
 * @access  Admin, IT
 */
const deleteAsset = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await assetService.deleteAsset(id);

  successResponse(res, result.message);
});

/**
 * Get asset statistics
 * @route   GET /api/assets/stats/:companyId
 * @access  Admin, IT, HR
 */
const getAssetStats = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const stats = await assetService.getAssetStats(companyId);

  successResponse(res, 'Asset statistics retrieved successfully', stats);
});

module.exports = {
  createAsset,
  getAssets,
  getMyAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  returnAsset,
  addMaintenance,
  deleteAsset,
  getAssetStats
};
