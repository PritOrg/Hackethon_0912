/**
 * Department Routes
 * Defines all department-related endpoints with proper MVC structure
 * 
 * @module routes/departmentRoutes
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Admin, HR
 */
router.post('/', authMiddleware, departmentController.createDepartment);

/**
 * @route   GET /api/departments/company/:companyId/hierarchy
 * @desc    Get department hierarchy
 * @access  All authenticated users
 */
router.get('/company/:companyId/hierarchy', authMiddleware, departmentController.getHierarchy);

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  All authenticated users
 */
router.get('/', authMiddleware, departmentController.getDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  All authenticated users
 */
router.get('/:id', authMiddleware, departmentController.getDepartmentById);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Admin, HR
 */
router.put('/:id', authMiddleware, departmentController.updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Admin, HR
 */
router.delete('/:id', authMiddleware, departmentController.deleteDepartment);

module.exports = router;

// OLD CODE BELOW - REMOVED
// ================================
/*
// Create new department
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      companyId,
      name,
      description,
      headId,
      parentDepartmentId,
      budget,
      budgetPeriod,
      costCenter
    } = req.body;

    if (!companyId || !name) {
      return res.status(400).json({ message: 'Company ID and name are required' });
    }

    // Check if department name already exists in company
    const existing = await Department.findOne({ 
      companyId, 
      name, 
      isDeleted: false 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    // Validate head exists and belongs to company
    if (headId) {
      const head = await Employee.findOne({ 
        _id: headId, 
        companyId, 
        isDeleted: false 
      });
      if (!head) {
        return res.status(404).json({ message: 'Department head not found' });
      }
    }

    const department = new Department({
      companyId,
      name,
      description,
      headId,
      parentDepartmentId,
      budget,
      budgetPeriod,
      costCenter,
      createdBy: req.user?.id
    });

    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all departments for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { includeDeleted } = req.query;

    const filter = { companyId };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    const departments = await Department.find(filter)
      .populate('headId', 'firstName lastName email empCode')
      .populate('parentDepartmentId', 'name')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    })
      .populate('headId', 'firstName lastName email empCode position')
      .populate('parentDepartmentId', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get employee count
    const employeeCount = await Employee.countDocuments({ 
      department: department._id, 
      status: 'Active',
      isDeleted: false 
    });

    res.json({ ...department.toObject(), employeeCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const department = await Department.findOne({ _id: id, isDeleted: false });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if new name conflicts
    if (updates.name && updates.name !== department.name) {
      const existing = await Department.findOne({
        companyId: department.companyId,
        name: updates.name,
        _id: { $ne: id },
        isDeleted: false
      });
      if (existing) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }

    // Validate new head
    if (updates.headId) {
      const head = await Employee.findOne({ 
        _id: updates.headId, 
        companyId: department.companyId,
        isDeleted: false 
      });
      if (!head) {
        return res.status(404).json({ message: 'Department head not found' });
      }
    }

    updates.updatedBy = req.user?.id;
    Object.assign(department, updates);
    await department.save();

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Soft delete department
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findOne({ _id: id, isDeleted: false });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has active employees
    const employeeCount = await Employee.countDocuments({ 
      department: id, 
      status: 'Active',
      isDeleted: false 
    });

    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department with ${employeeCount} active employees` 
      });
    }

    department.isDeleted = true;
    department.deletedAt = new Date();
    department.deletedBy = req.user?.id;
    await department.save();

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department hierarchy
router.get('/company/:companyId/hierarchy', async (req, res) => {
  try {
    const { companyId } = req.params;

    const departments = await Department.find({ 
      companyId, 
      isDeleted: false 
    })
      .populate('headId', 'firstName lastName empCode')
      .sort({ name: 1 });

    // Build hierarchy tree
    const buildTree = (parentId = null) => {
      return departments
        .filter(dept => String(dept.parentDepartmentId) === String(parentId))
        .map(dept => ({
          ...dept.toObject(),
          children: buildTree(dept._id)
        }));
    };

    const hierarchy = buildTree(null);
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
*/
