const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const { promisePool } = require('./database');
const bcrypt = require('bcryptjs');
const orcidService = require('../services/orcidService');

// ORCID OAuth Strategy
passport.use('orcid', new OAuth2Strategy({
    authorizationURL: process.env.ORCID_AUTH_URL || 'https://orcid.org/oauth/authorize',
    tokenURL: process.env.ORCID_TOKEN_URL || 'https://orcid.org/oauth/token',
    clientID: process.env.ORCID_CLIENT_ID,
    clientSecret: process.env.ORCID_CLIENT_SECRET,
    callbackURL: process.env.ORCID_CALLBACK_URL || 'http://localhost:5000/api/auth/orcid/callback',
    scope: ['/authenticate'],
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, params, profile, done) {
    try {
      // Extract ORCID iD from params
      const orcidId = params.orcid;
      const orcidName = params.name;

      console.log('ORCID OAuth callback received:', { orcidId, orcidName });

      if (!orcidId) {
        return done(new Error('No ORCID iD received'));
      }

      // Check if user already exists with this ORCID
      const [existingUsers] = await promisePool.query(
        'SELECT u.*, rp.orcid FROM Users u LEFT JOIN ResearcherProfiles rp ON u.id = rp.user_id WHERE rp.orcid = ?',
        [orcidId]
      );

      if (existingUsers.length > 0) {
        // User exists, log them in
        console.log('Existing ORCID user found, logging in');
        return done(null, existingUsers[0]);
      }

      // Fetch full profile from ORCID
      let fullProfile = null;
      try {
        fullProfile = await orcidService.getResearcherProfile(orcidId);
        console.log('Fetched ORCID profile:', fullProfile.name);
      } catch (error) {
        console.error('Error fetching ORCID profile:', error.message);
      }

      // Create new researcher account
      const email = `${orcidId}@orcid.temp`; // Temporary email, user can update later
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10); // Random password

      const [userResult] = await promisePool.query(
        'INSERT INTO Users (email, password, user_type, name) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'researcher', fullProfile?.name || orcidName || 'ORCID User']
      );

      const userId = userResult.insertId;

      // Create researcher profile with ORCID data
      await promisePool.query(
        `INSERT INTO ResearcherProfiles
        (user_id, specialties, research_interests, institution, orcid)
        VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          JSON.stringify(fullProfile?.keywords || []),
          JSON.stringify(fullProfile?.keywords || []),
          fullProfile?.affiliations?.[0]?.organization || null,
          orcidId
        ]
      );

      // Get the newly created user
      const [newUser] = await promisePool.query(
        'SELECT * FROM Users WHERE id = ?',
        [userId]
      );

      console.log('New ORCID user created:', newUser[0].email);

      done(null, newUser[0]);
    } catch (error) {
      console.error('ORCID OAuth error:', error);
      done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await promisePool.query('SELECT * FROM Users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
