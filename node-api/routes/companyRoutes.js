const router = require('express').Router();

const Attendance = require('../schemas/attendance_v2');
const Employee = require('../schemas/employee_v2');
const Company = require('../schemas/company_v2');
const Department = require('../schemas/department');

// POST: Register a new company
router.post('/', async (req, res) => {
try {
  const {
    basicInfo: { name, type, industry, registrationNumber, establishedDate },
    contactInfo: { phone, email, website },
    addressInfo: { street, city, state, zipCode, country },
  } = req.body;

  const newCompany = new Company({
    name,
    type,
    industry,
    registrationNumber,
    establishedDate,
    contact: { phone, email, website },
    address: { street, city, state, zipCode, country },
    holidays: [],
    shifts: [],
    departments: [],
    admins: [], 
  });

  const savedCompany = await newCompany.save();
  res.status(201).json(savedCompany);
} catch (error) {
  res.status(400).json({ message: error.message });
}
});

router.get('/:companyId/attendance', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { date } = req.query;
  
      // Validate date
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }
  
      // Find all attendance records for the company on the specified date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
  
      const attendanceRecords = await Attendance.find({
        companyId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
  
      res.json(attendanceRecords);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//Get all Empoyee by companyId
router.get('/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;
  
      if (!ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid company ID format' });
      }
  
      const employees = await Employee.find({ companyId });
  
      res.json(employees);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// DELETE: Delete a company by ID
router.delete('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Update a company by ID (partial update)
router.patch('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date();

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
      new: true, 
      runValidators: true,
    });

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;