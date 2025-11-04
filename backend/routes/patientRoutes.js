const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize('patient'));

router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);
router.get('/recommendations', patientController.getRecommendations);

module.exports = router;
