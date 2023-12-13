const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const LeaveRequest = require('../schemas/leave-request');
const { route } = require('./employeeRoutes');
const Employee = require('../schemas/employee');
// getAll for LeaveRequest Object
router.get('/', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.find();
    res.json(leaveRequest);
    console.log(leaveRequest);
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

        const leaveRequest = await LeaveRequest.findOne({ _id: id });
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.json(leaveRequest);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// adding data of LeaveRequest object
router.post('/:id/apply-leave', async (req, res) => {
    try {
      const leaveRequest = req.body;
  
      // Generate a new ObjectId
      const objectId = new ObjectId();
  
      // Add the generated ObjectId to the employeeData
      leaveRequest._id = objectId;
  
      // Use findByIdAndUpdate to update the leaveRequests array
      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.id,
        { $push: { leaveRequests: leaveRequest } },
        { new: true }
      );
  
      res.status(201).json(updatedEmployee);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.patch('/:id', async (req, res) => {
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
        const updatedLeaveRequest = await LeaveRequest.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updatedLeaveRequest) {
            return res.status(404).json({ message: 'LeaveRequest not found' });
        }
        res.json(updatedLeaveRequest);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedLeaveRequest = await LeaveRequest.findOneAndDelete({ _id: id });
        if (!deletedLeaveRequest) {
            return res.status(404).json({ message: 'LeaveRequest not found' });
        }
        res.json({ message: 'LeaveRequest deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
