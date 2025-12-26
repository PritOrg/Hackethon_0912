/**
 * Company Settings Service
 * Handles company configuration and settings management
 * 
 * @module services/companySettingsService
 */

const Company = require('../schemas/company');

/**
 * Get company settings
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company settings
 */
const getCompanySettings = async (companyId) => {
  const company = await Company.findById(companyId)
    .select('name settings subscriptionPlan subscriptionStatus subscriptionStartDate subscriptionEndDate trialEndsAt employeeCount maxEmployees');

  if (!company) {
    throw new Error('Company not found');
  }

  return company;
};

/**
 * Update company settings
 * @param {string} companyId - Company ID
 * @param {Object} updates - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
const updateCompanySettings = async (companyId, updates) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error('Company not found');
  }

  // Update nested settings
  if (updates.attendance) {
    company.settings.attendance = { 
      ...company.settings.attendance, 
      ...updates.attendance 
    };
  }

  if (updates.leave) {
    company.settings.leave = { 
      ...company.settings.leave, 
      ...updates.leave 
    };
  }

  if (updates.payroll) {
    company.settings.payroll = { 
      ...company.settings.payroll, 
      ...updates.payroll 
    };
  }

  if (updates.security) {
    company.settings.security = { 
      ...company.settings.security, 
      ...updates.security 
    };
  }

  await company.save();
  return company.settings;
};

/**
 * Get billing/subscription information
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Billing information
 */
const getBillingInfo = async (companyId) => {
  const company = await Company.findById(companyId)
    .select('name subscriptionPlan subscriptionStatus subscriptionStartDate subscriptionEndDate trialEndsAt employeeCount maxEmployees billingEmail paymentMethod');

  if (!company) {
    throw new Error('Company not found');
  }

  return {
    companyName: company.name,
    plan: company.subscriptionPlan,
    status: company.subscriptionStatus,
    startDate: company.subscriptionStartDate,
    endDate: company.subscriptionEndDate,
    trialEndsAt: company.trialEndsAt,
    employeeCount: company.employeeCount,
    maxEmployees: company.maxEmployees,
    billingEmail: company.billingEmail,
    paymentMethod: company.paymentMethod
  };
};

/**
 * Upgrade subscription plan
 * @param {string} companyId - Company ID
 * @param {Object} upgradeData - Upgrade details
 * @returns {Promise<Object>} Updated subscription
 */
const upgradeSubscription = async (companyId, upgradeData) => {
  const { plan, maxEmployees, billingCycle } = upgradeData;

  const company = await Company.findById(companyId);

  if (!company) {
    throw new Error('Company not found');
  }

  // NOTE: In production, integrate with payment gateway (Stripe, PayPal, etc.)
  // This is a simplified version without actual payment processing

  company.subscriptionPlan = plan;
  company.maxEmployees = maxEmployees;
  company.subscriptionStatus = 'active';
  
  if (!company.subscriptionStartDate) {
    company.subscriptionStartDate = new Date();
  }

  // Calculate end date based on billing cycle
  const endDate = new Date();
  if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  company.subscriptionEndDate = endDate;

  // Clear trial
  company.trialEndsAt = undefined;

  await company.save();

  return {
    plan: company.subscriptionPlan,
    status: company.subscriptionStatus,
    endDate: company.subscriptionEndDate,
    message: 'Subscription upgraded successfully'
  };
};

/**
 * Get audit logs (system-wide changes)
 * @param {string} companyId - Company ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Array>} Audit logs
 */
const getAuditLogs = async (companyId, query) => {
  // NOTE: Implement audit logging system
  // This requires a separate AuditLog schema to track all changes
  // For now, return a placeholder structure

  return {
    message: 'Audit logging system not yet implemented',
    recommendation: 'Implement AuditLog schema to track: user actions, IP addresses, timestamps, changed fields, old/new values'
  };
};

module.exports = {
  getCompanySettings,
  updateCompanySettings,
  getBillingInfo,
  upgradeSubscription,
  getAuditLogs
};
