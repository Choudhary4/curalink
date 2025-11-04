const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All profile routes require authentication
router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);
router.post('/picture', authenticate, upload.single('profile_picture'), profileController.uploadProfilePicture);
router.delete('/picture', authenticate, profileController.deleteProfilePicture);

module.exports = router;
