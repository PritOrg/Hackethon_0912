const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const { ObjectId } = Types;
const Employee = require('../schemas/employee_v2');
const LeaveRequest = require('../schemas/leaveRequest_v2');
//get all requessts from the specific date
router.get('/company/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { date } = req.query;
  
      // Validate date
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }
  
      // Find all employees in the company
      const employees = await Employee.find({ companyId });
  
      // Extract employee IDs
      const employeeIds = employees.map((employee) => employee._id);
  
      // Find all leave requests for these employees on the specified date
      const leaveRequests = await LeaveRequest.find({
        employeeId: { $in: employeeIds },
        createdAt: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
      });
  
      res.json(leaveRequests);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//get specific request
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the leave request
      const leaveRequest = await LeaveRequest.findById(id);
  
      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      res.json(leaveRequest);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
//Raise a Request
router.post('/', async (req, res) => {
    try {
      const { employeeId, startDate, endDate, reason, leaveType } = req.body;
  
      // Validate required fields
      if (!employeeId || !startDate || !endDate || !reason || !leaveType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Create a new leave request
      const newLeaveRequest = new LeaveRequest({
        employeeId,
        startDate,
        endDate,
        reason,
        leaveType,
        status: 'Pending', // Default status
        createdAt: new Date(),
      });
  
      // Save the leave request
      await newLeaveRequest.save();
  
      // Add the leave request ID to the employee's leaveRequests array
      await Employee.findByIdAndUpdate(employeeId, {
        $push: { leaveRequests: newLeaveRequest._id },
      });
  
      res.status(201).json(newLeaveRequest);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//Edit Request
router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, reason, leaveType } = req.body;
  
      // Validate required fields
      if (!startDate && !endDate && !reason && !leaveType) {
        return res.status(400).json({ message: 'No fields to update' });
      }
  
      // Find and update the leave request
      const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(
        id,
        { startDate, endDate, reason, leaveType },
        { new: true }
      );
  
      if (!updatedLeaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      res.json(updatedLeaveRequest);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//Delete Request
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the leave request
      const deletedLeaveRequest = await LeaveRequest.findByIdAndDelete(id);
  
      if (!deletedLeaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      // Remove the leave request ID from the employee's leaveRequests array
      await Employee.findByIdAndUpdate(deletedLeaveRequest.employeeId, {
        $pull: { leaveRequests: id },
      });
  
      res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//Approve/Reject Request
router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, approverId, approverComment } = req.body;
  
      // Validate required fields
      if (!status || !approverId || !approverComment) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Find the leave request
      const leaveRequest = await LeaveRequest.findById(id);
      if (!leaveRequest) {
        return res.status(404).json({ message: 'Leave request not found' });
      }
  
      // Update the leave request status
      leaveRequest.status = status;
      leaveRequest.approverId = approverId;
      leaveRequest.approverComment = approverComment;
      leaveRequest.acceptedDate = new Date();
  
      // If approved, deduct from the employee's leave balance
      if (status === 'Approved') {
        const employee = await Employee.findById(leaveRequest.employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
  
        // Deduct leave balance based on leave type
        const leaveType = leaveRequest.leaveType.toLowerCase() + 'Leave';
        if (employee.leaveBalance[leaveType] > 0) {
          employee.leaveBalance[leaveType] -= 1;
          await employee.save();
        } else {
          return res.status(400).json({ message: 'Insufficient leave balance' });
        }
      }
  
      // Save the updated leave request
      await leaveRequest.save();
  
      // Generate a notification for the employee
      const notification = new Notification({
        userId: leaveRequest.employeeId,
        message: `Your leave request has been ${status}.`,
        isRead: false,
        createdAt: new Date(),
      });
      await notification.save();
  
      res.json(leaveRequest);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
module.exports = router;
