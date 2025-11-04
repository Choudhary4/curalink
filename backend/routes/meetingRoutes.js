const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Meeting routes
router.get('/', meetingController.getMeetings);
router.post('/request', meetingController.requestMeeting);
router.put('/:id/status', meetingController.updateMeetingStatus);

// Collaboration routes
router.get('/collaborations', authorize('researcher'), meetingController.getCollaborations);
router.post('/collaborations/request', authorize('researcher'), meetingController.requestCollaboration);
router.put('/collaborations/:id/status', authorize('researcher'), meetingController.updateCollaborationStatus);

module.exports = router;
