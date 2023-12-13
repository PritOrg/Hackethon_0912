const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Employee = require('../schemas/employee');
const bcrypt = require('bcrypt');
const authMiddleware = require('./auth.middleware');


// router.use('/:id', authMiddleware);

router.post('/login', async (req, res) => {
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

    // Successful authentication
    res.status(200).json({ message: 'Login successful', employeeId: employee._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// getAll for Employee Object
router.get('/', async (req, res) => {
  try {
    const employee = await Employee.find();
    res.json(employee);
    console.log(employee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get By id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const employeeRequest = await Employee.findOne({ _id: id });
    if (!employeeRequest) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.json(employeeRequest);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// adding data of Employee object
// Registration route
router.post('/', async (req, res) => {
  try {
    const { username, email, password, createdAt } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newEmployee = new Employee({
      username,
      email,
      password: hashedPassword,
      role: 'employee',
      createdAt,
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  console.log('PATCH Request Body:', updatedData);

  // Ensure that the ID is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updatedUser = await Employee.findOneAndUpdate({ _id: id }, updatedData, {
      new: true, // Return the updated document
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedEmployee = await Employee.findOneAndDelete({ _id: id });
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
