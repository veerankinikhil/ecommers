import { Notification } from '../models/Notification.js';
import { emitToUser } from '../services/socketService.js';

// Helper: Create a notification and emit it in real-time
export const createNotification = async ({ recipientId, role, title, message, type, link, orderId }) => {
  try {
    const notif = await Notification.create({ recipientId, role, title, message, type: type || 'ORDER_STATUS', link: link || '', orderId: orderId || null });
    // Push to user's browser in real-time
    emitToUser(recipientId, 'new_notification', {
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      isRead: false,
      createdAt: notif.createdAt,
    });
    return notif;
  } catch (err) {
    console.error('[Notification] Failed to create:', err.message);
  }
};

// @desc  Get notifications for the logged-in user
// @route GET /api/notifications
// @access Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark a single notification as read
// @route PUT /api/notifications/:id/read
// @access Private
export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
// @access Private
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a notification
// @route DELETE /api/notifications/:id
// @access Private
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipientId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
