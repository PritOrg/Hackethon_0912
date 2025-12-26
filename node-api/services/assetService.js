/**
 * Asset Service
 * Business logic for asset management
 * Handles asset lifecycle, assignments, maintenance, and tracking
 * 
 * @module services/assetService
 */

const Asset = require('../schemas/asset');
const Employee = require('../schemas/employee');

/**
 * Create a new asset
 * @param {Object} assetData - Asset information
 * @returns {Promise<Object>} Created asset
 * @throws {Error} If assetId already exists
 */
const createAsset = async (assetData) => {
  const { companyId, assetId, serialNumber } = assetData;

  // Check if assetId already exists
  const existingAsset = await Asset.findOne({ companyId, assetId });
  if (existingAsset) {
    throw new Error(`Asset ID ${assetId} already exists`);
  }

  // Check if serial number already exists (if provided)
  if (serialNumber) {
    const existingSerial = await Asset.findOne({ serialNumber });
    if (existingSerial) {
      throw new Error(`Serial number ${serialNumber} already exists`);
    }
  }

  // Create asset
  const asset = new Asset({
    ...assetData,
    status: 'Available',
    currentValue: assetData.purchasePrice
  });

  await asset.save();
  return asset;
};

/**
 * Get assets with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Assets with pagination
 */
const getAssets = async (filters) => {
  const { 
    companyId, 
    category, 
    status, 
    assignedTo,
    search,
    page = 1, 
    limit = 20 
  } = filters;

  // Build query
  const query = { companyId, isDeleted: false };

  if (category) query.category = category;
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  // Search by name, assetId, or serialNumber
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { assetId: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Count total documents
  const total = await Asset.countDocuments(query);

  // Fetch assets
  const assets = await Asset.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Calculate current value for each asset
  assets.forEach(asset => {
    if (asset.purchasePrice && asset.purchaseDate && asset.depreciationRate) {
      const yearsOwned = (Date.now() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
      const depreciation = asset.purchasePrice * (asset.depreciationRate / 100) * yearsOwned;
      asset.currentValue = Math.max(asset.purchasePrice - depreciation, asset.salvageValue || 0);
    }
  });

  return {
    assets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get assets assigned to current user
 * @param {String} employeeId - Employee ID
 * @returns {Promise<Array>} Assigned assets
 */
const getMyAssets = async (employeeId) => {
  const assets = await Asset.find({
    assignedTo: employeeId,
    status: 'Assigned',
    isDeleted: false
  })
    .select('-licenseDetails.licenseKey')
    .lean();

  return assets;
};

/**
 * Get asset by ID
 * @param {String} assetId - Asset ID
 * @returns {Promise<Object>} Asset details
 * @throws {Error} If asset not found
 */
const getAssetById = async (assetId) => {
  const asset = await Asset.findById(assetId)
    .populate('assignedTo', 'firstName lastName email empCode')
    .populate('createdBy', 'firstName lastName')
    .populate('assignmentHistory.employeeId', 'firstName lastName empCode')
    .lean();

  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  // Calculate current value
  if (asset.purchasePrice && asset.purchaseDate && asset.depreciationRate) {
    const yearsOwned = (Date.now() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
    const depreciation = asset.purchasePrice * (asset.depreciationRate / 100) * yearsOwned;
    asset.currentValue = Math.max(asset.purchasePrice - depreciation, asset.salvageValue || 0);
  }

  return asset;
};

/**
 * Update asset
 * @param {String} assetId - Asset ID
 * @param {Object} updateData - Updated asset data
 * @returns {Promise<Object>} Updated asset
 * @throws {Error} If asset not found
 */
const updateAsset = async (assetId, updateData) => {
  const asset = await Asset.findById(assetId);

  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  // Prevent updating assetId if already exists
  if (updateData.assetId && updateData.assetId !== asset.assetId) {
    const existing = await Asset.findOne({ 
      assetId: updateData.assetId,
      _id: { $ne: assetId }
    });
    if (existing) {
      throw new Error(`Asset ID ${updateData.assetId} already exists`);
    }
  }

  // Update asset
  Object.assign(asset, updateData);
  await asset.save();

  return asset;
};

/**
 * Assign asset to employee
 * @param {String} assetId - Asset ID
 * @param {Object} assignmentData - Assignment details
 * @returns {Promise<Object>} Updated asset
 * @throws {Error} If asset not available or employee not found
 */
const assignAsset = async (assetId, assignmentData) => {
  const { employeeId, expectedReturnDate, remarks } = assignmentData;

  const asset = await Asset.findById(assetId);
  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  if (asset.status !== 'Available') {
    throw new Error(`Asset is currently ${asset.status.toLowerCase()} and cannot be assigned`);
  }

  // Verify employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Assign asset
  asset.assignedTo = employeeId;
  asset.assignedDate = new Date();
  asset.expectedReturnDate = expectedReturnDate;
  asset.status = 'Assigned';

  // Add to assignment history
  asset.assignmentHistory.push({
    employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    assignedDate: new Date(),
    condition: asset.condition,
    remarks
  });

  await asset.save();

  return asset.populate('assignedTo', 'firstName lastName email empCode');
};

/**
 * Return asset from employee
 * @param {String} assetId - Asset ID
 * @param {Object} returnData - Return details
 * @returns {Promise<Object>} Updated asset
 * @throws {Error} If asset not assigned
 */
const returnAsset = async (assetId, returnData) => {
  const { condition, remarks } = returnData;

  const asset = await Asset.findById(assetId);
  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  if (asset.status !== 'Assigned') {
    throw new Error('Asset is not currently assigned');
  }

  // Update last assignment history
  const lastAssignment = asset.assignmentHistory[asset.assignmentHistory.length - 1];
  if (lastAssignment) {
    lastAssignment.returnedDate = new Date();
    if (remarks) {
      lastAssignment.remarks = lastAssignment.remarks 
        ? `${lastAssignment.remarks} | Return: ${remarks}`
        : `Return: ${remarks}`;
    }
  }

  // Return asset
  asset.assignedTo = null;
  asset.returnDate = new Date();
  asset.expectedReturnDate = null;
  asset.status = 'Available';
  asset.condition = condition;

  await asset.save();
  return asset;
};

/**
 * Add maintenance record
 * @param {String} assetId - Asset ID
 * @param {Object} maintenanceData - Maintenance details
 * @returns {Promise<Object>} Updated asset
 * @throws {Error} If asset not found
 */
const addMaintenance = async (assetId, maintenanceData) => {
  const asset = await Asset.findById(assetId);

  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  // Add maintenance record
  asset.maintenanceSchedule.push({
    ...maintenanceData,
    scheduledDate: maintenanceData.scheduledDate || new Date()
  });

  // Update maintenance dates
  if (maintenanceData.completedDate) {
    asset.lastMaintenanceDate = maintenanceData.completedDate;
  }

  // Set status to "In Repair" if maintenance is ongoing
  if (maintenanceData.type === 'Corrective' && !maintenanceData.completedDate) {
    asset.status = 'In Repair';
  }

  await asset.save();
  return asset;
};

/**
 * Delete asset (soft delete)
 * @param {String} assetId - Asset ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If asset is assigned
 */
const deleteAsset = async (assetId) => {
  const asset = await Asset.findById(assetId);

  if (!asset || asset.isDeleted) {
    throw new Error('Asset not found');
  }

  if (asset.status === 'Assigned') {
    throw new Error('Cannot delete asset that is currently assigned');
  }

  asset.isDeleted = true;
  asset.deletedAt = new Date();
  await asset.save();

  return { message: 'Asset deleted successfully' };
};

/**
 * Get asset statistics
 * @param {String} companyId - Company ID
 * @returns {Promise<Object>} Asset statistics
 */
const getAssetStats = async (companyId) => {
  // Count by status
  const statusStats = await Asset.aggregate([
    { $match: { companyId: companyId, isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Count by category
  const categoryStats = await Asset.aggregate([
    { $match: { companyId: companyId, isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Total value
  const valueStats = await Asset.aggregate([
    { $match: { companyId: companyId, isDeleted: false } },
    { 
      $group: { 
        _id: null, 
        totalPurchaseValue: { $sum: '$purchasePrice' },
        totalCurrentValue: { $sum: '$currentValue' }
      } 
    }
  ]);

  // Assets needing maintenance
  const needsMaintenance = await Asset.countDocuments({
    companyId,
    isDeleted: false,
    nextMaintenanceDate: { $lte: new Date() }
  });

  // Warranty expiring soon (within 30 days)
  const warrantyExpiringSoon = await Asset.countDocuments({
    companyId,
    isDeleted: false,
    warrantyExpiry: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  const byStatus = {};
  statusStats.forEach(stat => {
    byStatus[stat._id] = stat.count;
  });

  const byCategory = {};
  categoryStats.forEach(stat => {
    byCategory[stat._id] = stat.count;
  });

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
    byCategory,
    totalPurchaseValue: valueStats[0]?.totalPurchaseValue || 0,
    totalCurrentValue: valueStats[0]?.totalCurrentValue || 0,
    needsMaintenance,
    warrantyExpiringSoon
  };
};

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
