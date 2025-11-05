const geminiService = require('../services/geminiService');

// Summarize text for patients
exports.summarize = async (req, res) => {
  try {
    const { text, maxWords } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI summarization service is not available. Please configure GEMINI_API_KEY.'
      });
    }

    const summary = await geminiService.summarizeForPatients(text, maxWords);

    res.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

// Simplify publication abstract
exports.simplifyAbstract = async (req, res) => {
  try {
    const { abstract, title } = req.body;

    if (!abstract) {
      return res.status(400).json({ error: 'Abstract is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const simplified = await geminiService.simplifyAbstract(abstract, title);

    res.json({ simplified });
  } catch (error) {
    console.error('Abstract simplification error:', error);
    res.status(500).json({ error: 'Failed to simplify abstract' });
  }
};

// Simplify clinical trial description
exports.simplifyTrial = async (req, res) => {
  try {
    const trialData = req.body;

    if (!trialData.title && !trialData.description) {
      return res.status(400).json({ error: 'Trial data is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const simplified = await geminiService.simplifyTrialDescription(trialData);

    res.json({ simplified });
  } catch (error) {
    console.error('Trial simplification error:', error);
    res.status(500).json({ error: 'Failed to simplify trial' });
  }
};

// Extract medical keywords from patient input
exports.extractKeywords = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const extracted = await geminiService.extractMedicalKeywords(input);

    res.json(extracted);
  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({ error: 'Failed to extract keywords' });
  }
};

// Generate search query from natural language
exports.generateSearchQuery = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const query = await geminiService.generateSearchQuery(input);

    res.json({ query });
  } catch (error) {
    console.error('Query generation error:', error);
    res.status(500).json({ error: 'Failed to generate search query' });
  }
};

// Answer patient question
exports.answerQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const answer = await geminiService.answerPatientQuestion(question, context);

    res.json({ answer });
  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

// Generate forum response draft for researchers
exports.generateForumResponse = async (req, res) => {
  try {
    const { postTitle, postContent, postAuthor } = req.body;

    if (!postTitle || !postContent) {
      return res.status(400).json({ error: 'Post title and content are required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const response = await geminiService.generateForumResponse(postTitle, postContent, postAuthor);

    res.json({ response });
  } catch (error) {
    console.error('Forum response generation error:', error);
    res.status(500).json({ error: 'Failed to generate forum response' });
  }
};

// Chat with AI assistant
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service is not available'
      });
    }

    const response = await geminiService.chat(message, conversationHistory);

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

// Check if AI services are available
exports.checkStatus = async (req, res) => {
  try {
    const available = geminiService.isAvailable();

    res.json({
      available,
      message: available
        ? 'AI services are operational'
        : 'AI services are not configured. Set GEMINI_API_KEY to enable.'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check AI service status' });
  }
};
