const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const LeaveBalance = require('../schemas/LeaveBalance');

// getAll for Employee Object
router.get('/', async (req, res) => {
  try {
    const leavebalance = await LeaveBalance.find();
    res.json(leavebalance);
    console.log(leavebalance);
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

        const leavebalance = await LeaveBalance.findOne({ _id: id });
        if (!leavebalance) {
            return res.status(404).json({ message: 'leavebalance not found' });
        }
        res.json(leavebalance);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// adding data of Employee object
router.post('/', async (req, res) => {
  try {
    const balancedata = req.body;
  
    // Generate a new ObjectId
    const objectId = new ObjectId();
  
    // Add the generated ObjectId to the employeeData
    balancedata._id = objectId;
  
    const newleavebalance = new LeaveBalance(balancedata);
  
    await newleavebalance.save();
    res.status(201).json(newleavebalance);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
        "id": req.body.id,
        "userId": req.body.userId,
        "annualLeave": req.body.annualLeave,
        "meternityLeave": req.body.meternityLeave,
        "privilegeLeave": req.body.privilegeLeave,
        "createdAt": req.body.createdAt,
    };
    try {
        const updateleavebalance = await LeaveBalance.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updateleavebalance) {
            return res.status(404).json({ message: 'leavebalance not found' });
        }
        res.json(updateleavebalance);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deleteleavebalance = await LeaveBalance.findOneAndDelete({ _id: id });
        if (!deleteleavebalance) {
            return res.status(404).json({ message: 'leavebalance not found' });
        }
        res.json({ message: 'leavebalance deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
