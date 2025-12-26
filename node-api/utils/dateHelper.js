/**
 * Date Helper Utilities
 * Common date manipulation and calculation functions
 * 
 * @module utils/dateHelper
 */

/**
 * Get start of day (00:00:00.000)
 * @param {Date|string} date - Date to process
 * @returns {Date} Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day (23:59:59.999)
 * @param {Date|string} date - Date to process
 * @returns {Date} End of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Calculate business days between two dates (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Array<Date>} holidays - Array of holiday dates to exclude
 * @returns {number} Number of business days
 */
const calculateBusinessDays = (startDate, endDate, holidays = []) => {
  let count = 0;
  const holidayStrings = holidays.map(h => h.toISOString().split('T')[0]);
  
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Not weekend and not holiday
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateString)) {
      count++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

/**
 * Calculate difference in days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
const daysDifference = (startDate, endDate) => {
  const start = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
};

/**
 * Calculate duration in hours between two timestamps
 * @param {Date} startTime - Start timestamp
 * @param {Date} endTime - End timestamp
 * @returns {number} Duration in hours (decimal)
 */
const calculateHours = (startTime, endTime) => {
  const diffMs = new Date(endTime) - new Date(startTime);
  return diffMs / (1000 * 60 * 60);
};

/**
 * Format duration in hours to HH:MM format
 * @param {number} hours - Duration in hours (decimal)
 * @returns {string} Formatted duration (e.g., "8:30")
 */
const formatHoursToHHMM = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
};

/**
 * Check if date is weekend
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend
 */
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

/**
 * Check if date is holiday
 * @param {Date} date - Date to check
 * @param {Array<Date>} holidays - Array of holiday dates
 * @returns {boolean} True if holiday
 */
const isHoliday = (date, holidays = []) => {
  const dateString = new Date(date).toISOString().split('T')[0];
  return holidays.some(h => h.toISOString().split('T')[0] === dateString);
};

/**
 * Get first day of month
 * @param {Date} date - Date in the month
 * @returns {Date} First day of month
 */
const getFirstDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get last day of month
 * @param {Date} date - Date in the month
 * @returns {Date} Last day of month
 */
const getLastDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
const isSameDay = (date1, date2) => {
  return getStartOfDay(date1).getTime() === getStartOfDay(date2).getTime();
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  calculateBusinessDays,
  daysDifference,
  calculateHours,
  formatHoursToHHMM,
  isWeekend,
  isHoliday,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  addDays,
  isSameDay
};
