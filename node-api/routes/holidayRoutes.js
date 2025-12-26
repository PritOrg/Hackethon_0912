/**
 * Holiday Routes
 * Defines all holiday-related endpoints with proper MVC structure
 * 
 * @module routes/holidayRoutes
 */

const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/holidays
 * @desc    Create a new holiday
 * @access  Admin, HR
 */
router.post('/', authMiddleware, holidayController.createHoliday);

/**
 * @route   POST /api/holidays/bulk
 * @desc    Bulk create holidays for a year
 * @access  Admin, HR
 */
router.post('/bulk', authMiddleware, holidayController.bulkCreateHolidays);

/**
 * @route   GET /api/holidays
 * @desc    Get all holidays with filtering
 * @access  All authenticated users
 */
router.get('/', authMiddleware, holidayController.getHolidays);

/**
 * @route   GET /api/holidays/calendar/:companyId/:year
 * @desc    Get holiday calendar for a year
 * @access  All authenticated users
 */
router.get('/calendar/:companyId/:year', authMiddleware, holidayController.getHolidayCalendar);

/**
 * @route   GET /api/holidays/upcoming/:companyId
 * @desc    Get upcoming holidays
 * @access  All authenticated users
 */
router.get('/upcoming/:companyId', authMiddleware, holidayController.getUpcomingHolidays);

/**
 * @route   GET /api/holidays/:id
 * @desc    Get holiday by ID
 * @access  All authenticated users
 */
router.get('/:id', authMiddleware, holidayController.getHolidayById);

/**
 * @route   PUT /api/holidays/:id
 * @desc    Update holiday
 * @access  Admin, HR
 */
router.put('/:id', authMiddleware, holidayController.updateHoliday);

/**
 * @route   DELETE /api/holidays/:id
 * @desc    Delete holiday
 * @access  Admin, HR
 */
router.delete('/:id', authMiddleware, holidayController.deleteHoliday);

module.exports = router;

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedHoliday = await Holiday.findOneAndDelete({ _id: id });
        if (!deletedHoliday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
