/**
 * Leave Request Service
 * Business logic for leave request management operations
 * Handles leave application, approval workflow, balance tracking
 * 
 * @module services/leaveRequestService
 */

const LeaveRequest = require('../schemas/leaveRequest');
const Employee = require('../schemas/employee');
const Company = require('../schemas/company');
const { calculateBusinessDays, getStartOfDay } = require('../utils/dateHelper');

/**
 * Create new leave request
 * @param {Object} leaveData - Leave request data
 * @returns {Promise<Object>} Created leave request
 */
const createLeaveRequest = async (leaveData) => {
  const { employeeId, companyId, leaveType, startDate, endDate, reason } = leaveData;

  // Validate employee exists
  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get company holidays for accurate day count
  const company = await Company.findById(companyId);
  const holidays = company?.settings?.leave?.holidays || [];

  // Calculate day count
  const dayCount = calculateBusinessDays(
    new Date(startDate),
    new Date(endDate),
    holidays
  );

  // Check leave balance
  const leaveBalance = employee.leaveBalance[leaveType] || 0;
  if (dayCount > leaveBalance && !['unpaid'].includes(leaveType)) {
    throw new Error(`Insufficient ${leaveType} leave balance. Available: ${leaveBalance} days`);
  }

  // Check for overlapping leave requests
  const overlapping = await LeaveRequest.findOne({
    employeeId,
    status: { $in: ['Pending', 'Approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  if (overlapping) {
    throw new Error('You have an overlapping leave request');
  }

  // Create leave request with initial workflow entry
  const leaveRequest = new LeaveRequest({
    ...leaveData,
    dayCount,
    status: 'Pending',
    workflow: [{
      approverId: employee.managerId,
      status: 'Pending',
      actionDate: new Date()
    }]
  });

  await leaveRequest.save();
  return leaveRequest;
};

/**
 * Get leave requests with filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} { requests, total }
 */
const getLeaveRequests = async (filters) => {
  const {
    companyId,
    employeeId,
    status,
    leaveType,
    startDate,
    endDate,
    page = 1,
    limit = 10
  } = filters;

  const query = {};
  if (companyId) query.companyId = companyId;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate('employeeId', 'firstName lastName empCode email department')
      .populate('workflow.approverId', 'firstName lastName empCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LeaveRequest.countDocuments(query)
  ]);

  return { requests, total };
};

/**
 * Get leave request by ID
 * @param {string} requestId - Leave request ID
 * @returns {Promise<Object>} Leave request
 */
const getLeaveRequestById = async (requestId) => {
  const leaveRequest = await LeaveRequest.findById(requestId)
    .populate('employeeId', 'firstName lastName empCode email position department')
    .populate('managerId', 'firstName lastName empCode')
    .populate('workflow.approverId', 'firstName lastName empCode')
    .lean();

  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  return leaveRequest;
};

/**
 * Get pending approvals for a manager
 * @param {string} managerId - Manager's employee ID
 * @returns {Promise<Array>} Pending leave requests
 */
const getPendingApprovals = async (managerId) => {
  const requests = await LeaveRequest.find({
    'workflow.approverId': managerId,
    'workflow.status': 'Pending',
    status: 'Pending'
  })
    .populate('employeeId', 'firstName lastName empCode email position')
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

/**
 * Approve or reject leave request
 * @param {string} requestId - Leave request ID
 * @param {string} approverId - Approver's employee ID
 * @param {string} status - Approved/Rejected
 * @param {string} comment - Approval comment
 * @returns {Promise<Object>} Updated leave request
 */
const processLeaveRequest = async (requestId, approverId, status, comment) => {
  const leaveRequest = await LeaveRequest.findById(requestId);
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  if (leaveRequest.status !== 'Pending') {
    throw new Error('Leave request has already been processed');
  }

  // Find pending workflow entry for this approver
  const workflowEntry = leaveRequest.workflow.find(
    w => String(w.approverId) === String(approverId) && w.status === 'Pending'
  );

  if (!workflowEntry) {
    throw new Error('You are not authorized to approve this request');
  }

  // Update workflow entry
  workflowEntry.status = status;
  workflowEntry.comment = comment;
  workflowEntry.actionDate = new Date();

  // Update overall status
  leaveRequest.status = status;

  // If approved, deduct from leave balance
  if (status === 'Approved') {
    const employee = await Employee.findById(leaveRequest.employeeId);
    if (employee && employee.leaveBalance[leaveRequest.leaveType] !== undefined) {
      employee.leaveBalance[leaveRequest.leaveType] -= leaveRequest.dayCount;
      await employee.save();
    }
  }

  await leaveRequest.save();
  return leaveRequest;
};

/**
 * Cancel leave request
 * @param {string} requestId - Leave request ID
 * @param {string} employeeId - Employee ID (for authorization)
 * @returns {Promise<Object>} Updated leave request
 */
const cancelLeaveRequest = async (requestId, employeeId) => {
  const leaveRequest = await LeaveRequest.findById(requestId);
  if (!leaveRequest) {
    throw new Error('Leave request not found');
  }

  // Check ownership
  if (String(leaveRequest.employeeId) !== String(employeeId)) {
    throw new Error('You can only cancel your own leave requests');
  }

  // Can only cancel pending or approved requests
  if (!['Pending', 'Approved'].includes(leaveRequest.status)) {
    throw new Error('Cannot cancel this leave request');
  }

  const oldStatus = leaveRequest.status;
  leaveRequest.status = 'Cancelled';

  // If it was approved, restore leave balance
  if (oldStatus === 'Approved') {
    const employee = await Employee.findById(employeeId);
    if (employee && employee.leaveBalance[leaveRequest.leaveType] !== undefined) {
      employee.leaveBalance[leaveRequest.leaveType] += leaveRequest.dayCount;
      await employee.save();
    }
  }

  await leaveRequest.save();
  return leaveRequest;
};

/**
 * Get leave balance for employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Leave balance
 */
const getLeaveBalance = async (employeeId) => {
  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false })
    .select('leaveBalance firstName lastName empCode')
    .lean();

  if (!employee) {
    throw new Error('Employee not found');
  }

  return employee.leaveBalance;
};

/**
 * Get leave calendar (team members on leave)
 * @param {string} companyId - Company ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Leave requests in date range
 */
const getLeaveCalendar = async (companyId, startDate, endDate) => {
  const requests = await LeaveRequest.find({
    companyId,
    status: 'Approved',
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  })
    .populate('employeeId', 'firstName lastName empCode position department')
    .select('employeeId startDate endDate leaveType dayCount')
    .sort({ startDate: 1 })
    .lean();

  return requests;
};

/**
 * Get leave statistics
 * @param {string} companyId - Company ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics
 */
const getLeaveStatistics = async (companyId, startDate, endDate) => {
  const match = {
    companyId,
    status: 'Approved',
    startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const stats = await LeaveRequest.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$dayCount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {};
  stats.forEach(stat => {
    result[stat._id] = {
      totalDays: stat.totalDays,
      count: stat.count
    };
  });

  return result;
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  getPendingApprovals,
  processLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  getLeaveCalendar,
  getLeaveStatistics
};
