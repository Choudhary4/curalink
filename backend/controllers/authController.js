const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, user_type, name } = req.body;

    // Validation
    if (!email || !password || !user_type || !name) {
      return res.status(400).json({
        error: 'All fields are required: email, password, user_type, name'
      });
    }

    // Validate user_type
    const validTypes = ['patient', 'researcher', 'health_expert'];
    if (!validTypes.includes(user_type)) {
      return res.status(400).json({
        error: 'Invalid user_type. Must be: patient, researcher, or health_expert'
      });
    }

    // Check if user already exists
    const [existingUsers] = await promisePool.query(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await promisePool.query(
      'INSERT INTO Users (email, password, user_type, name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, user_type, name]
    );

    const userId = result.insertId;

    // Create profile based on user type
    if (user_type === 'patient') {
      await promisePool.query(
        'INSERT INTO PatientProfiles (user_id) VALUES (?)',
        [userId]
      );
    } else if (user_type === 'researcher' || user_type === 'health_expert') {
      await promisePool.query(
        'INSERT INTO ResearcherProfiles (user_id) VALUES (?)',
        [userId]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        user_type
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await promisePool.query(
      'SELECT id, email, password, user_type, name FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await promisePool.query(
      'SELECT id, email, name, user_type, created_at FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
