const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const orcidAuthRoutes = require('./routes/orcidAuthRoutes');
const patientRoutes = require('./routes/patientRoutes');
const researcherRoutes = require('./routes/researcherRoutes');
const trialRoutes = require('./routes/trialRoutes');
const publicationRoutes = require('./routes/publicationRoutes');
const forumRoutes = require('./routes/forumRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CuraLink Backend API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', orcidAuthRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/researchers', researcherRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'CuraLink API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      patients: {
        profile: 'GET/PUT /api/patients/profile',
        recommendations: 'GET /api/patients/recommendations'
      },
      researchers: {
        profile: 'GET/PUT /api/researchers/profile',
        experts: 'GET /api/researchers/experts',
        collaborators: 'GET /api/researchers/collaborators'
      },
      trials: {
        list: 'GET /api/trials',
        get: 'GET /api/trials/:id',
        create: 'POST /api/trials',
        update: 'PUT /api/trials/:id',
        searchGov: 'GET /api/trials/search-gov'
      },
      publications: {
        list: 'GET /api/publications',
        get: 'GET /api/publications/:id',
        save: 'POST /api/publications',
        searchPubMed: 'GET /api/publications/search-pubmed',
        searchOrcid: 'GET /api/publications/search-orcid',
        orcid: 'GET /api/publications/orcid/:orcid'
      },
      forums: {
        list: 'GET /api/forums',
        create: 'POST /api/forums',
        posts: 'GET /api/forums/:forumId/posts',
        createPost: 'POST /api/forums/:forumId/posts',
        getPost: 'GET /api/forums/posts/:postId',
        createReply: 'POST /api/forums/posts/:postId/replies'
      },
      favorites: {
        list: 'GET /api/favorites',
        add: 'POST /api/favorites',
        remove: 'DELETE /api/favorites',
        check: 'GET /api/favorites/check'
      },
      meetings: {
        list: 'GET /api/meetings',
        request: 'POST /api/meetings/request',
        updateStatus: 'PUT /api/meetings/:id/status',
        collaborations: 'GET /api/meetings/collaborations',
        requestCollab: 'POST /api/meetings/collaborations/request',
        updateCollab: 'PUT /api/meetings/collaborations/:id/status'
      },
      ai: {
        status: 'GET /api/ai/status',
        summarize: 'POST /api/ai/summarize',
        simplifyAbstract: 'POST /api/ai/simplify/abstract',
        simplifyTrial: 'POST /api/ai/simplify/trial',
        extractKeywords: 'POST /api/ai/extract-keywords',
        generateQuery: 'POST /api/ai/generate-query',
        answerQuestion: 'POST /api/ai/answer-question'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║           CuraLink Backend Server                 ║
║                                                   ║
║   Status: Running                                 ║
║   Port: ${PORT}                                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   API Docs: http://localhost:${PORT}/api             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
