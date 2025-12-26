/**
 * Query Helper Utilities
 * Common database query utilities for pagination, sorting, filtering
 * 
 * @module utils/queryHelper
 */

/**
 * Parse pagination parameters from request
 * @param {Object} query - Request query object
 * @returns {Object} Pagination parameters { page, limit, skip }
 */
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Parse sort parameters from request
 * @param {string} sortString - Sort string (e.g., "-createdAt,name")
 * @returns {Object} Mongoose sort object
 * 
 * @example
 * parseSort("-createdAt,name") => { createdAt: -1, name: 1 }
 */
const parseSort = (sortString) => {
  if (!sortString) return { createdAt: -1 };

  const sortObj = {};
  sortString.split(',').forEach(field => {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};

/**
 * Build search filter for text fields
 * @param {string} searchTerm - Search term
 * @param {Array<string>} fields - Fields to search in
 * @returns {Object} MongoDB $or query
 * 
 * @example
 * buildSearchFilter("john", ["firstName", "lastName", "email"])
 */
const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm || !fields || fields.length === 0) return {};

  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Build date range filter
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @param {string} field - Field name (default: 'createdAt')
 * @returns {Object} MongoDB date range query
 */
const buildDateRangeFilter = (startDate, endDate, field = 'createdAt') => {
  const filter = {};

  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) {
      filter[field].$gte = new Date(startDate);
    }
    if (endDate) {
      filter[field].$lte = new Date(endDate);
    }
  }

  return filter;
};

/**
 * Build filter from query parameters
 * @param {Object} query - Request query object
 * @param {Array<string>} allowedFilters - Allowed filter fields
 * @returns {Object} MongoDB filter object
 */
const buildFilter = (query, allowedFilters = []) => {
  const filter = {};

  allowedFilters.forEach(field => {
    if (query[field] !== undefined) {
      filter[field] = query[field];
    }
  });

  // Always exclude soft-deleted records unless explicitly requested
  if (query.includeDeleted !== 'true') {
    filter.isDeleted = false;
  }

  return filter;
};

/**
 * Get aggregate pipeline for pagination
 * @param {Array} pipeline - Existing aggregation pipeline
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} Pipeline with pagination stages
 */
const addPaginationToPipeline = (pipeline, page, limit) => {
  const skip = (page - 1) * limit;
  
  return [
    ...pipeline,
    { $skip: skip },
    { $limit: limit }
  ];
};

/**
 * Get total count for paginated queries
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Query filter
 * @returns {Promise<number>} Total count
 */
const getCount = async (Model, filter) => {
  return await Model.countDocuments(filter);
};

module.exports = {
  parsePagination,
  parseSort,
  buildSearchFilter,
  buildDateRangeFilter,
  buildFilter,
  addPaginationToPipeline,
  getCount
};
