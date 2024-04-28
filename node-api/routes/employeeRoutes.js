const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Employee = require('../schemas/employee');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

router.post('/', async (req, res) => {
  try {
    // // Check if a file was uploaded
    // if (!req.files || !req.files.profilePic) {
    //   return res.status(400).json({ message: 'No file uploaded' });
    // }

    const { username, email, password, firstName, middleName, lastName, birthdate, role, joiningDate, expertise, projects, profilePic, achievements, jobShift } = req.body;

    // // Process the uploaded file
    // const profilePic = req.files.profilePic;
    // const fileName = Date.now() + '-' + profilePic.name;
    // const filePath = path.join(__dirname, 'public', 'profilePics', fileName);

    // Save the file
    // await writeFileAsync(filePath, profilePic.data);

    // // Resize the image using sharp
    // const resizedImagePath = path.join(__dirname, 'public', 'profilePics', 'resized-' + fileName);
    // await sharp(filePath)
    //   .resize({ width: 350 })
    //   .toFile(resizedImagePath);

    // // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new employee instance
    const newEmployee = new Employee({
      // Personal Information
      username,
      email,
      password: hashedPassword,
      firstName,
      middleName,
      lastName,
      birthdate,
      profilePic, // Save path to the resized image
      // Organizational Information
      role,
      joiningDate,
      expertise,
      projects,
      achievements,
      jobShift,
      // Leave Requests and Balance
      leaveRequests: [],
      leaveBalance: {
        annualLeave: 0,
        maternityLeave: 0,
        privilegeLeave: 0,
        halfDayLeave: 0,
        casualLeave: 0,
        sickLeave: 0
      },
      specialRemarks: ''
    });

    // Save the new employee to the database
    await newEmployee.save();

    // Return the newly created employee object
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




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
    const isPasswordValid = bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Successful authentication
    res.status(200).json({ message: 'Login successful', employeeId: employee._id, employee: employee });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  console.log('PATCH Request Body:', updatedData);

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updatedUser = await Employee.findOneAndUpdate({ _id: id }, updatedData, {
      new: true,
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
