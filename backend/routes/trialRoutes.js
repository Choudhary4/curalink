const express = require('express');
const router = express.Router();
const trialController = require('../controllers/trialController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (read-only) - No authentication required for demo
router.get('/', trialController.getTrials);
router.get('/search-gov', trialController.searchClinicalTrialsGov);
router.get('/:id', trialController.getTrial);

// Protected routes (write)
router.post('/', authenticate, authorize('researcher', 'health_expert'), trialController.createTrial);
router.put('/:id', authenticate, authorize('researcher', 'health_expert'), trialController.updateTrial);

module.exports = router;
