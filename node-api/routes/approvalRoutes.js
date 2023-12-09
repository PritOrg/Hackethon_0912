const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Approval = require('../schemas/approval');

// getAll for Employee Object
router.get('/', async (req, res) => {
    try {
        const approval = await Approval.find();
        res.json(approval);
        console.log(approval);
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

        const approval = await Approval.findOne({ _id: id });
        if (!approval) {
            return res.status(404).json({ message: 'approval not found' });
        }
        res.json(approval);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// adding data of Employee object
router.post('/', async (req, res) => {
    try {
        const approvaldata = req.body;

        // Generate a new ObjectId
        const objectId = new ObjectId();

        // Add the generated ObjectId to the employeeData
        approvaldata._id = objectId;

        const newapproval = new Approval(approvaldata
        );

        await newapproval.save();
        res.status(201).json(newapproval);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
        "id": req.body.id,
        "leaveRequestId": req.body.leaveRequestId,
        "approverId": req.body.approverId,
        "status": req.body.status,
        "comments": req.body.comments,
        "createdAt": req.body.createdAt,
    };
    try {
        const updateapproval = await Approval.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updateapproval) {
            return res.status(404).json({ message: 'approval not found' });
        }
        res.json(updateapproval);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deleteapproval = await Approval.findOneAndDelete({ _id: id });
        if (!deleteapproval) {
            return res.status(404).json({ message: 'approval not found' });
        }
        res.json({ message: 'approval deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
