# CuraLink Backend API

Backend server for the CuraLink platform - connecting patients with clinical trials, researchers, and health experts.

## Features

- User authentication with JWT
- Patient profile management
- Researcher and health expert profiles
- Clinical trials database and search
- PubMed publication integration
- Community forums
- Meeting and collaboration requests
- Favorites system
- External API integrations (PubMed, ClinicalTrials.gov, ORCID)

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT Authentication
- Axios for external APIs
- bcrypt for password hashing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other settings.

### 3. Create Database

Run the schema file to create the database:

```bash
mysql -u root -p < database/schema.sql
```

Or manually create the database and tables using your preferred MySQL client.

### 4. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/recommendations` - Get personalized recommendations

### Researchers
- `GET /api/researchers/profile` - Get researcher profile
- `PUT /api/researchers/profile` - Update researcher profile
- `GET /api/researchers/experts` - Get list of experts
- `GET /api/researchers/collaborators` - Find potential collaborators

### Clinical Trials
- `GET /api/trials` - Get clinical trials (with filters)
- `GET /api/trials/:id` - Get single trial
- `POST /api/trials` - Create new trial
- `PUT /api/trials/:id` - Update trial
- `GET /api/trials/search-gov` - Search ClinicalTrials.gov

### Publications
- `GET /api/publications` - Get publications (with filters)
- `GET /api/publications/:id` - Get single publication
- `POST /api/publications` - Save publication
- `GET /api/publications/search-pubmed` - Search PubMed
- `GET /api/publications/orcid/:orcid` - Get ORCID profile

### Forums
- `GET /api/forums` - Get all forums
- `POST /api/forums` - Create new forum
- `GET /api/forums/:forumId/posts` - Get forum posts
- `POST /api/forums/:forumId/posts` - Create new post
- `GET /api/forums/posts/:postId` - Get post with replies
- `POST /api/forums/posts/:postId/replies` - Create reply

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites` - Remove favorite
- `GET /api/favorites/check` - Check if item is favorited

### Meetings & Collaborations
- `GET /api/meetings` - Get meeting requests
- `POST /api/meetings/request` - Request meeting
- `PUT /api/meetings/:id/status` - Update meeting status
- `GET /api/meetings/collaborations` - Get collaborations
- `POST /api/meetings/collaborations/request` - Request collaboration
- `PUT /api/meetings/collaborations/:id/status` - Update collaboration status

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Types

- `patient` - Patients seeking clinical trials and health information
- `researcher` - Medical researchers
- `health_expert` - Healthcare professionals and experts

## External API Integrations

### PubMed API
Used for searching medical publications and research papers.

### ClinicalTrials.gov API
Used for searching and importing clinical trial data.

### ORCID API
Used for fetching researcher profiles and publications.

## Database Schema

See `database/schema.sql` for complete database structure including:
- Users and Profiles (Patient/Researcher)
- Clinical Trials
- Publications
- Forums and Posts
- Favorites
- Meeting Requests
- Collaborations

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## License

MIT
