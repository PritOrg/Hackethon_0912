/**
 * Department Controller
 * Handles HTTP requests for department operations
 * 
 * @module controllers/departmentController
 */

const departmentService = require('../services/departmentService');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse
} = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create department
 * POST /api/departments
 * Access: Admin, HR
 */
const createDepartment = asyncHandler(async (req, res) => {
  const { companyId, name } = req.body;

  if (!companyId || !name) {
    return badRequestResponse(res, 'Company ID and name are required');
  }

  const department = await departmentService.createDepartment(req.body, req.user?.id);
  createdResponse(res, department, 'Department created successfully');
});

/**
 * Get all departments
 * GET /api/departments
 * Access: All
 */
const getDepartments = asyncHandler(async (req, res) => {
  const filters = {
    companyId: req.query.companyId,
    includeDeleted: req.query.includeDeleted === 'true'
  };

  const departments = await departmentService.getDepartments(filters);
  successResponse(res, departments, 'Departments retrieved successfully');
});

/**
 * Get department by ID
 * GET /api/departments/:id
 * Access: All
 */
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  successResponse(res, department, 'Department retrieved successfully');
});

/**
 * Update department
 * PUT /api/departments/:id
 * Access: Admin, HR
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body,
    req.user?.id
  );
  successResponse(res, department, 'Department updated successfully');
});

/**
 * Delete department
 * DELETE /api/departments/:id
 * Access: Admin, HR
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id, req.user?.id);
  successResponse(res, null, 'Department deleted successfully');
});

/**
 * Get department hierarchy
 * GET /api/departments/company/:companyId/hierarchy
 * Access: All
 */
const getHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await departmentService.getDepartmentHierarchy(req.params.companyId);
  successResponse(res, hierarchy, 'Department hierarchy retrieved successfully');
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getHierarchy
};
