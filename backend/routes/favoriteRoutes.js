const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.get('/check', favoriteController.checkFavorite);
router.post('/', favoriteController.addFavorite);
router.delete('/', favoriteController.removeFavorite);

module.exports = router;
