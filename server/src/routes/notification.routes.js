const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getNotifications, getUnreadCount, markRead, markAllRead,
  createNotification, updateNotification, deleteNotification,
} = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markRead);
router.patch('/mark-all-read', authenticate, markAllRead);
router.post('/', authenticate, authorize('coordinator'), createNotification);
router.put('/:id', authenticate, authorize('coordinator'), updateNotification);
router.delete('/:id', authenticate, authorize('coordinator'), deleteNotification);

module.exports = router;
