const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let genAI = null;
let model = null;

// Initialize the Gemini API with API key
const initializeGemini = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini API initialized successfully');
  } else if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI features will be disabled.');
  }
};

// Initialize on module load
initializeGemini();

// Check if Gemini is available
exports.isAvailable = () => {
  return !!process.env.GEMINI_API_KEY && !!model;
};

// Summarize medical text for patients
exports.summarizeForPatients = async (text, maxWords = 150) => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized. Please set GEMINI_API_KEY in environment variables.');
    }

    const prompt = `You are a medical communicator helping patients understand complex medical information.

Summarize the following medical text in simple, clear language that a patient without medical training can understand.

Guidelines:
- Use everyday language, avoid medical jargon
- Explain any technical terms you must use
- Keep it to around ${maxWords} words
- Focus on what the patient needs to know
- Be encouraging and clear, not alarming
- If it's a research study, explain what they found in plain terms

Medical text to summarize:
${text}

Plain language summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary.trim();

  } catch (error) {
    console.error('Gemini summarization error:', error.message);
    throw new Error('Failed to generate summary');
  }
};

// Simplify publication abstract
exports.simplifyAbstract = async (abstract, title = '') => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `Simplify this medical research abstract for a patient audience.

${title ? `Research Title: ${title}\n\n` : ''}Abstract:
${abstract}

Provide a clear, patient-friendly summary that:
1. Explains what the researchers studied
2. Describes the key findings in simple terms
3. Mentions what this means for patients
4. Uses everyday language (avoid jargon)
5. Keeps it under 200 words

Patient-friendly summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error simplifying abstract:', error.message);
    throw new Error('Failed to simplify abstract');
  }
};

// Simplify clinical trial description
exports.simplifyTrialDescription = async (trialData) => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `Simplify this clinical trial information for patients who might want to participate.

Title: ${trialData.title || 'Clinical Trial'}
Description: ${trialData.description || ''}
Phase: ${trialData.phase || 'Not specified'}
Eligibility: ${trialData.eligibility || 'See full details'}

Create a patient-friendly explanation that:
1. Explains what this trial is studying in simple terms
2. Describes who might be eligible (in plain language)
3. Mentions the trial phase and what that means
4. Keeps it clear and encouraging
5. Under 200 words

Patient-friendly explanation:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error simplifying trial:', error.message);
    throw new Error('Failed to simplify trial description');
  }
};

// Extract medical conditions and keywords from patient input
exports.extractMedicalKeywords = async (userInput) => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `You are a medical NLP system. Extract medical conditions, symptoms, and relevant keywords from the patient's input.

Patient input: "${userInput}"

Extract:
1. Main medical condition or disease mentioned (if any)
2. Symptoms or concerns
3. Medical keywords for searching publications
4. Treatment interests

Respond in this JSON format:
{
  "condition": "primary medical condition",
  "symptoms": ["symptom1", "symptom2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "treatments": ["treatment1", "treatment2"]
}

Only include fields that are relevant. If the input is not medical-related, return an empty object.

JSON response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};

  } catch (error) {
    console.error('Error extracting keywords:', error.message);
    throw new Error('Failed to extract medical keywords');
  }
};

// Generate search query from natural language input
exports.generateSearchQuery = async (userInput) => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `Convert this patient's question or statement into an effective PubMed search query.

Patient input: "${userInput}"

Generate a concise, effective search query using medical terminology that would find relevant research papers.
Return ONLY the search query, nothing else.

Search query:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error generating search query:', error.message);
    throw new Error('Failed to generate search query');
  }
};

// Simplify researcher bio
exports.simplifyResearcherBio = async (bio, specialties = []) => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `Simplify this researcher's bio for patients who want to understand their expertise.

Bio: ${bio}
${specialties.length > 0 ? `Specialties: ${specialties.join(', ')}` : ''}

Create a clear, patient-friendly summary that:
1. Explains what this researcher works on
2. Describes their expertise in simple terms
3. Mentions how this relates to patient care or research
4. Under 100 words
5. Avoid academic jargon

Patient-friendly bio:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error simplifying bio:', error.message);
    throw new Error('Failed to simplify bio');
  }
};

// Answer patient questions about medical topics
exports.answerPatientQuestion = async (question, context = '') => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `You are a medical information assistant helping patients understand health topics.

Patient question: "${question}"
${context ? `\nContext: ${context}` : ''}

Provide a helpful, accurate answer that:
1. Directly addresses their question
2. Uses simple, clear language
3. Is medically accurate but accessible
4. Encourages them to consult healthcare providers for personal medical advice
5. Is supportive and non-alarming
6. Under 250 words

Important: Always remind users to consult with their healthcare provider for personalized medical advice.

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error answering question:', error.message);
    throw new Error('Failed to answer question');
  }
};

// Generate forum response draft for researchers
exports.generateForumResponse = async (postTitle, postContent, postAuthor = '') => {
  try {
    initializeGemini();

    if (!model) {
      throw new Error('Gemini API not initialized');
    }

    const prompt = `You are assisting a medical researcher to draft a professional, helpful response to a patient's forum post.

Forum Post Title: "${postTitle}"
Post Content: "${postContent}"
${postAuthor ? `Posted by: ${postAuthor}` : ''}

Generate a professional, empathetic response draft that:
1. Acknowledges the patient's question or concern with empathy
2. Provides accurate, evidence-based medical information in accessible language
3. Avoids overwhelming medical jargon but maintains scientific accuracy
4. Encourages the patient to discuss with their healthcare provider for personalized advice
5. Is supportive and encouraging without being alarmist
6. Is concise (200-300 words maximum)
7. Maintains a professional yet warm tone appropriate for researcher-to-patient communication

Important guidelines:
- Never provide specific medical advice or diagnoses
- Always remind them to consult their healthcare provider for personalized guidance
- Be respectful of their concerns and questions
- Focus on general medical knowledge and research insights
- If the topic is outside your expertise, acknowledge that and suggest consulting specialists

Response draft:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();

  } catch (error) {
    console.error('Error generating forum response:', error.message);
    throw new Error('Failed to generate forum response');
  }
};
