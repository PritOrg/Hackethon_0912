/**
 * Department Service
 * Business logic for department management operations
 * 
 * @module services/departmentService
 */

const Department = require('../schemas/department');
const Employee = require('../schemas/employee');

/**
 * Create new department
 * @param {Object} departmentData - Department data
 * @param {string} createdBy - Creator's employee ID
 * @returns {Promise<Object>} Created department
 */
const createDepartment = async (departmentData, createdBy = null) => {
  const { companyId, name } = departmentData;

  // Check if department name already exists
  const existing = await Department.findOne({ 
    companyId, 
    name, 
    isDeleted: false 
  });
  
  if (existing) {
    throw new Error('Department name already exists');
  }

  // Validate head exists if provided
  if (departmentData.headId) {
    const head = await Employee.findOne({ 
      _id: departmentData.headId, 
      companyId, 
      isDeleted: false 
    });
    if (!head) {
      throw new Error('Department head not found');
    }
  }

  const department = new Department({
    ...departmentData,
    createdBy
  });

  await department.save();
  return department;
};

/**
 * Get departments with filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Departments
 */
const getDepartments = async (filters) => {
  const { companyId, includeDeleted } = filters;

  const query = { companyId };
  if (!includeDeleted) {
    query.isDeleted = false;
  }

  const departments = await Department.find(query)
    .populate('headId', 'firstName lastName email empCode')
    .populate('parentDepartmentId', 'name')
    .sort({ name: 1 })
    .lean();

  // Add employee count for each department
  const departmentsWithCount = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ 
        department: dept._id, 
        status: 'Active',
        isDeleted: false 
      });
      return { ...dept, employeeCount };
    })
  );

  return departmentsWithCount;
};

/**
 * Get department by ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} Department
 */
const getDepartmentById = async (departmentId) => {
  const department = await Department.findOne({ 
    _id: departmentId, 
    isDeleted: false 
  })
    .populate('headId', 'firstName lastName email empCode position')
    .populate('parentDepartmentId', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName')
    .lean();

  if (!department) {
    throw new Error('Department not found');
  }

  // Get employee count
  const employeeCount = await Employee.countDocuments({ 
    department: departmentId, 
    status: 'Active',
    isDeleted: false 
  });

  return { ...department, employeeCount };
};

/**
 * Update department
 * @param {string} departmentId - Department ID
 * @param {Object} updateData - Data to update
 * @param {string} updatedBy - Updater's employee ID
 * @returns {Promise<Object>} Updated department
 */
const updateDepartment = async (departmentId, updateData, updatedBy = null) => {
  const department = await Department.findOne({ _id: departmentId, isDeleted: false });
  if (!department) {
    throw new Error('Department not found');
  }

  // Check if new name conflicts
  if (updateData.name && updateData.name !== department.name) {
    const existing = await Department.findOne({
      companyId: department.companyId,
      name: updateData.name,
      _id: { $ne: departmentId },
      isDeleted: false
    });
    if (existing) {
      throw new Error('Department name already exists');
    }
  }

  // Validate new head
  if (updateData.headId) {
    const head = await Employee.findOne({ 
      _id: updateData.headId, 
      companyId: department.companyId,
      isDeleted: false 
    });
    if (!head) {
      throw new Error('Department head not found');
    }
  }

  Object.assign(department, updateData);
  department.updatedBy = updatedBy;
  await department.save();

  return department;
};

/**
 * Soft delete department
 * @param {string} departmentId - Department ID
 * @param {string} deletedBy - Deleter's employee ID
 * @returns {Promise<void>}
 */
const deleteDepartment = async (departmentId, deletedBy = null) => {
  const department = await Department.findOne({ _id: departmentId, isDeleted: false });
  if (!department) {
    throw new Error('Department not found');
  }

  // Check if department has active employees
  const employeeCount = await Employee.countDocuments({ 
    department: departmentId, 
    status: 'Active',
    isDeleted: false 
  });

  if (employeeCount > 0) {
    throw new Error(`Cannot delete department with ${employeeCount} active employees`);
  }

  department.isDeleted = true;
  department.deletedAt = new Date();
  department.deletedBy = deletedBy;
  await department.save();
};

/**
 * Get department hierarchy
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} Hierarchical tree
 */
const getDepartmentHierarchy = async (companyId) => {
  const departments = await Department.find({ 
    companyId, 
    isDeleted: false 
  })
    .populate('headId', 'firstName lastName empCode')
    .sort({ name: 1 })
    .lean();

  // Build hierarchy tree
  const buildTree = (parentId = null) => {
    return departments
      .filter(dept => String(dept.parentDepartmentId) === String(parentId))
      .map(dept => ({
        ...dept,
        children: buildTree(dept._id)
      }));
  };

  return buildTree(null);
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentHierarchy
};
