const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Employee = require('../schemas/employee');

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

// adding data of Employee object
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
  
    // Generate a new ObjectId
    const objectId = new ObjectId();
  
    // Add the generated ObjectId to the employeeData
    employeeData._id = objectId;
  
    const newEmployee = new Employee(employeeData);
  
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
        "userId": req.body.userId,
        "startDate": req.body.startDate,
        "endDate": req.body.endDate,
        "status": req.body.status,
        "reason": req.body.reason,
        "createdAt": req.body.createdAt,
    };
    try {
        const updatedEmployee = await Employee.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
app.delete('/:id', async (req, res) => {
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
