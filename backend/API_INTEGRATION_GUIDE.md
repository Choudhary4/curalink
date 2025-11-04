# CuraLink API Integration Guide

## Overview

CuraLink now integrates with 5 external APIs to provide real-time, authoritative medical information to patients and researchers:

1. **PubMed API** - Real medical publications and research papers
2. **ClinicalTrials.gov API** - Live clinical trial data
3. **Google Gemini API** - AI-powered text summarization and NLP
4. **ORCID API** - Researcher profiles and publications
5. **Gemini NLP** - Natural language understanding for patient queries

## API Endpoints

### 1. PubMed Integration

#### Search Publications (Live PubMed Data)
```
GET /api/publications?search={query}&useLive=true
GET /api/publications/search-pubmed?query={query}&retmax={number}
```

**Example:**
```bash
curl "http://localhost:5000/api/publications?search=lung%20cancer&useLive=true"
```

**Response:**
```json
[
  {
    "pubmed_id": "38123456",
    "title": "Novel Treatments for Lung Cancer...",
    "authors": "Smith J, Johnson A, et al.",
    "journal": "Nature Medicine",
    "publication_date": "2024",
    "abstract": "...",
    "doi": "10.1038/...",
    "url": "https://pubmed.ncbi.nlm.nih.gov/38123456/",
    "relevance_score": 1.0
  }
]
```

### 2. ClinicalTrials.gov Integration

#### Search Clinical Trials (Live Data)
```
GET /api/trials?condition={condition}&useLive=true
GET /api/trials/search-gov?query={query}&location={location}
```

**Example:**
```bash
curl "http://localhost:5000/api/trials?condition=breast%20cancer&country=United%20States&useLive=true"
```

**Response:**
```json
[
  {
    "nct_id": "NCT05123456",
    "title": "Phase III Trial of Novel Immunotherapy...",
    "description": "This study evaluates...",
    "phase": "Phase 3",
    "status": "RECRUITING",
    "sponsor": "Mayo Clinic",
    "conditions": "Breast Cancer, Metastatic",
    "locations": ["New York, NY", "Boston, MA"],
    "enrollment": 150,
    "start_date": "2024-01-15",
    "completion_date": "2026-12-31",
    "eligibility": "Adults 18+ with metastatic breast cancer...",
    "min_age": "18 Years",
    "max_age": "N/A",
    "gender": "All",
    "url": "https://clinicaltrials.gov/study/NCT05123456",
    "recruiting": true
  }
]
```

### 3. Gemini AI Integration

All AI endpoints require authentication.

#### Check AI Service Status
```
GET /api/ai/status
```

#### Summarize Text for Patients
```
POST /api/ai/summarize
Content-Type: application/json

{
  "text": "Complex medical text here...",
  "maxWords": 150
}
```

**Response:**
```json
{
  "summary": "In simple terms, this research shows that..."
}
```

#### Simplify Publication Abstract
```
POST /api/ai/simplify/abstract
Content-Type: application/json

{
  "title": "Novel Immunotherapy Approach...",
  "abstract": "We conducted a randomized controlled trial..."
}
```

**Response:**
```json
{
  "simplified": "Researchers tested a new cancer treatment..."
}
```

#### Simplify Clinical Trial Description
```
POST /api/ai/simplify/trial
Content-Type: application/json

{
  "title": "Phase III Trial...",
  "description": "...",
  "phase": "Phase 3",
  "eligibility": "..."
}
```

**Response:**
```json
{
  "simplified": "This study is looking for patients who..."
}
```

#### Extract Medical Keywords from Patient Input
```
POST /api/ai/extract-keywords
Content-Type: application/json

{
  "input": "I've been diagnosed with stage 2 breast cancer and want to know about new treatments"
}
```

**Response:**
```json
{
  "condition": "breast cancer",
  "symptoms": [],
  "keywords": ["breast cancer", "stage 2", "treatments", "therapy"],
  "treatments": ["chemotherapy", "immunotherapy", "targeted therapy"]
}
```

#### Generate Search Query from Natural Language
```
POST /api/ai/generate-query
Content-Type: application/json

{
  "input": "What are the latest treatments for my lung cancer?"
}
```

**Response:**
```json
{
  "query": "lung cancer treatment latest therapy 2024"
}
```

#### Answer Patient Questions
```
POST /api/ai/answer-question
Content-Type: application/json

{
  "question": "What is immunotherapy?",
  "context": "Patient has been diagnosed with melanoma"
}
```

**Response:**
```json
{
  "answer": "Immunotherapy is a type of cancer treatment that helps your immune system fight cancer..."
}
```

### 4. ORCID Integration

#### Search for Researchers
```
GET /api/publications/search-orcid?query={name or affiliation}&maxResults={number}
```

**Example:**
```bash
curl "http://localhost:5000/api/publications/search-orcid?query=oncology%20researcher"
```

**Response:**
```json
[
  {
    "orcid": "0000-0001-2345-6789",
    "name": "Dr. Jane Smith",
    "affiliation": "Johns Hopkins University",
    "url": "https://orcid.org/0000-0001-2345-6789"
  }
]
```

#### Get Researcher Profile
```
GET /api/publications/orcid/{orcid_id}
```

**Example:**
```bash
curl "http://localhost:5000/api/publications/orcid/0000-0001-2345-6789"
```

**Response:**
```json
{
  "orcid": "0000-0001-2345-6789",
  "name": "Dr. Jane Smith",
  "biography": "Professor of Oncology...",
  "keywords": ["Cancer Research", "Immunotherapy", "Clinical Trials"],
  "affiliations": [
    {
      "organization": "Johns Hopkins University",
      "role": "Professor",
      "department": "Oncology",
      "start_date": "2015",
      "end_date": null
    }
  ],
  "education": [...],
  "publications": [
    {
      "title": "Novel Immunotherapy Approaches...",
      "type": "JOURNAL_ARTICLE",
      "publication_date": "2024",
      "journal": "Nature Medicine",
      "url": "https://doi.org/..."
    }
  ],
  "publication_count": 47,
  "url": "https://orcid.org/0000-0001-2345-6789"
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# PubMed API (Public, no key required)
PUBMED_API_BASE=https://eutils.ncbi.nlm.nih.gov/entrez/eutils

# ClinicalTrials.gov API (Public, no key required)
CLINICALTRIALS_API_BASE=https://clinicaltrials.gov/api/v2

# ORCID API (Public, no key required)
ORCID_API_BASE=https://pub.orcid.org/v3.0

# Gemini AI (Requires API key)
GEMINI_API_KEY=your_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note:** The Gemini API is optional. If not configured, AI features will return a 503 error with a helpful message. All other features will work normally.

## Frontend Integration Examples

### Fetch Publications with PubMed
```javascript
import { publications } from './services/api';

// Search PubMed for live data
const response = await publications.getPublications({
  search: 'breast cancer treatment',
  useLive: true
});
const articles = response.data;
```

### Search Clinical Trials
```javascript
import { trials } from './services/api';

// Get live clinical trials
const response = await trials.getTrials({
  condition: 'lung cancer',
  country: 'United States',
  status: 'recruiting',
  useLive: true
});
const liveTrials = response.data;
```

### Simplify Medical Text with AI
```javascript
import { ai } from './services/api';

// Simplify abstract for patients
const response = await ai.simplifyAbstract({
  title: article.title,
  abstract: article.abstract
});
const simplified = response.data.simplified;
```

### Extract Keywords from Patient Input
```javascript
import { ai } from './services/api';

// Understand patient's natural language query
const response = await ai.extractKeywords({
  input: userInput
});
const { condition, keywords, treatments } = response.data;

// Use extracted info to search
const publications = await publications.getPublications({
  search: condition,
  useLive: true
});
```

### Search for Researchers
```javascript
import { publications } from './services/api';

// Find researchers by specialty
const response = await publications.searchOrcid({
  query: 'oncology immunotherapy'
});
const researchers = response.data;

// Get detailed profile
const profileResponse = await publications.getOrcidProfile(researcher.orcid);
const profile = profileResponse.data;
```

## Benefits of API Integration

### For Patients:
1. **Real-time Data** - Access the latest medical research and clinical trials
2. **Simplified Language** - AI converts complex medical text into plain English
3. **Personalized Results** - Natural language understanding provides relevant matches
4. **Verified Information** - Data from authoritative sources (PubMed, ClinicalTrials.gov, ORCID)

### For Researchers:
1. **Comprehensive Profiles** - Automatic researcher profile fetching from ORCID
2. **Publication Tracking** - Real-time access to latest publications
3. **Collaboration Discovery** - Find researchers working on similar topics
4. **Clinical Trial Awareness** - Stay updated on relevant trials

## Error Handling

All API endpoints include comprehensive error handling:

```javascript
try {
  const response = await publications.getPublications({
    search: query,
    useLive: true
  });
  // Handle success
} catch (error) {
  if (error.response?.status === 503) {
    // Service unavailable (e.g., API down or key not configured)
    console.log('Using fallback data...');
  } else if (error.response?.status === 400) {
    // Bad request (missing parameters)
    console.error('Invalid request:', error.response.data.error);
  } else {
    // Other errors
    console.error('Request failed:', error.message);
  }
}
```

## Rate Limiting

Be mindful of API rate limits:

- **PubMed**: Max 3 requests per second
- **ClinicalTrials.gov**: No official limit, but be respectful
- **ORCID**: No authentication required for public API, reasonable use
- **Gemini**: Depends on your API plan (free tier: 60 requests/minute)

## Testing

Test the APIs using the provided endpoints:

```bash
# Test PubMed integration
curl "http://localhost:5000/api/publications/search-pubmed?query=cancer"

# Test ClinicalTrials.gov integration
curl "http://localhost:5000/api/trials/search-gov?condition=diabetes"

# Test ORCID integration
curl "http://localhost:5000/api/publications/search-orcid?query=researcher"

# Test AI service status
curl "http://localhost:5000/api/ai/status"
```

## Support

For issues or questions:
- Check the API documentation at `http://localhost:5000/api`
- Review error messages in the console
- Ensure all environment variables are set correctly
- Verify your Gemini API key is valid (if using AI features)
