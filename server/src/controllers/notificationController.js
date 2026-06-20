const notificationService = require('../services/notificationService');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { AppError } = require('../utils/appError');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req);
    let result;
    if (req.user.role === 'student') {
      result = await notificationService.getForStudent(req.user.id, { limit, offset });
    } else {
      result = await notificationService.getAll({ limit, offset });
    }
    res.json(paginatedResponse(result.data, result.total, page, limit));
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.countUnread(req.user.id);
    res.json({ unreadCount: count });
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.user.id, req.params.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, message, priority } = req.body;
    const notification = await notificationService.create({ title, message, priority: priority || 'medium', createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Notification created', data: notification });
  } catch (err) { next(err); }
};

const updateNotification = async (req, res, next) => {
  try {
    const { title, message, priority } = req.body;
    const notification = await notificationService.update(req.params.id, { title, message, priority });
    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true, message: 'Notification updated', data: notification });
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.delete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, createNotification, updateNotification, deleteNotification };
