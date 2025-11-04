const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authenticate } = require('../middleware/auth');

// Public routes (read-only)
router.get('/', forumController.getForums);
router.get('/:forumId/posts', forumController.getForumPosts);
router.get('/posts/:postId', forumController.getPost);

// Protected routes (write)
router.post('/', authenticate, forumController.createForum);
router.post('/:forumId/posts', authenticate, forumController.createPost);
router.post('/posts/:postId/replies', authenticate, forumController.createReply);

module.exports = router;
