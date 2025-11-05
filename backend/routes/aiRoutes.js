const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// AI services status
router.get('/status', aiController.checkStatus);

// Text summarization
router.post('/summarize', aiController.summarize);

// Publication abstract simplification
router.post('/simplify/abstract', aiController.simplifyAbstract);

// Clinical trial simplification
router.post('/simplify/trial', aiController.simplifyTrial);

// Extract medical keywords from text
router.post('/extract-keywords', aiController.extractKeywords);

// Generate search query from natural language
router.post('/generate-query', aiController.generateSearchQuery);

// Answer patient questions
router.post('/answer-question', aiController.answerQuestion);

// Generate forum response draft for researchers
router.post('/generate-forum-response', aiController.generateForumResponse);

// Chat with AI assistant
router.post('/chat', aiController.chat);

module.exports = router;
