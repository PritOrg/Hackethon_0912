/**
 * Holiday Service
 * Business logic for holiday management
 * Handles company holidays, regional calendars, and year-wise planning
 * 
 * @module services/holidayService
 */

const Holiday = require('../schemas/holiday');
const Company = require('../schemas/company');

/**
 * Create a new holiday
 * @param {Object} holidayData - Holiday information
 * @param {String} holidayData.companyId - Company ID
 * @param {String} holidayData.name - Holiday name
 * @param {Date} holidayData.date - Holiday date
 * @param {String} holidayData.type - Holiday type (National, Regional, Company)
 * @param {String} holidayData.description - Holiday description
 * @returns {Promise<Object>} Created holiday
 * @throws {Error} If date conflict or validation fails
 */
const createHoliday = async (holidayData) => {
  const { companyId, name, date, type } = holidayData;

  // Check for duplicate holiday on same date for same company
  const existingHoliday = await Holiday.findOne({
    companyId,
    date: {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999)
    }
  });

  if (existingHoliday) {
    throw new Error(`Holiday already exists on ${new Date(date).toDateString()}: ${existingHoliday.name}`);
  }

  // Create holiday
  const holiday = new Holiday({
    ...holidayData,
    createdAt: new Date()
  });

  await holiday.save();

  // Add holiday to company's holiday array
  await Company.findByIdAndUpdate(companyId, {
    $push: { holidays: holiday._id }
  });

  return holiday;
};

/**
 * Get holidays with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {String} filters.companyId - Company ID
 * @param {Number} filters.year - Filter by year
 * @param {String} filters.type - Filter by type (National, Regional, Company)
 * @param {Number} filters.page - Page number
 * @param {Number} filters.limit - Items per page
 * @returns {Promise<Object>} Holidays with pagination
 */
const getHolidays = async (filters) => {
  const { companyId, year, type, page = 1, limit = 50 } = filters;

  // Build query
  const query = { companyId };

  // Filter by year
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  // Filter by type
  if (type) {
    query.type = type;
  }

  // Count total documents
  const total = await Holiday.countDocuments(query);

  // Fetch holidays
  const holidays = await Holiday.find(query)
    .sort({ date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    holidays,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get holiday by ID
 * @param {String} holidayId - Holiday ID
 * @returns {Promise<Object>} Holiday details
 * @throws {Error} If holiday not found
 */
const getHolidayById = async (holidayId) => {
  const holiday = await Holiday.findById(holidayId).lean();

  if (!holiday) {
    throw new Error('Holiday not found');
  }

  return holiday;
};

/**
 * Update holiday
 * @param {String} holidayId - Holiday ID
 * @param {Object} updateData - Updated holiday data
 * @returns {Promise<Object>} Updated holiday
 * @throws {Error} If holiday not found or date conflict
 */
const updateHoliday = async (holidayId, updateData) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error('Holiday not found');
  }

  // If date is being changed, check for conflicts
  if (updateData.date && new Date(updateData.date).getTime() !== new Date(holiday.date).getTime()) {
    const conflictingHoliday = await Holiday.findOne({
      _id: { $ne: holidayId },
      companyId: holiday.companyId,
      date: {
        $gte: new Date(updateData.date).setHours(0, 0, 0, 0),
        $lt: new Date(updateData.date).setHours(23, 59, 59, 999)
      }
    });

    if (conflictingHoliday) {
      throw new Error(`Holiday already exists on ${new Date(updateData.date).toDateString()}: ${conflictingHoliday.name}`);
    }
  }

  // Update holiday
  Object.assign(holiday, updateData);
  holiday.updatedAt = new Date();
  await holiday.save();

  return holiday;
};

/**
 * Delete holiday
 * @param {String} holidayId - Holiday ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If holiday not found
 */
const deleteHoliday = async (holidayId) => {
  const holiday = await Holiday.findById(holidayId);

  if (!holiday) {
    throw new Error('Holiday not found');
  }

  // Remove from company's holiday array
  await Company.findByIdAndUpdate(holiday.companyId, {
    $pull: { holidays: holidayId }
  });

  await Holiday.findByIdAndDelete(holidayId);

  return { message: 'Holiday deleted successfully' };
};

/**
 * Get holidays for a specific year with calendar view
 * @param {String} companyId - Company ID
 * @param {Number} year - Year
 * @returns {Promise<Object>} Holiday calendar grouped by month
 */
const getHolidayCalendar = async (companyId, year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const holidays = await Holiday.find({
    companyId,
    date: { $gte: startDate, $lte: endDate }
  })
    .sort({ date: 1 })
    .lean();

  // Group by month
  const calendar = {};
  holidays.forEach((holiday) => {
    const month = new Date(holiday.date).getMonth() + 1; // 1-12
    if (!calendar[month]) {
      calendar[month] = [];
    }
    calendar[month].push(holiday);
  });

  return {
    year,
    totalHolidays: holidays.length,
    calendar
  };
};

/**
 * Bulk create holidays for a year
 * @param {String} companyId - Company ID
 * @param {Array} holidaysData - Array of holiday objects
 * @returns {Promise<Object>} Created holidays
 * @throws {Error} If validation fails
 */
const bulkCreateHolidays = async (companyId, holidaysData) => {
  // Validate all dates for conflicts
  const dates = holidaysData.map(h => new Date(h.date).setHours(0, 0, 0, 0));
  const uniqueDates = [...new Set(dates)];

  if (dates.length !== uniqueDates.length) {
    throw new Error('Duplicate dates found in the holiday list');
  }

  // Check for existing holidays
  const existingHolidays = await Holiday.find({
    companyId,
    date: { $in: dates }
  });

  if (existingHolidays.length > 0) {
    const conflictDates = existingHolidays.map(h => new Date(h.date).toDateString());
    throw new Error(`Holidays already exist on: ${conflictDates.join(', ')}`);
  }

  // Create all holidays
  const holidays = holidaysData.map(h => ({
    ...h,
    companyId,
    createdAt: new Date()
  }));

  const createdHolidays = await Holiday.insertMany(holidays);

  // Add holiday IDs to company
  const holidayIds = createdHolidays.map(h => h._id);
  await Company.findByIdAndUpdate(companyId, {
    $push: { holidays: { $each: holidayIds } }
  });

  return {
    message: `${createdHolidays.length} holidays created successfully`,
    holidays: createdHolidays
  };
};

/**
 * Get upcoming holidays
 * @param {String} companyId - Company ID
 * @param {Number} days - Number of days to look ahead (default 30)
 * @returns {Promise<Array>} Upcoming holidays
 */
const getUpcomingHolidays = async (companyId, days = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);

  const holidays = await Holiday.find({
    companyId,
    date: { $gte: today, $lte: endDate }
  })
    .sort({ date: 1 })
    .lean();

  return holidays;
};

module.exports = {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  getHolidayCalendar,
  bulkCreateHolidays,
  getUpcomingHolidays
};
