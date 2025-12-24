const router = require('express').Router();
const Attendance = require('../schemas/attendance_v2');
const Employee = require('../schemas/employee_v2');

router.post('/clock-in', async (req, res) => {
    try {
      const { employeeId, companyId } = req.body;
  
      // Validate required fields
      if (!employeeId || !companyId) {
        return res.status(400).json({ message: 'Employee ID and Company ID are required' });
      }
  
      // Check if the employee has already clocked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to the start of the day
  
      const existingAttendance = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
      });
  
      if (existingAttendance) {
        return res.status(400).json({ message: 'You have already clocked in today' });
      }
  
      // Create a new attendance record
      const newAttendance = new Attendance({
        employeeId,
        companyId,
        clockIn: new Date(),
        status: 'Present',
      });
  
      await newAttendance.save();
  
      res.status(201).json(newAttendance);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.post('/clock-out', async (req, res) => {
    try {
      const { employeeId } = req.body;
  
      // Validate required fields
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
  
      // Find today's attendance record
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to the start of the day
  
      const attendance = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
      });
  
      if (!attendance) {
        return res.status(404).json({ message: 'You have not clocked in today' });
      }
  
      if (attendance.clockOut) {
        return res.status(400).json({ message: 'You have already clocked out today' });
      }
  
      // Set clock-out time
      attendance.clockOut = new Date();
  
      // Calculate total hours worked
      const clockInTime = attendance.clockIn.getTime();
      const clockOutTime = attendance.clockOut.getTime();
      const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert milliseconds to hours
  
      attendance.totalHours = totalHours;
  
      // Calculate overtime (assuming standard work hours are 8 hours)
      const standardWorkHours = 8;
      if (totalHours > standardWorkHours) {
        attendance.overtime = totalHours - standardWorkHours;
      }
  
      await attendance.save();
  
      res.json(attendance);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;