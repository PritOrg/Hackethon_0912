/**
 * Shift Management Service
 * Handles shift templates and roster assignments
 * 
 * @module services/shiftService
 */

const { Shift, Roster } = require('../schemas/shift');
const Employee = require('../schemas/employee');

/**
 * Get all shift templates
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} Shift templates
 */
const getShifts = async (companyId) => {
  const shifts = await Shift.find({ companyId, isActive: true })
    .sort({ name: 1 })
    .lean();

  return shifts;
};

/**
 * Create shift template
 * @param {Object} shiftData - Shift data
 * @param {string} createdBy - Employee ID
 * @returns {Promise<Object>} Created shift
 */
const createShift = async (shiftData, createdBy) => {
  const { companyId, name } = shiftData;

  // Generate code if not provided
  if (!shiftData.code) {
    const count = await Shift.countDocuments({ companyId });
    shiftData.code = `SHIFT-${name.toUpperCase().replace(/\s+/g, '-')}-${count + 1}`;
  }

  const shift = new Shift({
    ...shiftData,
    createdBy
  });

  await shift.save();
  return shift;
};

/**
 * Assign shift to employee/team
 * @param {Object} assignmentData - Assignment details
 * @param {string} createdBy - Employee ID
 * @returns {Promise<Object>} Created roster
 */
const assignShift = async (assignmentData, createdBy) => {
  const { companyId, employeeIds, shiftId, startDate, endDate, recurring } = assignmentData;

  // Validate shift exists
  const shift = await Shift.findOne({ _id: shiftId, companyId, isActive: true });
  if (!shift) {
    throw new Error('Shift not found or inactive');
  }

  // Validate employees
  const employees = await Employee.find({
    _id: { $in: employeeIds },
    companyId,
    status: 'Active'
  });

  if (employees.length !== employeeIds.length) {
    throw new Error('One or more employees not found or inactive');
  }

  // Create roster entries for each employee
  const rosters = [];
  for (const employeeId of employeeIds) {
    const roster = new Roster({
      companyId,
      employeeId,
      shiftId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      recurring: recurring || { enabled: false },
      status: 'Scheduled',
      createdBy
    });

    await roster.save();
    rosters.push(roster);
  }

  return rosters;
};

/**
 * Get team roster/schedule
 * @param {string} companyId - Company ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Array>} Roster entries
 */
const getTeamRoster = async (companyId, query) => {
  const filter = { companyId };

  // Date range filter
  if (query.startDate || query.endDate) {
    filter.startDate = {};
    if (query.startDate) filter.startDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.startDate.$lte = new Date(query.endDate);
  }

  if (query.employeeId) filter.employeeId = query.employeeId;
  if (query.shiftId) filter.shiftId = query.shiftId;
  if (query.status) filter.status = query.status;

  const rosters = await Roster.find(filter)
    .populate('employeeId', 'firstName lastName email empCode')
    .populate('shiftId', 'name code startTime endTime')
    .sort({ startDate: 1 })
    .lean();

  return rosters;
};

/**
 * Request shift swap with colleague
 * @param {string} rosterId - Roster ID
 * @param {Object} swapData - Swap request data
 * @returns {Promise<Object>} Updated roster
 */
const requestShiftSwap = async (rosterId, swapData) => {
  const { requestedBy, swapWithEmployeeId, reason } = swapData;

  const roster = await Roster.findById(rosterId);

  if (!roster) {
    throw new Error('Roster not found');
  }

  if (roster.employeeId.toString() !== requestedBy.toString()) {
    throw new Error('You can only swap your own shifts');
  }

  // Check if swap target employee exists
  const targetEmployee = await Employee.findOne({
    _id: swapWithEmployeeId,
    companyId: roster.companyId,
    status: 'Active'
  });

  if (!targetEmployee) {
    throw new Error('Target employee not found or inactive');
  }

  // Create swap request
  roster.swapRequest = {
    requestedBy,
    swapWithEmployeeId,
    requestDate: new Date(),
    status: 'Pending',
    reason
  };

  await roster.save();
  return roster.populate(['employeeId', 'shiftId', 'swapRequest.swapWithEmployeeId']);
};

/**
 * Approve/Reject shift swap
 * @param {string} rosterId - Roster ID
 * @param {Object} approvalData - Approval data
 * @returns {Promise<Object>} Updated roster
 */
const approveShiftSwap = async (rosterId, approvalData) => {
  const { approvedBy, action } = approvalData; // action: 'approve' | 'reject'

  const roster = await Roster.findById(rosterId);

  if (!roster) {
    throw new Error('Roster not found');
  }

  if (!roster.swapRequest || roster.swapRequest.status !== 'Pending') {
    throw new Error('No pending swap request found');
  }

  if (action === 'approve') {
    // Swap the assignments
    const originalEmployeeId = roster.employeeId;
    const swapWithEmployeeId = roster.swapRequest.swapWithEmployeeId;

    // Find the other roster entry for the swap target
    const targetRoster = await Roster.findOne({
      companyId: roster.companyId,
      employeeId: swapWithEmployeeId,
      shiftId: roster.shiftId,
      startDate: roster.startDate
    });

    if (targetRoster) {
      // Swap assignments
      roster.employeeId = swapWithEmployeeId;
      targetRoster.employeeId = originalEmployeeId;

      roster.swapRequest.status = 'Approved';
      roster.swapRequest.approvedBy = approvedBy;
      roster.swapRequest.approvalDate = new Date();

      await roster.save();
      await targetRoster.save();
    } else {
      throw new Error('Target roster not found for swap');
    }
  } else {
    roster.swapRequest.status = 'Rejected';
    roster.swapRequest.approvedBy = approvedBy;
    roster.swapRequest.approvalDate = new Date();
    await roster.save();
  }

  return roster;
};

/**
 * Update roster status
 * @param {string} rosterId - Roster ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated roster
 */
const updateRosterStatus = async (rosterId, status) => {
  const roster = await Roster.findById(rosterId);

  if (!roster) {
    throw new Error('Roster not found');
  }

  roster.status = status;
  await roster.save();

  return roster;
};

module.exports = {
  getShifts,
  createShift,
  assignShift,
  getTeamRoster,
  requestShiftSwap,
  approveShiftSwap,
  updateRosterStatus
};
