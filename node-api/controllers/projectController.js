/**
 * Project Controller
 * Handles HTTP requests for project management operations
 * 
 * @module controllers/projectController
 */

const projectService = require('../services/projectService');
const asyncHandler = require('../utils/asyncHandler');
const { 
  successResponse, 
  createdResponse, 
  paginatedResponse,
  badRequestResponse 
} = require('../utils/responseHandler');

/**
 * Create new project
 * @route POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  createdResponse(res, project, 'Project created successfully');
});

/**
 * Get all projects with filters
 * @route GET /api/projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const { projects, total, page, limit } = await projectService.getProjects(req.query);
  paginatedResponse(res, projects, page, limit, total, 'Projects retrieved successfully');
});

/**
 * Get my projects
 * @route GET /api/projects/my-projects
 */
const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getMyProjects(req.user._id, req.query);
  successResponse(res, projects, 'My projects retrieved successfully');
});

/**
 * Get project by ID
 * @route GET /api/projects/:id
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  successResponse(res, project, 'Project retrieved successfully');
});

/**
 * Update project details
 * @route PUT /api/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
  successResponse(res, project, 'Project updated successfully');
});

/**
 * Assign employee to project
 * @route POST /api/projects/:id/members
 */
const assignMember = asyncHandler(async (req, res) => {
  const project = await projectService.assignMember(req.params.id, req.body);
  successResponse(res, project, 'Employee assigned to project successfully');
});

/**
 * Remove employee from project
 * @route DELETE /api/projects/:id/members/:employeeId
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(req.params.id, req.params.employeeId);
  successResponse(res, project, 'Employee removed from project successfully');
});

/**
 * Add milestone
 * @route POST /api/projects/:id/milestones
 */
const addMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.addMilestone(req.params.id, req.body);
  createdResponse(res, project, 'Milestone added successfully');
});

/**
 * Update milestone status
 * @route PUT /api/projects/:id/milestones/:milestoneId
 */
const updateMilestone = asyncHandler(async (req, res) => {
  const project = await projectService.updateMilestone(
    req.params.id, 
    req.params.milestoneId, 
    req.body
  );
  successResponse(res, project, 'Milestone updated successfully');
});

/**
 * Add risk
 * @route POST /api/projects/:id/risks
 */
const addRisk = asyncHandler(async (req, res) => {
  const project = await projectService.addRisk(req.params.id, req.body);
  createdResponse(res, project, 'Risk added successfully');
});

/**
 * Update risk status
 * @route PUT /api/projects/:id/risks/:riskId
 */
const updateRisk = asyncHandler(async (req, res) => {
  const project = await projectService.updateRisk(
    req.params.id, 
    req.params.riskId, 
    req.body
  );
  successResponse(res, project, 'Risk updated successfully');
});

/**
 * Upload project document
 * @route POST /api/projects/:id/files
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const project = await projectService.uploadDocument(req.params.id, req.body);
  createdResponse(res, project, 'Document uploaded successfully');
});

/**
 * Get project dashboard/portfolio health
 * @route GET /api/projects/dashboard
 */
const getProjectDashboard = asyncHandler(async (req, res) => {
  if (!req.query.companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const dashboard = await projectService.getProjectDashboard(req.query.companyId);
  successResponse(res, dashboard, 'Project dashboard retrieved successfully');
});

/**
 * Delete project
 * @route DELETE /api/projects/:id
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await projectService.deleteProject(req.params.id);
  successResponse(res, project, 'Project deleted successfully');
});

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  assignMember,
  removeMember,
  addMilestone,
  updateMilestone,
  addRisk,
  updateRisk,
  uploadDocument,
  getProjectDashboard,
  deleteProject
};
