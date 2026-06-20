const { query } = require('../database/db');

const notificationService = {
  // Get all notifications with pagination
  getAll: async ({ limit, offset }) => {
    const countResult = await query('SELECT COUNT(*) FROM notifications');
    const total = parseInt(countResult.rows[0].count);
    const result = await query(
      `SELECT n.*, u.name as created_by_name
       FROM notifications n
       LEFT JOIN users u ON n.created_by = u.id
       ORDER BY n.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: result.rows, total };
  },

  // Get notifications for student (with read status)
  getForStudent: async (studentId, { limit, offset }) => {
    const countResult = await query('SELECT COUNT(*) FROM notifications');
    const total = parseInt(countResult.rows[0].count);
    const result = await query(
      `SELECT n.*, 
         CASE WHEN nr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_read,
         CASE WHEN nr.id IS NOT NULL THEN TRUE ELSE FALSE END as "isRead",
         nr.read_at
        FROM notifications n
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.student_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );
    return { data: result.rows, total };
  },

  // Count unread for student
  countUnread: async (studentId) => {
    const result = await query(
      `SELECT COUNT(*) FROM notifications n
       WHERE n.id NOT IN (
         SELECT notification_id FROM notification_reads WHERE student_id = $1
       )`,
      [studentId]
    );
    return parseInt(result.rows[0].count);
  },

  // Mark as read
  markRead: async (studentId, notificationId) => {
    await query(
      `INSERT INTO notification_reads (student_id, notification_id)
       VALUES ($1, $2) ON CONFLICT (student_id, notification_id) DO NOTHING`,
      [studentId, notificationId]
    );
  },

  // Mark all as read
  markAllRead: async (studentId) => {
    await query(
      `INSERT INTO notification_reads (student_id, notification_id)
       SELECT $1, id FROM notifications
       WHERE id NOT IN (SELECT notification_id FROM notification_reads WHERE student_id = $1)`,
      [studentId]
    );
  },

  // Create notification
  create: async ({ title, message, priority, createdBy }) => {
    const result = await query(
      `INSERT INTO notifications (title, message, priority, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, message, priority, createdBy]
    );
    return result.rows[0];
  },

  // Update notification
  update: async (id, { title, message, priority }) => {
    const result = await query(
      `UPDATE notifications SET title=$1, message=$2, priority=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [title, message, priority, id]
    );
    return result.rows[0];
  },

  // Delete notification
  delete: async (id) => {
    await query('DELETE FROM notifications WHERE id = $1', [id]);
  },

  // Get recent notifications (for dashboard)
  getRecent: async (limit = 5) => {
    const result = await query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  },

  // Get recent notifications for student (with read status)
  getRecentForStudent: async (studentId, limit = 5) => {
    const result = await query(
      `SELECT n.*, 
         CASE WHEN nr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_read,
         CASE WHEN nr.id IS NOT NULL THEN TRUE ELSE FALSE END as "isRead",
         nr.read_at
        FROM notifications n
        LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.student_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2`,
      [studentId, limit]
    );
    return result.rows;
  },
};

module.exports = notificationService;
