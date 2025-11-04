const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All message routes require authentication
router.post('/', authenticate, messageController.sendMessage);
router.get('/', authenticate, messageController.getMessages);
router.get('/unread-count', authenticate, messageController.getUnreadCount);
router.put('/:id/read', authenticate, messageController.markAsRead);
router.delete('/:id', authenticate, messageController.deleteMessage);

module.exports = router;
