/**
 * Project Service
 * Handles project management business logic including resource allocation, milestones, and billing
 * 
 * @module services/projectService
 */

const Project = require('../schemas/project');
const Employee = require('../schemas/employee');
const { parsePagination, parseSort, buildSearchFilter } = require('../utils/queryHelper');

/**
 * Create new project
 * @param {Object} projectData - Project data
 * @param {string} createdBy - Employee ID who creates the project
 * @returns {Promise<Object>} Created project
 */
const createProject = async (projectData, createdBy) => {
  const { companyId, managerId, name, members } = projectData;

  // Validate manager exists
  const manager = await Employee.findOne({ _id: managerId, companyId, status: 'Active' });
  if (!manager) {
    throw new Error('Manager not found or inactive');
  }

  // Generate project code if not provided
  if (!projectData.code) {
    const year = new Date().getFullYear();
    const count = await Project.countDocuments({ companyId });
    projectData.code = `PROJ-${year}-${(count + 1).toString().padStart(3, '0')}`;
  }

  // Validate team members if provided
  if (members && members.length > 0) {
    const memberIds = members.map(m => m.employeeId);
    const validMembers = await Employee.find({ 
      _id: { $in: memberIds }, 
      companyId, 
      status: 'Active' 
    });

    if (validMembers.length !== memberIds.length) {
      throw new Error('One or more team members not found or inactive');
    }
  }

  // Calculate budget remaining
  if (projectData.budget && projectData.budget.amount) {
    projectData.budget.remaining = projectData.budget.amount - (projectData.budget.spent || 0);
  }

  const project = new Project({
    ...projectData,
    createdBy
  });

  await project.save();
  return project.populate('managerId', 'firstName lastName email empCode');
};

/**
 * Get all projects with filters and pagination
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} Projects list with pagination
 */
const getProjects = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const sortObj = parseSort(query.sortBy) || { createdAt: -1 };

  // Build filter
  const filter = { isDeleted: false };

  if (query.companyId) filter.companyId = query.companyId;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.managerId) filter.managerId = query.managerId;
  if (query.billingType) filter.billingType = query.billingType;

  // Search in name, code, client name
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { 'client.name': { $regex: query.search, $options: 'i' } }
    ];
  }

  // Date range filter
  if (query.startDate || query.endDate) {
    filter.startDate = {};
    if (query.startDate) filter.startDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.startDate.$lte = new Date(query.endDate);
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('managerId', 'firstName lastName email empCode')
      .populate('members.employeeId', 'firstName lastName email empCode')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter)
  ]);

  return { projects, total, page, limit };
};

/**
 * Get projects assigned to employee
 * @param {string} employeeId - Employee ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Array>} Projects list
 */
const getMyProjects = async (employeeId, query) => {
  const filter = {
    isDeleted: false,
    $or: [
      { managerId: employeeId },
      { 'members.employeeId': employeeId }
    ]
  };

  if (query.status) filter.status = query.status;

  const projects = await Project.find(filter)
    .populate('managerId', 'firstName lastName email')
    .select('name code status priority startDate endDate completionPercentage')
    .sort({ startDate: -1 })
    .lean();

  return projects;
};

/**
 * Get project by ID with full details
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project details
 */
const getProjectById = async (projectId) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false })
    .populate('managerId', 'firstName lastName email empCode phone')
    .populate('members.employeeId', 'firstName lastName email empCode role department')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName');

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
};

/**
 * Update project details
 * @param {string} projectId - Project ID
 * @param {Object} updates - Update data
 * @param {string} updatedBy - Employee ID who updates
 * @returns {Promise<Object>} Updated project
 */
const updateProject = async (projectId, updates, updatedBy) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  // Update allowed fields
  const allowedFields = [
    'name', 'description', 'status', 'priority', 'endDate', 'estimatedDuration',
    'billingType', 'budget', 'hourlyRate', 'technologies', 'repository', 'links',
    'completionPercentage', 'client'
  ];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      project[field] = updates[field];
    }
  });

  // Recalculate budget if updated
  if (updates.budget) {
    project.budget.remaining = project.budget.amount - (project.budget.spent || 0);
  }

  project.updatedBy = updatedBy;
  await project.save();

  return project.populate('managerId', 'firstName lastName email');
};

/**
 * Assign employee to project
 * @param {string} projectId - Project ID
 * @param {Object} memberData - Member assignment data
 * @returns {Promise<Object>} Updated project
 */
const assignMember = async (projectId, memberData) => {
  const { employeeId, role, allocation, billable, hourlyRate, startDate, endDate } = memberData;

  const project = await Project.findOne({ _id: projectId, isDeleted: false });
  if (!project) {
    throw new Error('Project not found');
  }

  // Check if employee exists and is active
  const employee = await Employee.findOne({ 
    _id: employeeId, 
    companyId: project.companyId, 
    status: 'Active' 
  });

  if (!employee) {
    throw new Error('Employee not found or inactive');
  }

  // Check if already assigned
  const existingMember = project.members.find(
    m => m.employeeId.toString() === employeeId.toString()
  );

  if (existingMember) {
    throw new Error('Employee already assigned to this project');
  }

  // Add member
  project.members.push({
    employeeId,
    role: role || 'Developer',
    allocation: allocation || 100,
    billable: billable !== undefined ? billable : true,
    hourlyRate,
    startDate: startDate || new Date(),
    endDate
  });

  await project.save();
  return project.populate('members.employeeId', 'firstName lastName email empCode');
};

/**
 * Remove employee from project
 * @param {string} projectId - Project ID
 * @param {string} employeeId - Employee ID to remove
 * @returns {Promise<Object>} Updated project
 */
const removeMember = async (projectId, employeeId) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  const memberIndex = project.members.findIndex(
    m => m.employeeId.toString() === employeeId.toString()
  );

  if (memberIndex === -1) {
    throw new Error('Employee not found in project');
  }

  // Cannot remove project manager
  if (project.managerId.toString() === employeeId.toString()) {
    throw new Error('Cannot remove project manager. Assign new manager first.');
  }

  project.members.splice(memberIndex, 1);
  await project.save();

  return project;
};

/**
 * Add milestone to project
 * @param {string} projectId - Project ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Promise<Object>} Updated project
 */
const addMilestone = async (projectId, milestoneData) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  project.milestones.push(milestoneData);
  await project.save();

  return project;
};

/**
 * Update milestone status
 * @param {string} projectId - Project ID
 * @param {string} milestoneId - Milestone ID
 * @param {Object} updates - Milestone updates
 * @returns {Promise<Object>} Updated project
 */
const updateMilestone = async (projectId, milestoneId, updates) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  const milestone = project.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  // Update milestone fields
  Object.keys(updates).forEach(key => {
    milestone[key] = updates[key];
  });

  // If marking as completed, set completedDate
  if (updates.status === 'Completed' && !milestone.completedDate) {
    milestone.completedDate = new Date();
  }

  await project.save();
  return project;
};

/**
 * Add risk to project
 * @param {string} projectId - Project ID
 * @param {Object} riskData - Risk data
 * @returns {Promise<Object>} Updated project
 */
const addRisk = async (projectId, riskData) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  project.risks.push({
    ...riskData,
    status: riskData.status || 'Open'
  });

  await project.save();
  return project;
};

/**
 * Update risk status
 * @param {string} projectId - Project ID
 * @param {string} riskId - Risk ID
 * @param {Object} updates - Risk updates
 * @returns {Promise<Object>} Updated project
 */
const updateRisk = async (projectId, riskId, updates) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  const risk = project.risks.id(riskId);
  if (!risk) {
    throw new Error('Risk not found');
  }

  Object.keys(updates).forEach(key => {
    risk[key] = updates[key];
  });

  await project.save();
  return project;
};

/**
 * Upload project document
 * @param {string} projectId - Project ID
 * @param {Object} documentData - Document data
 * @returns {Promise<Object>} Updated project
 */
const uploadDocument = async (projectId, documentData) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  project.documents.push(documentData);
  await project.save();

  return project;
};

/**
 * Get project dashboard/portfolio health
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Dashboard statistics
 */
const getProjectDashboard = async (companyId) => {
  const projects = await Project.find({ companyId, isDeleted: false });

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    onHoldProjects: projects.filter(p => p.status === 'On Hold').length,
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    avgCompletionPercentage: 0,
    criticalProjects: [],
    delayedMilestones: 0
  };

  let totalCompletion = 0;

  projects.forEach(project => {
    // Budget calculations
    if (project.budget) {
      stats.totalBudget += project.budget.amount || 0;
      stats.totalSpent += project.budget.spent || 0;
      stats.totalRemaining += project.budget.remaining || 0;
    }

    // Completion percentage
    totalCompletion += project.completionPercentage || 0;

    // Critical projects
    if (project.priority === 'Critical' && project.status === 'Active') {
      stats.criticalProjects.push({
        id: project._id,
        name: project.name,
        code: project.code,
        completionPercentage: project.completionPercentage
      });
    }

    // Delayed milestones
    if (project.milestones) {
      const delayed = project.milestones.filter(
        m => m.status !== 'Completed' && m.dueDate && new Date(m.dueDate) < new Date()
      );
      stats.delayedMilestones += delayed.length;
    }
  });

  stats.avgCompletionPercentage = projects.length > 0 
    ? Math.round(totalCompletion / projects.length) 
    : 0;

  return stats;
};

/**
 * Delete project (soft delete)
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Deleted project
 */
const deleteProject = async (projectId) => {
  const project = await Project.findOne({ _id: projectId, isDeleted: false });

  if (!project) {
    throw new Error('Project not found');
  }

  project.isDeleted = true;
  project.deletedAt = new Date();
  await project.save();

  return project;
};

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
