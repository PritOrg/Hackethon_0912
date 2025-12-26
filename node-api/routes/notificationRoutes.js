/**
 * Notification Routes
 * Defines all notification-related endpoints with proper MVC structure
 * 
 * @module routes/notificationRoutes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('./auth.middleware');

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Admin, HR, Manager
 */
router.post('/', authMiddleware, notificationController.createNotification);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Bulk create notifications for multiple users
 * @access  Admin, HR, Manager
 */
router.post('/bulk', authMiddleware, notificationController.bulkCreateNotifications);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  All authenticated users
 */
router.get('/stats', authMiddleware, notificationController.getNotificationStats);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  All authenticated users
 */
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  All authenticated users
 */
router.delete('/read', authMiddleware, notificationController.deleteAllRead);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  All authenticated users
 */
router.get('/', authMiddleware, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  All authenticated users (own notifications only)
 */
router.get('/:id', authMiddleware, notificationController.getNotificationById);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  All authenticated users (own notifications only)
 */
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  All authenticated users (own notifications only)
 */
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;

// getAll for Notification Object
router.get('/', async (req, res) => {
  try {
    const notification = await Notification.find();
    res.json(notification);
    console.log(notification);
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

      const notificationRequest = await Notification.findOne({ _id: id });
      if (!notificationRequest) {
          return res.status(404).json({ message: 'notification not found' });
      }
      res.json(notificationRequest);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// adding data of Notification object
router.post('/', async (req, res) => {
  try {
    const notificationData = req.body;
  
    // Generate a new ObjectId
    const objectId = new ObjectId();
  
    // Add the generated ObjectId to the notificationData
    notificationData._id = objectId;
  
    const newNotification = new Notification(notificationData);
  
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = {
    "id" : String,
    "userId" : String,
    "message" : String,
    "isRead" : Boolean,
    "createdAt" : Date,
    };
    try {
        const updatedNotification = await Notification.findOneAndUpdate({ _id: id }, updatedData, {
            new: false,
        });
        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(updatedNotification);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete 
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedNotification = await Notification.findOneAndDelete({ _id: id });
        if (!deletedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
