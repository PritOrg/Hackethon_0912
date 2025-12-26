/**
 * Attendance Service
 * Business logic for attendance management operations
 * Handles clock-in/out, breaks, regularization, and attendance calculations
 * 
 * @module services/attendanceService
 */

const Attendance = require('../schemas/attendance');
const Employee = require('../schemas/employee');
const Company = require('../schemas/company');
const { getStartOfDay, getEndOfDay, calculateHours } = require('../utils/dateHelper');

/**
 * Clock in employee
 * @param {Object} data - Clock-in data
 * @returns {Promise<Object>} Attendance record
 */
const clockIn = async (data) => {
  const { employeeId, companyId, location, deviceInfo, ipAddress, userAgent } = data;

  // Check if already clocked in today
  const today = getStartOfDay();
  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });

  if (existingAttendance && existingAttendance.shifts.some(shift => !shift.clockOut)) {
    throw new Error('You have already clocked in and not clocked out yet');
  }

  // Get company geo-fencing settings
  const company = await Company.findById(companyId);
  if (company?.settings?.attendance?.enableGeoFencing && location) {
    // Validate location is within allowed radius
    const { latitude, longitude, radius } = company.settings.attendance.geoFencing;
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      latitude,
      longitude
    );
    
    if (distance > radius) {
      throw new Error(`You must be within ${radius}m of the office to clock in`);
    }
  }

  // Create or update attendance
  const shift = {
    clockIn: new Date(),
    inLocation: location ? {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      accuracy: location.accuracy
    } : null,
    deviceInfo: deviceInfo || {},
    ipAddress,
    userAgent,
    breaks: []
  };

  if (existingAttendance) {
    existingAttendance.shifts.push(shift);
    await existingAttendance.save();
    return existingAttendance;
  } else {
    const attendance = new Attendance({
      employeeId,
      companyId,
      date: today,
      shifts: [shift],
      status: 'Present'
    });
    await attendance.save();
    return attendance;
  }
};

/**
 * Clock out employee
 * @param {string} employeeId - Employee ID
 * @param {Object} location - Clock-out location
 * @returns {Promise<Object>} Updated attendance record
 */
const clockOut = async (employeeId, location) => {
  const today = getStartOfDay();
  
  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });

  if (!attendance) {
    throw new Error('No clock-in record found for today');
  }

  // Find the shift without clock-out
  const activeShift = attendance.shifts.find(shift => !shift.clockOut);
  if (!activeShift) {
    throw new Error('No active shift found. Already clocked out?');
  }

  activeShift.clockOut = new Date();
  if (location) {
    activeShift.outLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      accuracy: location.accuracy
    };
  }

  // Calculate hours
  attendance.calculateHours();
  await attendance.save();

  return attendance;
};

/**
 * Start a break
 * @param {string} employeeId - Employee ID
 * @param {string} breakType - Type of break (Lunch, Tea, Personal)
 * @returns {Promise<Object>} Updated attendance record
 */
const startBreak = async (employeeId, breakType = 'Personal') => {
  const today = getStartOfDay();
  
  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });

  if (!attendance) {
    throw new Error('Please clock in first');
  }

  // Find active shift
  const activeShift = attendance.shifts.find(shift => shift.clockIn && !shift.clockOut);
  if (!activeShift) {
    throw new Error('No active shift found');
  }

  // Check if there's an ongoing break
  const ongoingBreak = activeShift.breaks.find(b => b.startTime && !b.endTime);
  if (ongoingBreak) {
    throw new Error('You already have an active break');
  }

  activeShift.breaks.push({
    startTime: new Date(),
    type: breakType
  });

  await attendance.save();
  return attendance;
};

/**
 * End a break
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Updated attendance record
 */
const endBreak = async (employeeId) => {
  const today = getStartOfDay();
  
  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today }
  });

  if (!attendance) {
    throw new Error('No attendance record found');
  }

  // Find active shift
  const activeShift = attendance.shifts.find(shift => shift.clockIn && !shift.clockOut);
  if (!activeShift) {
    throw new Error('No active shift found');
  }

  // Find ongoing break
  const ongoingBreak = activeShift.breaks.find(b => b.startTime && !b.endTime);
  if (!ongoingBreak) {
    throw new Error('No active break found');
  }

  ongoingBreak.endTime = new Date();
  ongoingBreak.duration = calculateHours(ongoingBreak.startTime, ongoingBreak.endTime);

  await attendance.save();
  return attendance;
};

/**
 * Get attendance records with filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} { records, total }
 */
const getAttendance = async (filters) => {
  const {
    companyId,
    employeeId,
    startDate,
    endDate,
    status,
    page = 1,
    limit = 10
  } = filters;

  const query = {};
  if (companyId) query.companyId = companyId;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .populate('employeeId', 'firstName lastName empCode')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(query)
  ]);

  return { records, total };
};

/**
 * Request attendance regularization
 * @param {Object} data - Regularization request data
 * @returns {Promise<Object>} Updated attendance record
 */
const requestRegularization = async (data) => {
  const { attendanceId, reason, clockIn, clockOut } = data;

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  attendance.isRegularized = true;
  attendance.regularizationReason = reason;
  attendance.regularizationRequestDate = new Date();
  attendance.regularizationStatus = 'Pending';

  if (clockIn) attendance.shifts[0].clockIn = new Date(clockIn);
  if (clockOut) attendance.shifts[0].clockOut = new Date(clockOut);

  await attendance.save();
  return attendance;
};

/**
 * Approve/reject regularization
 * @param {string} attendanceId - Attendance ID
 * @param {string} status - Approved/Rejected
 * @param {string} approverId - Approver's employee ID
 * @returns {Promise<Object>} Updated attendance record
 */
const processRegularization = async (attendanceId, status, approverId) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  if (attendance.regularizationStatus !== 'Pending') {
    throw new Error('Regularization request has already been processed');
  }

  attendance.regularizationStatus = status;
  attendance.regularizationApprovedBy = approverId;
  attendance.regularizationApprovedDate = new Date();

  if (status === 'Rejected') {
    // Restore original times if rejected
    attendance.isRegularized = false;
  }

  await attendance.save();
  return attendance;
};

/**
 * Get attendance statistics
 * @param {string} companyId - Company ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Statistics
 */
const getAttendanceStats = async (companyId, startDate, endDate) => {
  const match = {
    companyId: companyId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  const stats = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0
  };

  stats.forEach(stat => {
    result[stat._id.toLowerCase()] = stat.count;
  });

  return result;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

module.exports = {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getAttendance,
  requestRegularization,
  processRegularization,
  getAttendanceStats
};
