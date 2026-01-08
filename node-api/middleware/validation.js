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
    empCode: Joi.string().required(),
    username: Joi.string().min(3).max(30).allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow('', null),
    lastName: Joi.string().required(),
    birthdate: Joi.date().allow(null),
    role: Joi.string().valid('Admin', 'HR', 'Manager', 'Employee').default('Employee'),
    designation: Joi.string().required(),
    joiningDate: Joi.date().required(),
    expertise: Joi.array().items(Joi.string()),
    projects: Joi.array().items(Joi.string()),
    profilePic: Joi.string().allow('', null),
    achievements: Joi.array().items(Joi.string()),
    jobShift: Joi.string().valid('Morning', 'Evening', 'Night', 'Flexible'),
    phoneNumber: Joi.string().allow('', null),
    address: Joi.object({
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null)
    }),
    emergencyContact: Joi.object({
      name: Joi.string().allow('', null),
      relationship: Joi.string().allow('', null),
      phoneNumber: Joi.string().allow('', null),
      email: Joi.string().email().allow('', null)
    }),
    department: Joi.string().allow('', null),
    position: Joi.string().allow('', null),
    status: Joi.string().valid('Active', 'Probation', 'Notice Period', 'Terminated', 'Resigned', 'On Leave').default('Active'),
    employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').default('Full-Time'),
    salary: Joi.object({
      amount: Joi.number().positive().required(),
      currency: Joi.string().default('USD'),
      structure: Joi.string().valid('Hourly', 'Fixed', 'Contract').default('Fixed'),
      breakdown: Joi.object({
        basic: Joi.number().allow(null),
        hra: Joi.number().allow(null),
        allowances: Joi.number().allow(null),
        bonus: Joi.number().allow(null),
        deductions: Joi.number().allow(null)
      })
    }).required()
  }),

  updateEmployee: Joi.object({
    username: Joi.string().min(3).max(30).allow('', null),
    email: Joi.string().email(),
    firstName: Joi.string(),
    middleName: Joi.string().allow('', null),
    lastName: Joi.string(),
    birthdate: Joi.date(),
    role: Joi.string().valid('Admin', 'HR', 'Manager', 'Employee'),
    designation: Joi.string(),
    joiningDate: Joi.date(),
    expertise: Joi.array().items(Joi.string()),
    projects: Joi.array().items(Joi.string()),
    profilePic: Joi.string().allow('', null),
    achievements: Joi.array().items(Joi.string()),
    jobShift: Joi.string().valid('Morning', 'Evening', 'Night', 'Flexible'),
    phoneNumber: Joi.string(),
    address: Joi.object({
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null)
    }),
    emergencyContact: Joi.object({
      name: Joi.string().allow('', null),
      relationship: Joi.string().allow('', null),
      phoneNumber: Joi.string().allow('', null),
      email: Joi.string().email().allow('', null)
    }),
    department: Joi.string().allow('', null),
    position: Joi.string().allow('', null),
    status: Joi.string().valid('Active', 'Probation', 'Notice Period', 'Terminated', 'Resigned', 'On Leave'),
    employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern'),
    salary: Joi.object({
      amount: Joi.number().positive(),
      currency: Joi.string(),
      structure: Joi.string().valid('Hourly', 'Fixed', 'Contract'),
      breakdown: Joi.object({
        basic: Joi.number().allow(null),
        hra: Joi.number().allow(null),
        allowances: Joi.number().allow(null),
        bonus: Joi.number().allow(null),
        deductions: Joi.number().allow(null)
      })
    })
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

  // Company registration validation (SaaS)
  registerCompany: Joi.object({
    companyName: Joi.string().required(),
    companyType: Joi.string().required(),
    industry: Joi.string().required(),
    registrationNumber: Joi.string().allow('', null),
    taxId: Joi.string().allow('', null),
    website: Joi.string().uri().allow('', null),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    adminUser: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      password: Joi.string().min(8).required(),
    }).required(),
    subscriptionPlan: Joi.string().valid('basic', 'professional', 'enterprise').required(),
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
