const express = require('express');
const router = express.Router();
const researcherController = require('../controllers/researcherController');
const { authenticate, authorize } = require('../middleware/auth');

// Profile routes - require researcher or health_expert role
router.get('/profile', authenticate, authorize('researcher', 'health_expert'), researcherController.getProfile);
router.put('/profile', authenticate, authorize('researcher', 'health_expert'), researcherController.updateProfile);

// Expert routes - public for browsing
router.get('/experts', researcherController.getExperts);

// Collaborator routes - requires authentication to exclude current user
router.get('/collaborators', authenticate, researcherController.getCollaborators);

module.exports = router;
