/**
 * Holiday Controller
 * HTTP handlers for holiday-related endpoints
 * 
 * @module controllers/holidayController
 */

const holidayService = require('../services/holidayService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, badRequestResponse, paginatedResponse } = require('../utils/responseHandler');

/**
 * Create a new holiday
 * @route   POST /api/holidays
 * @access  Admin, HR
 */
const createHoliday = asyncHandler(async (req, res) => {
  const { companyId, name, date, type, description } = req.body;

  if (!companyId || !name || !date || !type) {
    return badRequestResponse(res, 'Company ID, name, date, and type are required');
  }

  const holiday = await holidayService.createHoliday({
    companyId,
    name,
    date,
    type,
    description
  });

  createdResponse(res, 'Holiday created successfully', holiday);
});

/**
 * Get all holidays with filtering
 * @route   GET /api/holidays
 * @access  All authenticated users
 */
const getHolidays = asyncHandler(async (req, res) => {
  const { companyId, year, type, page, limit } = req.query;

  if (!companyId) {
    return badRequestResponse(res, 'Company ID is required');
  }

  const result = await holidayService.getHolidays({
    companyId,
    year: year ? parseInt(year) : undefined,
    type,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 50
  });

  paginatedResponse(res, 'Holidays retrieved successfully', result.holidays, result.pagination);
});

/**
 * Get holiday by ID
 * @route   GET /api/holidays/:id
 * @access  All authenticated users
 */
const getHolidayById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const holiday = await holidayService.getHolidayById(id);

  successResponse(res, 'Holiday retrieved successfully', holiday);
});

/**
 * Update holiday
 * @route   PUT /api/holidays/:id
 * @access  Admin, HR
 */
const updateHoliday = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const holiday = await holidayService.updateHoliday(id, updateData);

  successResponse(res, 'Holiday updated successfully', holiday);
});

/**
 * Delete holiday
 * @route   DELETE /api/holidays/:id
 * @access  Admin, HR
 */
const deleteHoliday = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await holidayService.deleteHoliday(id);

  successResponse(res, result.message);
});

/**
 * Get holiday calendar for a year
 * @route   GET /api/holidays/calendar/:companyId/:year
 * @access  All authenticated users
 */
const getHolidayCalendar = asyncHandler(async (req, res) => {
  const { companyId, year } = req.params;

  if (!year || isNaN(year)) {
    return badRequestResponse(res, 'Valid year is required');
  }

  const calendar = await holidayService.getHolidayCalendar(companyId, parseInt(year));

  successResponse(res, 'Holiday calendar retrieved successfully', calendar);
});

/**
 * Bulk create holidays
 * @route   POST /api/holidays/bulk
 * @access  Admin, HR
 */
const bulkCreateHolidays = asyncHandler(async (req, res) => {
  const { companyId, holidays } = req.body;

  if (!companyId || !holidays || !Array.isArray(holidays) || holidays.length === 0) {
    return badRequestResponse(res, 'Company ID and holidays array are required');
  }

  const result = await holidayService.bulkCreateHolidays(companyId, holidays);

  createdResponse(res, result.message, result.holidays);
});

/**
 * Get upcoming holidays
 * @route   GET /api/holidays/upcoming/:companyId
 * @access  All authenticated users
 */
const getUpcomingHolidays = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { days } = req.query;

  const holidays = await holidayService.getUpcomingHolidays(
    companyId,
    days ? parseInt(days) : 30
  );

  successResponse(res, 'Upcoming holidays retrieved successfully', holidays);
});

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
