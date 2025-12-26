/**
 * Asset Routes
 * Defines all asset management endpoints with proper MVC structure
 * 
 * @module routes/assetRoutes
 */

const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/assets
 * @desc    Create new asset
 * @access  Admin, IT
 */
router.post('/', authMiddleware, assetController.createAsset);

/**
 * @route   GET /api/assets/me
 * @desc    Get assets assigned to me
 * @access  All authenticated users
 */
router.get('/me', authMiddleware, assetController.getMyAssets);

/**
 * @route   GET /api/assets/stats/:companyId
 * @desc    Get asset statistics
 * @access  Admin, IT, HR
 */
router.get('/stats/:companyId', authMiddleware, assetController.getAssetStats);

/**
 * @route   GET /api/assets
 * @desc    Get all assets with filtering
 * @access  Admin, IT, HR
 */
router.get('/', authMiddleware, assetController.getAssets);

/**
 * @route   GET /api/assets/:id
 * @desc    Get asset by ID
 * @access  Admin, IT, HR
 */
router.get('/:id', authMiddleware, assetController.getAssetById);

/**
 * @route   PUT /api/assets/:id
 * @desc    Update asset
 * @access  Admin, IT
 */
router.put('/:id', authMiddleware, assetController.updateAsset);

/**
 * @route   POST /api/assets/:id/assign
 * @desc    Assign asset to employee
 * @access  Admin, IT
 */
router.post('/:id/assign', authMiddleware, assetController.assignAsset);

/**
 * @route   POST /api/assets/:id/return
 * @desc    Return asset from employee
 * @access  Admin, IT
 */
router.post('/:id/return', authMiddleware, assetController.returnAsset);

/**
 * @route   POST /api/assets/:id/maintenance
 * @desc    Add maintenance record
 * @access  Admin, IT
 */
router.post('/:id/maintenance', authMiddleware, assetController.addMaintenance);

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete asset (soft delete)
 * @access  Admin, IT
 */
router.delete('/:id', authMiddleware, assetController.deleteAsset);

module.exports = router;

// Create new asset
router.post('/', authMiddleware, async (req, res) => {
  try {
    const assetData = req.body;
    
    if (!assetData.companyId || !assetData.assetId || !assetData.name || !assetData.category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if assetId already exists
    const existing = await Asset.findOne({ 
      assetId: assetData.assetId,
      isDeleted: false 
    });
    if (existing) {
      return res.status(400).json({ message: 'Asset ID already exists' });
    }

    const asset = new Asset({
      ...assetData,
      createdBy: req.user?.id
    });

    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assets for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, category, assignedTo } = req.query;

    const filter = { companyId, isDeleted: false };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'firstName lastName empCode email')
      .sort({ assetId: 1 });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    })
      .populate('assignedTo', 'firstName lastName empCode email position department')
      .populate('assignmentHistory.employeeId', 'firstName lastName empCode')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Calculate current value with depreciation
    asset.calculateCurrentValue();

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const asset = await Asset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    updates.updatedBy = req.user?.id;
    Object.assign(asset, updates);
    await asset.save();

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign asset to employee
router.post('/:id/assign', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, remarks } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const asset = await Asset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const employee = await Employee.findOne({ 
      _id: employeeId, 
      companyId: asset.companyId,
      isDeleted: false 
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`;
    await asset.assignToEmployee(employeeId, employeeName, remarks);

    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return asset from employee
router.post('/:id/return', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, remarks } = req.body;

    if (!condition) {
      return res.status(400).json({ message: 'Condition is required' });
    }

    const asset = await Asset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await asset.returnFromEmployee(condition, remarks);

    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get assets assigned to employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const assets = await Asset.find({ 
      assignedTo: employeeId,
      status: 'Assigned',
      isDeleted: false 
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add maintenance record
router.post('/:id/maintenance', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const maintenanceData = req.body;

    const asset = await Asset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.maintenanceSchedule.push(maintenanceData);
    if (maintenanceData.completedDate) {
      asset.lastMaintenanceDate = maintenanceData.completedDate;
    }
    asset.updatedBy = req.user?.id;

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Soft delete asset
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findOne({ _id: id, isDeleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status === 'Assigned') {
      return res.status(400).json({ 
        message: 'Cannot delete assigned asset. Please return it first.' 
      });
    }

    asset.isDeleted = true;
    asset.deletedAt = new Date();
    await asset.save();

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
