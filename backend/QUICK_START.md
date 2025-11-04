# CuraLink Backend - Quick Start Guide

## Fast Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and run schema
CREATE DATABASE curalink;
USE curalink;
SOURCE database/schema.sql;
exit;
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Change: DB_PASSWORD, JWT_SECRET
```

### 4. Start Server
```bash
npm start
```

### 5. Test It
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "user_type": "patient",
    "name": "Test User"
  }'
```

## Common Commands

```bash
npm start              # Start server
npm run dev            # Development mode (auto-restart)
npm install            # Install dependencies
```

## Essential Endpoints

### Authentication
```bash
# Register
POST /api/auth/register

# Login
POST /api/auth/login

# Get profile (requires token)
GET /api/auth/profile
```

### For Patients
```bash
GET /api/patients/profile
GET /api/patients/recommendations
GET /api/trials
GET /api/publications
```

### For Researchers
```bash
GET /api/researchers/profile
GET /api/researchers/experts
GET /api/researchers/collaborators
POST /api/trials
```

## Environment Variables Quick Reference

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=curalink
JWT_SECRET=your_secret_key
```

## Project Structure

```
backend/
├── server.js              # Start here
├── routes/                # API routes
├── controllers/           # Business logic
├── middleware/            # Auth middleware
├── config/                # Database config
└── database/schema.sql    # Database schema
```

## Need Help?

- **Setup Issues?** → Check `SETUP_GUIDE.md`
- **API Details?** → Check `API_DOCUMENTATION.md`
- **Overview?** → Check `README.md`
- **Implementation?** → Check `IMPLEMENTATION_SUMMARY.md`

## Default Configuration

- **Server Port:** 5000
- **Database:** MySQL (localhost:3306)
- **JWT Expiry:** 7 days
- **CORS Origin:** http://localhost:3000

## Quick Test Sequence

1. Start server: `npm start`
2. Register user: Use POST /api/auth/register
3. Save the token from response
4. Test authenticated endpoint with token
5. Success!

## Troubleshooting

**Database connection failed?**
- Check MySQL is running
- Verify DB credentials in .env

**Port already in use?**
- Change PORT in .env

**Module not found?**
- Run `npm install`

## What's Included?

✅ User authentication (JWT)
✅ Patient profiles
✅ Researcher profiles
✅ Clinical trials database
✅ Publications system
✅ Community forums
✅ Favorites
✅ Meeting requests
✅ Collaborations
✅ PubMed API integration
✅ ClinicalTrials.gov API

## Next Steps

1. ✅ Get backend running
2. Test endpoints with Postman
3. Set up frontend (React)
4. Connect frontend to backend
5. Deploy to production

---

**Ready in 5 minutes!** ⚡
