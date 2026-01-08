/**
 * Employee Controller
 * Handles HTTP requests for employee-related operations
 * Routes requests to the employee service and formats responses
 * 
 * @module controllers/employeeController
 */

const employeeService = require('../services/employeeService');
const { 
  successResponse, 
  createdResponse, 
  badRequestResponse, 
  notFoundResponse,
  paginatedResponse,
  unauthorizedResponse
} = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new employee
 * POST /api/employees
 * Access: Admin, HR
 */
const createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body, req.user?.id);
  createdResponse(res, employee, 'Employee created successfully');
});

/**
 * Get all employees with filtering and pagination
 * GET /api/employees
 * Access: Admin, HR, Manager
 */
const getEmployees = asyncHandler(async (req, res) => {
  const filters = {
    companyId: req.query.companyId,
    department: req.query.department,
    status: req.query.status,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || '-createdAt'
  };

  const { employees, total } = await employeeService.getEmployees(filters);
  
  paginatedResponse(
    res,
    employees,
    filters.page,
    filters.limit,
    total,
    'Employees retrieved successfully'
  );
});

/**
 * Get current logged-in employee's profile
 * GET /api/employees/me
 * Access: All authenticated users
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.user.id);
  successResponse(res, employee, 'Profile retrieved successfully');
});

/**
 * Get employee by ID
 * GET /api/employees/:id
 * Access: Admin, HR, Manager
 */
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  successResponse(res, employee, 'Employee retrieved successfully');
});

/**
 * Update employee
 * PUT /api/employees/:id
 * Access: Admin, HR
 */
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(
    req.params.id,
    req.body,
    req.user?.id
  );
  successResponse(res, employee, 'Employee updated successfully');
});

/**
 * Update employee salary
 * PUT /api/employees/:id/salary
 * Access: Admin, HR
 */
const updateSalary = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateSalary(
    req.params.id,
    req.body,
    req.user?.id
  );
  successResponse(res, employee, 'Salary updated successfully');
});

/**
 * Change employee status
 * PUT /api/employees/:id/status
 * Access: Admin, HR
 */
const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return badRequestResponse(res, 'Status is required');
  }

  const employee = await employeeService.updateEmployee(
    req.params.id,
    { status },
    req.user?.id
  );
  
  successResponse(res, employee, `Employee status changed to ${status}`);
});

/**
 * Soft delete employee
 * DELETE /api/employees/:id
 * Access: Admin
 */
const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id, req.user?.id);
  successResponse(res, null, 'Employee deleted successfully');
});

/**
 * Restore a soft-deleted employee
 * POST /api/employees/:id/restore
 * Access: Admin
 */
const restoreEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.restoreEmployee(req.params.id, req.user?.id);
  successResponse(res, employee, 'Employee restored successfully');
});

/**
 * Employee login
 * POST /api/employees/login
 * Access: Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return badRequestResponse(res, 'Email and password are required');
  }

  const { employee, token } = await employeeService.authenticateEmployee(email, password);
  
  successResponse(res, { employee, token }, 'Login successful');
});

/**
 * Get employee hierarchy
 * GET /api/employees/:id/hierarchy
 * Access: All authenticated users
 */
const getHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await employeeService.getEmployeeHierarchy(req.params.id);
  successResponse(res, hierarchy, 'Hierarchy retrieved successfully');
});

/**
 * Upload employee document
 * POST /api/employees/:id/documents
 * Access: Admin, HR
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const { name, type, url, expiryDate } = req.body;
  
  if (!name || !type || !url) {
    return badRequestResponse(res, 'Document name, type, and URL are required');
  }

  const employee = await employeeService.getEmployeeById(req.params.id, true);
  
  employee.documents.push({
    name,
    type,
    url,
    expiryDate,
    uploadDate: new Date(),
    verified: false
  });

  const updatedEmployee = await employeeService.updateEmployee(
    req.params.id,
    { documents: employee.documents },
    req.user?.id
  );

  successResponse(res, updatedEmployee, 'Document uploaded successfully');
});

/**
 * Get employee documents
 * GET /api/employees/:id/documents
 * Access: Admin, HR, Self
 */
const getDocuments = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id, true);
  successResponse(res, employee.documents, 'Documents retrieved successfully');
});

module.exports = {
  createEmployee,
  getEmployees,
  getMyProfile,
  getEmployeeById,
  updateEmployee,
  updateSalary,
  changeStatus,
  deleteEmployee,
  restoreEmployee,
  login,
  getHierarchy,
  uploadDocument,
  getDocuments
};
