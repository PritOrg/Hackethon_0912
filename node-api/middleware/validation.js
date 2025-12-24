const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // Employee validation
  createEmployee: Joi.object({
    companyId: Joi.string().required(),
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow('', null),
    lastName: Joi.string().required(),
    birthdate: Joi.date().required(),
    role: Joi.string().required(),
    joiningDate: Joi.date().required(),
    expertise: Joi.array().items(Joi.string()),
    projects: Joi.array().items(Joi.string()),
    profilePic: Joi.string().allow('', null),
    achievements: Joi.array().items(Joi.string()),
    jobShift: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().required(),
    emergencyContact: Joi.string().required(),
    department: Joi.string().required(),
    position: Joi.string().required(),
    salary: Joi.number().positive().required(),
  }),

  updateEmployee: Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    firstName: Joi.string(),
    middleName: Joi.string().allow('', null),
    lastName: Joi.string(),
    birthdate: Joi.date(),
    role: Joi.string(),
    expertise: Joi.array().items(Joi.string()),
    projects: Joi.array().items(Joi.string()),
    profilePic: Joi.string().allow('', null),
    achievements: Joi.array().items(Joi.string()),
    jobShift: Joi.string(),
    phoneNumber: Joi.string(),
    address: Joi.string(),
    emergencyContact: Joi.string(),
    department: Joi.string(),
    position: Joi.string(),
    salary: Joi.number().positive(),
  }).min(1), // At least one field required

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Leave request validation
  createLeaveRequest: Joi.object({
    employeeId: Joi.string().required(),
    leaveType: Joi.string().valid('annualLeave', 'sickLeave', 'casualLeave', 'privilegeLeave', 'maternityLeave', 'halfDayLeave').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    reason: Joi.string().required(),
    approverId: Joi.string().allow('', null),
  }),

  updateLeaveRequest: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    approverId: Joi.string(),
    approvalDate: Joi.date(),
    rejectionReason: Joi.string().allow('', null),
  }).min(1),

  // Company validation
  createCompany: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    industry: Joi.string(),
    website: Joi.string().uri().allow('', null),
  }),

  // Attendance validation
  createAttendance: Joi.object({
    employeeId: Joi.string().required(),
    companyId: Joi.string().required(),
    date: Joi.date().required(),
    checkIn: Joi.string().required(),
    checkOut: Joi.string().allow('', null),
    status: Joi.string().valid('present', 'absent', 'half-day', 'late').required(),
  }),

  // Holiday validation
  createHoliday: Joi.object({
    companyId: Joi.string().required(),
    name: Joi.string().required(),
    date: Joi.date().required(),
    type: Joi.string().valid('public', 'company', 'optional'),
    description: Joi.string().allow('', null),
  }),

  // Query validation
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  // MongoDB ObjectId validation
  objectId: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }),
};

module.exports = {
  validate,
  schemas,
};
