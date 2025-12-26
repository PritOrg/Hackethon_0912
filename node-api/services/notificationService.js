/**
 * Notification Service
 * Business logic for notification management
 * Handles creating, reading, and managing user notifications
 * 
 * @module services/notificationService
 */

const Notification = require('../schemas/notification');
const Employee = require('../schemas/employee');

/**
 * Create a new notification
 * @param {Object} notificationData - Notification information
 * @param {String} notificationData.userId - User/Employee ID
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.type - Notification type (info, success, warning, error)
 * @param {Object} notificationData.metadata - Additional metadata
 * @returns {Promise<Object>} Created notification
 * @throws {Error} If user not found
 */
const createNotification = async (notificationData) => {
  const { userId, message, type = 'info', metadata } = notificationData;

  // Verify user exists
  const user = await Employee.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Create notification
  const notification = new Notification({
    userId,
    message,
    type,
    metadata,
    isRead: false,
    createdAt: new Date()
  });

  await notification.save();

  return notification;
};

/**
 * Bulk create notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Created notifications
 */
const bulkCreateNotifications = async (userIds, message, type = 'info', metadata = {}) => {
  // Verify all users exist
  const users = await Employee.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    throw new Error('One or more users not found');
  }

  // Create notifications
  const notifications = userIds.map(userId => ({
    userId,
    message,
    type,
    metadata,
    isRead: false,
    createdAt: new Date()
  }));

  const createdNotifications = await Notification.insertMany(notifications);

  return {
    message: `${createdNotifications.length} notifications created successfully`,
    notifications: createdNotifications
  };
};

/**
 * Get notifications for a user with filtering
 * @param {Object} filters - Filter criteria
 * @param {String} filters.userId - User ID
 * @param {Boolean} filters.isRead - Filter by read status
 * @param {String} filters.type - Filter by type
 * @param {Number} filters.page - Page number
 * @param {Number} filters.limit - Items per page
 * @returns {Promise<Object>} Notifications with pagination
 */
const getNotifications = async (filters) => {
  const { userId, isRead, type, page = 1, limit = 20 } = filters;

  // Build query
  const query = { userId };

  if (typeof isRead !== 'undefined') {
    query.isRead = isRead;
  }

  if (type) {
    query.type = type;
  }

  // Count total documents
  const total = await Notification.countDocuments(query);

  // Fetch notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Count unread
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false
  });

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get notification by ID
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Notification details
 * @throws {Error} If notification not found or unauthorized
 */
const getNotificationById = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId).lean();

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify ownership
  if (notification.userId.toString() !== userId) {
    throw new Error('Unauthorized access to notification');
  }

  return notification;
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 * @throws {Error} If notification not found or unauthorized
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify ownership
  if (notification.userId.toString() !== userId) {
    throw new Error('Unauthorized access to notification');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );

  return {
    message: `${result.modifiedCount} notifications marked as read`,
    count: result.modifiedCount
  };
};

/**
 * Delete notification
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If notification not found or unauthorized
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify ownership
  if (notification.userId.toString() !== userId) {
    throw new Error('Unauthorized access to notification');
  }

  await Notification.findByIdAndDelete(notificationId);

  return { message: 'Notification deleted successfully' };
};

/**
 * Delete all read notifications for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteAllRead = async (userId) => {
  const result = await Notification.deleteMany({
    userId,
    isRead: true
  });

  return {
    message: `${result.deletedCount} read notifications deleted`,
    count: result.deletedCount
  };
};

/**
 * Get notification statistics for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Notification statistics
 */
const getNotificationStats = async (userId) => {
  const total = await Notification.countDocuments({ userId });
  const unread = await Notification.countDocuments({ userId, isRead: false });
  const read = total - unread;

  // Count by type
  const typeStats = await Notification.aggregate([
    { $match: { userId: userId } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const byType = {};
  typeStats.forEach(stat => {
    byType[stat._id] = stat.count;
  });

  return {
    total,
    read,
    unread,
    byType
  };
};

module.exports = {
  createNotification,
  bulkCreateNotifications,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationStats
};
