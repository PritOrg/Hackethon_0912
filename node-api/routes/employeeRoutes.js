/**
 * Employee Routes
 * Defines all employee-related endpoints
 * 
 * @module routes/employeeRoutes
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { validate, schemas } = require('../middleware/validation');
const { authLimiter, createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('./auth.middleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   POST /api/employees/login
 * @desc    Employee login
 * @access  Public
 */
router.post('/login', authLimiter, employeeController.login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   GET /api/employees/me
 * @desc    Get current employee profile
 * @access  All authenticated users
 */
router.get('/me', authMiddleware, employeeController.getMyProfile);

/**
 * @route   GET /api/employees/:id/hierarchy
 * @desc    Get employee hierarchy (manager and subordinates)
 * @access  All authenticated users
 */
router.get('/:id/hierarchy', authMiddleware, employeeController.getHierarchy);

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Admin, HR
 */
router.post('/', createLimiter, validate(schemas.createEmployee), employeeController.createEmployee);

/**
 * @route   GET /api/employees
 * @desc    Get all employees with filtering and pagination
 * @access  Admin, HR, Manager
 */
router.get('/', authMiddleware, employeeController.getEmployees);

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Admin, HR, Manager
 */
router.get('/:id', authMiddleware, employeeController.getEmployeeById);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Admin, HR
 */
router.put('/:id', authMiddleware, validate(schemas.updateEmployee), employeeController.updateEmployee);

/**
 * @route   PUT /api/employees/:id/salary
 * @desc    Update employee salary
 * @access  Admin, HR
 */
router.put('/:id/salary', authMiddleware, employeeController.updateSalary);

/**
 * @route   PUT /api/employees/:id/status
 * @desc    Change employee status
 * @access  Admin, HR
 */
router.put('/:id/status', authMiddleware, employeeController.changeStatus);

/**
 * @route   POST /api/employees/:id/documents
 * @desc    Upload employee document
 * @access  Admin, HR
 */
router.post('/:id/documents', authMiddleware, employeeController.uploadDocument);

/**
 * @route   GET /api/employees/:id/documents
 * @desc    Get employee documents
 * @access  Admin, HR, Self
 */
router.get('/:id/documents', authMiddleware, employeeController.getDocuments);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee (soft delete)
 * @access  Admin
 */
router.delete('/:id', authMiddleware, employeeController.deleteEmployee);

module.exports = router;

// OLD CODE BELOW - TO BE REMOVED
// ================================
/*
// new Employee
router.post('/', createLimiter, validate(schemas.createEmployee), async (req, res, next) => {
  try {
    const {
      companyId,
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      birthdate,
      role,
      joiningDate,
      expertise,
      projects,
      profilePic,
      achievements,
      jobShift,
      phoneNumber,
      address,
      emergencyContact,
      department,
      position,
      salary,
    } = req.body;

    // Validate required fields
    if (!companyId || !username || !email || !password || !firstName || !lastName || !birthdate || !role || !joiningDate || !jobShift || !phoneNumber || !department || !position || !salary) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    // Create a new employee instance
    const newEmployee = new Employee({
      companyId,
      username,
      email,
      password: hashedPassword,
      firstName,
      middleName,
      lastName,
      birthdate,
      profilePic,
      phoneNumber,
      address,
      emergencyContact,
      role,
      joiningDate,
      expertise,
      projects,
      achievements,
      jobShift,
      department,
      position,
      salary,
      leaveRequests: [],
      leaveBalance: {
        annualLeave: 0,
        maternityLeave: 0,
        privilegeLeave: 0,
        halfDayLeave: 0,
        casualLeave: 0,
        sickLeave: 0,
      },
      specialRemarks: '',
      createdAt: new Date(),
    });

    // Save the new employee to the database
    await newEmployee.save();

    // Return the newly created employee object (without password)
    const employeeResponse = newEmployee.toObject();
    delete employeeResponse.password;
    
    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: employeeResponse,
    });
  } catch (error) {
    next(error);
  }
});

//Employee Login
router.post('/login', authLimiter, validate(schemas.login), async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check if the employee exists
    const employee = await Employee.findOne({ email: email });
    console.log(employee);
    if (!employee) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: employee._id, email: employee.email, role: employee.role },
      config.security.jwtSecret,
      { expiresIn: config.security.jwtExpiry }
    );

    // Successful authentication
    res.status(200).json({ 
      status: 'success',
      message: 'Login successful', 
      token,
      data: {
        id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        department: employee.department
      }
    });

  } catch (error) {
    next(error);
  }
});

//Get All Employee
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { companyId, page = 1, limit = 10, search } = req.query;

    // Build filter
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const employees = await Employee.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    res.json({
      status: 'success',
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});


router.get('/:employeeId/attendance', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all attendance records for the employee
    const attendanceRecords = await Attendance.find({ employeeId });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Get Employee by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid ID format' 
      });
    }

    const employee = await Employee.findById(id).select('-password');

    if (!employee) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Employee not found' 
      });
    }

    res.json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

//Update Employee
router.patch('/:id', authMiddleware, validate(schemas.updateEmployee), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid ID format' 
      });
    }

    // Don't allow password update through this endpoint
    if (updatedData.password) {
      delete updatedData.password;
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Employee not found' 
      });
    }

    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
});

//Delete Employee
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid ID format' 
      });
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Employee not found' 
      });
    }

    res.json({ 
      status: 'success',
      message: 'Employee deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

//get leave requests for an employee
router.get('/:employeeId/leave-requests', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all leave requests for the employee
    const leaveRequests = await LeaveRequest.find({ employeeId });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
*/