const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publicationController');
const { authenticate } = require('../middleware/auth');

// Public routes (read-only)
router.get('/', publicationController.getPublications);
router.get('/search-pubmed', publicationController.searchPubMed);
router.get('/search-orcid', publicationController.searchOrcid);
router.get('/orcid/:orcid', publicationController.getOrcidProfile);
router.get('/:id', publicationController.getPublication);

// Protected routes (write)
router.post('/', authenticate, publicationController.savePublication);

module.exports = router;
