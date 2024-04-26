const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Employee = require('../schemas/employee');

async function updateLeaveBalanceForAllEmployees(leaveType, newLeaveBalance) {
    try {
        // Retrieve all employees from the database
        const employees = await Employee.find();

        // Iterate through each employee
        for (const employee of employees) {
            // Get the old leave balance for the specified leave type
            const oldLeaveBalance = employee.leaveBalance[leaveType];

            // Calculate the difference between the old and new leave balance
            const leaveBalanceDifference = newLeaveBalance - oldLeaveBalance;

            // Update the leave balance for the specified leave type
            employee.leaveBalance[leaveType] = newLeaveBalance;

            // Adjust the remaining leave balance based on the difference
            // Only if the leave balance is being increased
            if (leaveBalanceDifference > 0) {
                // Add the difference to the remaining leave balance
                employee.leaveBalance[leaveType] += leaveBalanceDifference;
            }

            // Save the updated employee back to the database
            await employee.save();
        }

        console.log(`Leave balance updated for ${employees.length} employees.`);
    } catch (error) {
        console.error('Error updating leave balance:', error);
    }
}
// Get all leave requests for all employees
router.get('/all-leave-requests', async (req, res) => {
    try {
        const allEmployees = await Employee.find({}, 'leaveRequests');
        const allLeaveRequests = allEmployees.flatMap(employee => employee.leaveRequests);
        res.json(allLeaveRequests);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Get leave request by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const allEmployees = await Employee.find({}, 'leaveRequests');
        const allLeaveRequests = allEmployees.flatMap(employee => employee.leaveRequests);
        const leaveRequest = allLeaveRequests.find(request => request._id.toString() === id);

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        res.json(leaveRequest);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Apply for leave
router.post('/:id/apply-leave', async (req, res) => {
    try {
        const employeeId = req.params.id;
        const leaveRequestData = req.body;

        const objectId = new ObjectId();
        leaveRequestData._id = objectId;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $push: { leaveRequests: leaveRequestData } },
            { new: true }
        );

        res.status(201).json(updatedEmployee);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update leave request
router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    try {
        const allEmployees = await Employee.find({}, 'leaveRequests');
        const allLeaveRequests = allEmployees.flatMap(employee => employee.leaveRequests);
        const leaveRequestIndex = allLeaveRequests.findIndex(request => request._id.toString() === id);

        if (leaveRequestIndex === -1) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const updatedLeaveRequest = { ...allLeaveRequests[leaveRequestIndex], ...updatedData };
        allLeaveRequests[leaveRequestIndex] = updatedLeaveRequest;

        // Update the leave requests in the employee document
        await Employee.updateOne({}, { $set: { leaveRequests: allLeaveRequests } });

        res.json(updatedLeaveRequest);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete leave request
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const allEmployees = await Employee.find({}, 'leaveRequests');
        const allLeaveRequests = allEmployees.flatMap(employee => employee.leaveRequests);
        const leaveRequestIndex = allLeaveRequests.findIndex(request => request._id.toString() === id);

        if (leaveRequestIndex === -1) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        allLeaveRequests.splice(leaveRequestIndex, 1);

        // Update the leave requests in the employee document
        await Employee.updateOne({}, { $set: { leaveRequests: allLeaveRequests } });

        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
