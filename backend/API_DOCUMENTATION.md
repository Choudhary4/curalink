# CuraLink Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "user_type": "patient",
  "name": "John Doe"
}
```

**User Types:** `patient`, `researcher`, `health_expert`

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "patient"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "user_type": "patient"
  }
}
```

### Get Current User Profile
**GET** `/auth/profile`

**Headers:** Authorization required

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "user_type": "patient",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

---

## Patient Endpoints

**Authorization:** Requires `patient` role

### Get Patient Profile
**GET** `/patients/profile`

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "condition": "Type 2 Diabetes",
  "additional_conditions": ["Hypertension"],
  "location": "Boston, MA",
  "country": "USA",
  "age": 45,
  "bio": "Looking for clinical trials",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

### Update Patient Profile
**PUT** `/patients/profile`

**Request Body:**
```json
{
  "condition": "Type 2 Diabetes",
  "additional_conditions": ["Hypertension", "High Cholesterol"],
  "location": "Boston, MA",
  "country": "USA",
  "age": 45,
  "bio": "Looking for clinical trials for diabetes management"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### Get Personalized Recommendations
**GET** `/patients/recommendations`

**Response (200):**
```json
{
  "trials": [...],
  "publications": [...],
  "experts": [...]
}
```

---

## Researcher Endpoints

### Get Researcher Profile
**GET** `/researchers/profile`

**Authorization:** `researcher` or `health_expert`

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "name": "Dr. Jane Smith",
  "email": "jane@research.edu",
  "specialties": ["Oncology", "Clinical Trials"],
  "research_interests": ["Cancer Treatment", "Immunotherapy"],
  "institution": "Harvard Medical School",
  "orcid": "0000-0001-2345-6789",
  "researchgate": "https://www.researchgate.net/profile/Jane_Smith",
  "availability": "available",
  "bio": "Oncologist with 15 years experience",
  "years_experience": 15
}
```

### Update Researcher Profile
**PUT** `/researchers/profile`

**Request Body:**
```json
{
  "specialties": ["Oncology", "Clinical Trials"],
  "research_interests": ["Cancer Treatment"],
  "institution": "Harvard Medical School",
  "orcid": "0000-0001-2345-6789",
  "availability": "available",
  "years_experience": 15
}
```

### Get Experts
**GET** `/researchers/experts`

**Query Parameters:**
- `specialty` - Filter by specialty
- `availability` - Filter by availability (available, limited, unavailable)
- `user_type` - Filter by user type (health_expert, researcher)

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Dr. Jane Smith",
    "email": "jane@research.edu",
    "user_type": "health_expert",
    "specialties": ["Oncology"],
    "institution": "Harvard Medical School",
    "availability": "available",
    "bio": "Oncologist with 15 years experience"
  }
]
```

### Get Potential Collaborators
**GET** `/researchers/collaborators`

**Authorization:** `researcher` role

**Response (200):**
```json
[
  {
    "id": 3,
    "name": "Dr. Bob Johnson",
    "specialties": ["Cardiology"],
    "research_interests": ["Heart Disease"],
    "institution": "Stanford University"
  }
]
```

---

## Clinical Trials Endpoints

### Get Clinical Trials
**GET** `/trials`

**Query Parameters:**
- `condition` - Filter by condition
- `phase` - Filter by trial phase
- `status` - Filter by status
- `country` - Filter by country
- `search` - Search in title and description

**Response (200):**
```json
[
  {
    "id": 1,
    "nct_id": "NCT12345678",
    "title": "Study of New Diabetes Treatment",
    "description": "Phase 3 clinical trial...",
    "phase": "Phase 3",
    "status": "Recruiting",
    "location": "Boston, MA",
    "country": "USA",
    "conditions": ["Type 2 Diabetes"],
    "eligibility": "Adults 18-65 with Type 2 Diabetes",
    "contact_email": "trial@hospital.org"
  }
]
```

### Get Single Trial
**GET** `/trials/:id`

**Response (200):**
```json
{
  "id": 1,
  "nct_id": "NCT12345678",
  "title": "Study of New Diabetes Treatment",
  "description": "Detailed description...",
  "phase": "Phase 3",
  "status": "Recruiting",
  "eligibility": "Complete eligibility criteria..."
}
```

### Create Trial
**POST** `/trials`

**Authorization:** `researcher` or `health_expert`

**Request Body:**
```json
{
  "title": "New Cancer Treatment Trial",
  "description": "Phase 2 study...",
  "phase": "Phase 2",
  "status": "Recruiting",
  "location": "Boston, MA",
  "country": "USA",
  "conditions": ["Breast Cancer"],
  "eligibility": "Women 18-70 with stage 2 breast cancer",
  "contact_email": "trial@hospital.org"
}
```

### Update Trial
**PUT** `/trials/:id`

**Authorization:** Must be trial creator or `health_expert`

### Search ClinicalTrials.gov
**GET** `/trials/search-gov`

**Query Parameters:**
- `query` or `condition` - Search term

**Response (200):**
```json
{
  "studies": [...]
}
```

---

## Publications Endpoints

### Get Publications
**GET** `/publications`

**Query Parameters:**
- `search` - Search term
- `year` - Publication year
- `author` - Author name
- `journal` - Journal name

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Advances in Diabetes Treatment",
    "authors": "Smith J, Doe J",
    "journal": "New England Journal of Medicine",
    "year": 2024,
    "pubmed_id": "12345678",
    "doi": "10.1234/example",
    "summary": "This study explores...",
    "citation_count": 45
  }
]
```

### Search PubMed
**GET** `/publications/search-pubmed`

**Query Parameters:**
- `query` - Search term (required)
- `retmax` - Max results (default: 20)

**Response (200):**
```json
[
  {
    "pubmed_id": "12345678",
    "title": "Research Title",
    "authors": "Smith J, Doe J",
    "journal": "Journal Name",
    "year": 2024,
    "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/"
  }
]
```

### Save Publication
**POST** `/publications`

**Request Body:**
```json
{
  "title": "Research Title",
  "authors": "Smith J, Doe J",
  "journal": "Journal Name",
  "year": 2024,
  "pubmed_id": "12345678",
  "doi": "10.1234/example",
  "summary": "Abstract text...",
  "keywords": ["diabetes", "treatment"]
}
```

### Get ORCID Profile
**GET** `/publications/orcid/:orcid`

**Example:** `/publications/orcid/0000-0001-2345-6789`

---

## Forum Endpoints

### Get All Forums
**GET** `/forums`

**Query Parameters:**
- `category` - Filter by category

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Diabetes Support",
    "description": "Community for diabetes patients",
    "category": "Patient Support",
    "creator_name": "Admin",
    "post_count": 150,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create Forum
**POST** `/forums`

**Request Body:**
```json
{
  "name": "Cancer Research Discussion",
  "description": "Forum for cancer research topics",
  "category": "Research"
}
```

### Get Forum Posts
**GET** `/forums/:forumId/posts`

**Response (200):**
```json
[
  {
    "id": 1,
    "forum_id": 1,
    "user_id": 5,
    "author_name": "John Doe",
    "user_type": "patient",
    "title": "Looking for advice",
    "content": "Post content...",
    "reply_count": 10,
    "view_count": 150,
    "is_pinned": false,
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

### Create Post
**POST** `/forums/:forumId/posts`

**Request Body:**
```json
{
  "title": "My Experience with Treatment",
  "content": "I wanted to share my experience..."
}
```

### Get Post with Replies
**GET** `/forums/posts/:postId`

**Response (200):**
```json
{
  "id": 1,
  "title": "Post Title",
  "content": "Post content...",
  "author_name": "John Doe",
  "replies": [
    {
      "id": 1,
      "content": "Reply content...",
      "author_name": "Jane Smith",
      "created_at": "2025-01-15T11:00:00.000Z"
    }
  ]
}
```

### Create Reply
**POST** `/forums/posts/:postId/replies`

**Request Body:**
```json
{
  "content": "Thank you for sharing..."
}
```

---

## Favorites Endpoints

### Get Favorites
**GET** `/favorites`

**Query Parameters:**
- `item_type` - Filter by type (trial, publication, researcher, expert)

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "item_type": "trial",
    "item_id": 5,
    "created_at": "2025-01-15T10:30:00.000Z",
    "details": {
      "title": "Clinical Trial Title",
      "phase": "Phase 3"
    }
  }
]
```

### Add Favorite
**POST** `/favorites`

**Request Body:**
```json
{
  "item_type": "trial",
  "item_id": 5
}
```

### Remove Favorite
**DELETE** `/favorites`

**Request Body:**
```json
{
  "item_type": "trial",
  "item_id": 5
}
```

### Check if Favorited
**GET** `/favorites/check?item_type=trial&item_id=5`

**Response (200):**
```json
{
  "isFavorited": true
}
```

---

## Meeting & Collaboration Endpoints

### Get Meeting Requests
**GET** `/meetings`

**Query Parameters:**
- `type` - Filter by type (sent, received)
- `status` - Filter by status (pending, accepted, declined, completed)

**Response (200):**
```json
[
  {
    "id": 1,
    "requester_id": 1,
    "requester_name": "John Doe",
    "expert_id": 2,
    "expert_name": "Dr. Smith",
    "status": "pending",
    "message": "I would like to discuss...",
    "preferred_date": "2025-02-01T14:00:00.000Z"
  }
]
```

### Request Meeting
**POST** `/meetings/request`

**Request Body:**
```json
{
  "expert_id": 2,
  "message": "I would like to discuss my condition",
  "preferred_date": "2025-02-01T14:00:00.000Z"
}
```

### Update Meeting Status
**PUT** `/meetings/:id/status`

**Request Body:**
```json
{
  "status": "accepted",
  "meeting_link": "https://zoom.us/j/123456",
  "notes": "Looking forward to our discussion"
}
```

### Get Collaborations
**GET** `/meetings/collaborations`

**Authorization:** `researcher` role

**Query Parameters:**
- `status` - Filter by status

**Response (200):**
```json
[
  {
    "id": 1,
    "researcher1_id": 2,
    "researcher1_name": "Dr. Smith",
    "researcher2_id": 3,
    "researcher2_name": "Dr. Johnson",
    "status": "active",
    "project_title": "Joint Research Project",
    "description": "Collaborative study on..."
  }
]
```

### Request Collaboration
**POST** `/meetings/collaborations/request`

**Authorization:** `researcher` role

**Request Body:**
```json
{
  "researcher2_id": 3,
  "project_title": "Cancer Research Collaboration",
  "description": "I would like to collaborate on..."
}
```

### Update Collaboration Status
**PUT** `/meetings/collaborations/:id/status`

**Authorization:** `researcher` role

**Request Body:**
```json
{
  "status": "active"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message description"
}
```
