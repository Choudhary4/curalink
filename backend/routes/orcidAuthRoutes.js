const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Initiate ORCID OAuth login
router.get('/orcid', passport.authenticate('orcid'));

// ORCID OAuth callback
router.get('/orcid/callback',
  passport.authenticate('orcid', { session: false, failureRedirect: '/login?error=orcid_auth_failed' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, userType: req.user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/orcid/callback?token=${token}`);
    } catch (error) {
      console.error('ORCID callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// Link ORCID to existing account
router.get('/orcid/link',
  passport.authenticate('orcid', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // The ORCID will already be linked via the OAuth callback
      res.json({ message: 'ORCID linked successfully' });
    } catch (error) {
      console.error('ORCID link error:', error);
      res.status(500).json({ error: 'Failed to link ORCID' });
    }
  }
);

module.exports = router;
