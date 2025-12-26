/**
 * Company Service
 * Business logic for company management operations
 * 
 * @module services/companyService
 */

const Company = require('../schemas/company');
const Employee = require('../schemas/employee');

/**
 * Create new company (SaaS registration)
 * @param {Object} companyData - Company data
 * @returns {Promise<Object>} Created company
 */
const createCompany = async (companyData) => {
  // Check if company name or registration number already exists
  const existing = await Company.findOne({
    $or: [
      { name: companyData.name },
      { registrationNumber: companyData.registrationNumber }
    ],
    isDeleted: false
  });

  if (existing) {
    throw new Error('Company name or registration number already exists');
  }

  const company = new Company({
    ...companyData,
    subscriptionStatus: companyData.subscriptionStatus || 'Trial',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
  });

  await company.save();
  return company;
};

/**
 * Get company by ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company data
 */
const getCompanyById = async (companyId) => {
  const company = await Company.findOne({ _id: companyId, isDeleted: false })
    .populate('admins', 'firstName lastName email empCode')
    .populate('createdBy', 'firstName lastName')
    .lean();

  if (!company) {
    throw new Error('Company not found');
  }

  // Get employee count
  const employeeCount = await Employee.countDocuments({ 
    companyId, 
    status: 'Active',
    isDeleted: false 
  });

  return { ...company, employeeCount };
};

/**
 * Update company
 * @param {string} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @param {string} updatedBy - Updater's employee ID
 * @returns {Promise<Object>} Updated company
 */
const updateCompany = async (companyId, updateData, updatedBy = null) => {
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    throw new Error('Company not found');
  }

  Object.assign(company, updateData);
  company.updatedBy = updatedBy;
  await company.save();

  return company;
};

/**
 * Update company settings
 * @param {string} companyId - Company ID
 * @param {Object} settings - Settings object
 * @param {string} updatedBy - Updater's employee ID
 * @returns {Promise<Object>} Updated company
 */
const updateSettings = async (companyId, settings, updatedBy = null) => {
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    throw new Error('Company not found');
  }

  // Merge settings
  company.settings = {
    ...company.settings,
    ...settings
  };
  company.updatedBy = updatedBy;
  await company.save();

  return company;
};

/**
 * Get company settings
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company settings
 */
const getSettings = async (companyId) => {
  const company = await Company.findOne({ _id: companyId, isDeleted: false })
    .select('settings')
    .lean();

  if (!company) {
    throw new Error('Company not found');
  }

  return company.settings;
};

/**
 * Update subscription status
 * @param {string} companyId - Company ID
 * @param {string} status - Subscription status
 * @param {Date} endDate - Subscription end date
 * @returns {Promise<Object>} Updated company
 */
const updateSubscription = async (companyId, status, endDate = null) => {
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    throw new Error('Company not found');
  }

  company.subscriptionStatus = status;
  if (endDate) {
    company.subscriptionEndDate = endDate;
  }
  await company.save();

  return company;
};

/**
 * Get company statistics
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Statistics
 */
const getCompanyStats = async (companyId) => {
  const [
    totalEmployees,
    activeEmployees,
    inactiveEmployees
  ] = await Promise.all([
    Employee.countDocuments({ companyId, isDeleted: false }),
    Employee.countDocuments({ companyId, status: 'Active', isDeleted: false }),
    Employee.countDocuments({ companyId, status: 'Inactive', isDeleted: false })
  ]);

  // Get department-wise count
  const departmentStats = await Employee.aggregate([
    { 
      $match: { 
        companyId: companyId,
        status: 'Active',
        isDeleted: false 
      } 
    },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'dept'
      }
    },
    {
      $project: {
        department: { $arrayElemAt: ['$dept.name', 0] },
        count: 1
      }
    }
  ]);

  return {
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    departmentStats
  };
};

module.exports = {
  createCompany,
  getCompanyById,
  updateCompany,
  updateSettings,
  getSettings,
  updateSubscription,
  getCompanyStats
};
