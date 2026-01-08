/**
 * Dashboard Service
 * Provides aggregated analytics and insights for different roles
 * 
 * @module services/dashboardService
 */

const mongoose = require('mongoose');
const Employee = require('../schemas/employee');
const Attendance = require('../schemas/attendance');
const LeaveRequest = require('../schemas/leaveRequest');
const Project = require('../schemas/project');
const PerformanceReview = require('../schemas/performanceReview');
const Asset = require('../schemas/asset');

/**
 * Get Admin Dashboard
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Admin dashboard data
 */
const getAdminDashboard = async (companyId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Employee Statistics
  const totalEmployees = await Employee.countDocuments({ companyId, isDeleted: false });
  const activeEmployees = await Employee.countDocuments({ 
    companyId, 
    status: 'Active', 
    isDeleted: false 
  });
  const newHiresThisMonth = await Employee.countDocuments({
    companyId,
    joinDate: { $gte: startOfMonth },
    isDeleted: false
  });

  // Calculate attrition (employees who left this year)
  const leftThisYear = await Employee.countDocuments({
    companyId,
    status: { $in: ['Terminated', 'Resigned'] },
    updatedAt: { $gte: startOfYear }
  });
  const attritionRate = totalEmployees > 0 
    ? ((leftThisYear / totalEmployees) * 100).toFixed(2)
    : 0;

  // Attendance Overview
  const todayAttendance = await Attendance.countDocuments({
    companyId,
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999))
    },
    status: 'Present'
  });

  const absentToday = activeEmployees - todayAttendance;

  // Leave Requests
  const pendingLeaveRequests = await LeaveRequest.countDocuments({
    companyId,
    status: 'Pending'
  });

  // Project Statistics
  const totalProjects = await Project.countDocuments({ companyId, isDeleted: false });
  const activeProjects = await Project.countDocuments({ 
    companyId, 
    status: 'Active', 
    isDeleted: false 
  });

  // Budget Overview (sum of all project budgets)
  const projectBudgets = await Project.aggregate([
    { 
      $match: { 
        companyId: new mongoose.Types.ObjectId(companyId), 
        isDeleted: false 
      } 
    },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: '$budget.amount' },
        totalSpent: { $sum: '$budget.spent' }
      }
    }
  ]);

  const budgetData = projectBudgets.length > 0 
    ? projectBudgets[0] 
    : { totalBudget: 0, totalSpent: 0 };

  // Asset Overview
  const totalAssets = await Asset.countDocuments({ companyId, isDeleted: false });
  const assignedAssets = await Asset.countDocuments({ 
    companyId, 
    status: 'Assigned', 
    isDeleted: false 
  });

  return {
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      newHiresThisMonth,
      attritionRate: parseFloat(attritionRate)
    },
    attendance: {
      presentToday: todayAttendance,
      absentToday,
      attendanceRate: activeEmployees > 0 
        ? ((todayAttendance / activeEmployees) * 100).toFixed(2)
        : 0
    },
    leaves: {
      pendingRequests: pendingLeaveRequests
    },
    projects: {
      total: totalProjects,
      active: activeProjects,
      totalBudget: budgetData.totalBudget,
      totalSpent: budgetData.totalSpent,
      remaining: budgetData.totalBudget - budgetData.totalSpent
    },
    assets: {
      total: totalAssets,
      assigned: assignedAssets,
      available: totalAssets - assignedAssets
    }
  };
};

/**
 * Get HR Dashboard
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} HR dashboard data
 */
const getHRDashboard = async (companyId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Leave Trends
  const leavesThisMonth = await LeaveRequest.countDocuments({
    companyId,
    startDate: { $gte: startOfMonth }
  });

  const leavesLastMonth = await LeaveRequest.countDocuments({
    companyId,
    startDate: { $gte: lastMonth, $lt: startOfMonth }
  });

  const leavesByType = await LeaveRequest.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $group: { _id: '$leaveType', count: { $sum: 1 } } }
  ]);

  // Pending Actions
  const pendingLeaves = await LeaveRequest.countDocuments({
    companyId,
    status: 'Pending'
  });

  const pendingRegularizations = await Attendance.countDocuments({
    companyId,
    isRegularized: true,
    regularizationApprovedBy: null
  });

  // Performance Reviews Due
  const reviewsDue = await PerformanceReview.countDocuments({
    companyId,
    status: { $in: ['Draft', 'Submitted'] },
    reviewPeriodEnd: { $lt: today }
  });

  // Compliance Metrics
  const employeesWithoutDocuments = await Employee.countDocuments({
    companyId,
    status: 'Active',
    'documents': { $size: 0 },
    isDeleted: false
  });

  return {
    leaveTrends: {
      thisMonth: leavesThisMonth,
      lastMonth: leavesLastMonth,
      trend: leavesLastMonth > 0 
        ? ((leavesThisMonth - leavesLastMonth) / leavesLastMonth * 100).toFixed(2)
        : 0,
      byType: leavesByType
    },
    pendingActions: {
      leaveRequests: pendingLeaves,
      regularizations: pendingRegularizations,
      performanceReviews: reviewsDue
    },
    compliance: {
      employeesWithoutDocuments,
      complianceRate: employeesWithoutDocuments === 0 ? 100 : 85 // Simplified
    }
  };
};

/**
 * Get Manager Dashboard
 * @param {string} managerId - Manager Employee ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Manager dashboard data
 */
const getManagerDashboard = async (managerId, companyId) => {
  // Get team members
  const teamMembers = await Employee.find({
    companyId,
    managerId,
    status: 'Active',
    isDeleted: false
  }).select('_id');

  const teamMemberIds = teamMembers.map(e => e._id);
  const teamSize = teamMemberIds.length;

  if (teamSize === 0) {
    return {
      message: 'No team members found',
      teamSize: 0
    };
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Team Attendance
  const presentToday = await Attendance.countDocuments({
    companyId,
    employeeId: { $in: teamMemberIds },
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999))
    },
    status: 'Present'
  });

  // Pending Approvals
  const pendingLeaves = await LeaveRequest.countDocuments({
    companyId,
    employeeId: { $in: teamMemberIds },
    status: 'Pending'
  });

  // Team Projects
  const teamProjects = await Project.countDocuments({
    companyId,
    managerId,
    status: 'Active',
    isDeleted: false
  });

  // Upcoming Deadlines
  const upcomingDeadlines = await Project.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        managerId: new mongoose.Types.ObjectId(managerId),
        status: 'Active',
        isDeleted: false
      }
    },
    { $unwind: '$milestones' },
    {
      $match: {
        'milestones.status': { $ne: 'Completed' },
        'milestones.dueDate': { 
          $gte: today, 
          $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) 
        }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 }
      }
    }
  ]);

  const deadlineCount = upcomingDeadlines.length > 0 ? upcomingDeadlines[0].count : 0;

  // Budget Usage
  const projectBudgets = await Project.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        managerId: new mongoose.Types.ObjectId(managerId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: '$budget.amount' },
        totalSpent: { $sum: '$budget.spent' }
      }
    }
  ]);

  const budgetData = projectBudgets.length > 0 
    ? projectBudgets[0] 
    : { totalBudget: 0, totalSpent: 0 };

  const budgetUsagePercentage = budgetData.totalBudget > 0
    ? ((budgetData.totalSpent / budgetData.totalBudget) * 100).toFixed(2)
    : 0;

  return {
    team: {
      size: teamSize,
      presentToday,
      absentToday: teamSize - presentToday,
      attendanceRate: teamSize > 0 
        ? ((presentToday / teamSize) * 100).toFixed(2)
        : 0
    },
    pendingActions: {
      leaveApprovals: pendingLeaves
    },
    projects: {
      active: teamProjects,
      upcomingDeadlines: deadlineCount,
      budgetUsage: parseFloat(budgetUsagePercentage)
    },
    budget: {
      allocated: budgetData.totalBudget,
      spent: budgetData.totalSpent,
      remaining: budgetData.totalBudget - budgetData.totalSpent
    }
  };
};

/**
 * Global Search across entities
 * @param {string} companyId - Company ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} Search results
 */
const globalSearch = async (companyId, searchTerm) => {
  const regex = new RegExp(searchTerm, 'i');

  // Search Employees
  const employees = await Employee.find({
    companyId,
    isDeleted: false,
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { empCode: regex }
    ]
  })
    .select('firstName lastName email empCode role department')
    .limit(10)
    .lean();

  // Search Projects
  const projects = await Project.find({
    companyId,
    isDeleted: false,
    $or: [
      { name: regex },
      { code: regex },
      { 'client.name': regex }
    ]
  })
    .select('name code status priority')
    .limit(10)
    .lean();

  // Search Assets
  const assets = await Asset.find({
    companyId,
    isDeleted: false,
    $or: [
      { name: regex },
      { assetId: regex },
      { serialNumber: regex }
    ]
  })
    .select('name assetId status category')
    .limit(10)
    .lean();

  return {
    employees,
    projects,
    assets,
    totalResults: employees.length + projects.length + assets.length
  };
};

module.exports = {
  getAdminDashboard,
  getHRDashboard,
  getManagerDashboard,
  globalSearch
};
