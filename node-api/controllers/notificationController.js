/**
 * Notification Controller
 * HTTP handlers for notification-related endpoints
 * 
 * @module controllers/notificationController
 */

const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, createdResponse, badRequestResponse, paginatedResponse } = require('../utils/responseHandler');

/**
 * Create a new notification
 * @route   POST /api/notifications
 * @access  Admin, HR, Manager
 */
const createNotification = asyncHandler(async (req, res) => {
  const { userId, message, type, metadata } = req.body;

  if (!userId || !message) {
    return badRequestResponse(res, 'User ID and message are required');
  }

  const notification = await notificationService.createNotification({
    userId,
    message,
    type,
    metadata
  });

  createdResponse(res, 'Notification created successfully', notification);
});

/**
 * Bulk create notifications
 * @route   POST /api/notifications/bulk
 * @access  Admin, HR, Manager
 */
const bulkCreateNotifications = asyncHandler(async (req, res) => {
  const { userIds, message, type, metadata } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message) {
    return badRequestResponse(res, 'User IDs array and message are required');
  }

  const result = await notificationService.bulkCreateNotifications(
    userIds,
    message,
    type,
    metadata
  );

  createdResponse(res, result.message, result.notifications);
});

/**
 * Get all notifications for current user
 * @route   GET /api/notifications
 * @access  All authenticated users
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id; // From auth middleware
  const { isRead, type, page, limit } = req.query;

  const result = await notificationService.getNotifications({
    userId,
    isRead: isRead ? isRead === 'true' : undefined,
    type,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20
  });

  res.json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: result.notifications,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  All authenticated users (own notifications only)
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.getNotificationById(id, userId);

  successResponse(res, 'Notification retrieved successfully', notification);
});

/**
 * Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  All authenticated users (own notifications only)
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsRead(id, userId);

  successResponse(res, 'Notification marked as read', notification);
});

/**
 * Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  All authenticated users
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.markAllAsRead(userId);

  successResponse(res, result.message, { count: result.count });
});

/**
 * Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  All authenticated users (own notifications only)
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await notificationService.deleteNotification(id, userId);

  successResponse(res, result.message);
});

/**
 * Delete all read notifications
 * @route   DELETE /api/notifications/read
 * @access  All authenticated users
 */
const deleteAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await notificationService.deleteAllRead(userId);

  successResponse(res, result.message, { count: result.count });
});

/**
 * Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  All authenticated users
 */
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await notificationService.getNotificationStats(userId);

  successResponse(res, 'Notification statistics retrieved successfully', stats);
});

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
