const { promisePool } = require('../config/database');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, subject, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'receiver_id and content are required' });
    }

    // Verify receiver exists
    const [receivers] = await promisePool.query(
      'SELECT id FROM Users WHERE id = ?',
      [receiver_id]
    );

    if (receivers.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO Messages (sender_id, receiver_id, subject, content)
       VALUES (?, ?, ?, ?)`,
      [senderId, receiver_id, subject || '', content]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all messages for current user (inbox)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.query.type || 'received'; // 'received' or 'sent'

    let query;
    if (type === 'sent') {
      query = `
        SELECT m.*,
               u.name as receiver_name,
               u.email as receiver_email
        FROM Messages m
        JOIN Users u ON m.receiver_id = u.id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC
      `;
    } else {
      query = `
        SELECT m.*,
               u.name as sender_name,
               u.email as sender_email
        FROM Messages m
        JOIN Users u ON m.sender_id = u.id
        WHERE m.receiver_id = ?
        ORDER BY m.created_at DESC
      `;
    }

    const [messages] = await promisePool.query(query, [userId]);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await promisePool.query(
      `SELECT COUNT(*) as count
       FROM Messages
       WHERE receiver_id = ? AND is_read = FALSE`,
      [userId]
    );

    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify the message belongs to the user
    const [messages] = await promisePool.query(
      'SELECT id FROM Messages WHERE id = ? AND receiver_id = ?',
      [id, userId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await promisePool.query(
      'UPDATE Messages SET is_read = TRUE WHERE id = ?',
      [id]
    );

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify the message belongs to the user (either as sender or receiver)
    const [messages] = await promisePool.query(
      'SELECT id FROM Messages WHERE id = ? AND (sender_id = ? OR receiver_id = ?)',
      [id, userId, userId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await promisePool.query('DELETE FROM Messages WHERE id = ?', [id]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
