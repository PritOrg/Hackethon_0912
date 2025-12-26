/**
 * Project Routes
 * Defines all project management endpoints
 * 
 * @module routes/projectRoutes
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('./auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/projects/my-projects
 * @desc    Get projects assigned to me
 * @access  All authenticated users
 */
router.get('/my-projects', projectController.getMyProjects);

/**
 * @route   GET /api/projects/dashboard
 * @desc    Get project portfolio health dashboard
 * @access  Admin, Manager
 */
router.get('/dashboard', projectController.getProjectDashboard);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Admin, Manager
 */
router.post('/', createLimiter, projectController.createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filters
 * @access  Admin, Manager, HR
 */
router.get('/', projectController.getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project details and progress
 * @access  Assigned members
 */
router.get('/:id', projectController.getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details
 * @access  Admin, Manager
 */
router.put('/:id', projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Admin
 */
router.delete('/:id', projectController.deleteProject);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Assign employee to project
 * @access  Admin, Manager
 */
router.post('/:id/members', projectController.assignMember);

/**
 * @route   DELETE /api/projects/:id/members/:employeeId
 * @desc    Remove employee from project
 * @access  Admin, Manager
 */
router.delete('/:id/members/:employeeId', projectController.removeMember);

/**
 * @route   POST /api/projects/:id/milestones
 * @desc    Add new milestone to project
 * @access  Admin, Manager
 */
router.post('/:id/milestones', projectController.addMilestone);

/**
 * @route   PUT /api/projects/:id/milestones/:milestoneId
 * @desc    Update milestone status
 * @access  Admin, Manager
 */
router.put('/:id/milestones/:milestoneId', projectController.updateMilestone);

/**
 * @route   POST /api/projects/:id/risks
 * @desc    Log new project risk
 * @access  Admin, Manager
 */
router.post('/:id/risks', projectController.addRisk);

/**
 * @route   PUT /api/projects/:id/risks/:riskId
 * @desc    Update risk status (Mitigate/Close)
 * @access  Admin, Manager
 */
router.put('/:id/risks/:riskId', projectController.updateRisk);

/**
 * @route   POST /api/projects/:id/files
 * @desc    Upload project spec/contract
 * @access  Admin, Manager
 */
router.post('/:id/files', projectController.uploadDocument);

module.exports = router;
