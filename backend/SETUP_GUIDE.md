# CuraLink Backend - Setup Guide

## Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Node.js Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

This will install:
- express (web framework)
- cors (cross-origin resource sharing)
- mysql2 (MySQL database driver)
- dotenv (environment variables)
- axios (HTTP client for external APIs)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)

### 2. Configure MySQL Database

#### Start MySQL Server

Make sure your MySQL server is running:

**Windows:**
- Open Services and start the MySQL service
- Or use MySQL Workbench

**Mac/Linux:**
```bash
sudo systemctl start mysql
# or
brew services start mysql
```

#### Create Database

Option 1: Using command line:
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE curalink;
USE curalink;
SOURCE database/schema.sql;
```

Option 2: Using MySQL Workbench:
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open `database/schema.sql`
4. Execute the script

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=curalink
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_random_secret_key_here_change_this
JWT_EXPIRE=7d

# External APIs
PUBMED_API_BASE=https://eutils.ncbi.nlm.nih.gov/entrez/eutils
CLINICALTRIALS_API_BASE=https://clinicaltrials.gov/api/v2
ORCID_API_BASE=https://pub.orcid.org/v3.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important Security Notes:**
- Change `JWT_SECRET` to a long, random string
- Use a strong MySQL password
- Never commit `.env` to version control

### 4. Test Database Connection

Try starting the server to test the database connection:

```bash
npm start
```

You should see:
```
Database connected successfully
╔═══════════════════════════════════════════════════╗
║           CuraLink Backend Server                 ║
║   Status: Running                                 ║
║   Port: 5000                                      ║
╚═══════════════════════════════════════════════════╝
```

### 5. Test API Endpoints

#### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "CuraLink Backend API"
}
```

#### Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "user_type": "patient",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "user_type": "patient"
  }
}
```

Save the token for authenticated requests!

#### Test Authenticated Endpoint
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Optional: Install Development Tools

For development, it's helpful to install nodemon for auto-restart:

```bash
npm install --save-dev nodemon
```

Then use:
```bash
npm run dev
```

## Common Issues and Solutions

### Issue: Database Connection Failed

**Error:** `Database connection failed: ER_ACCESS_DENIED_ERROR`

**Solution:**
- Check your DB_USER and DB_PASSWORD in `.env`
- Ensure MySQL server is running
- Try connecting with MySQL Workbench to verify credentials

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change PORT in `.env` to a different number (e.g., 5001)
- Or stop the process using port 5000

### Issue: JWT Secret Not Set

**Error:** Related to JWT token generation

**Solution:**
- Ensure JWT_SECRET is set in `.env`
- Make sure `.env` file is in the backend directory
- Restart the server after changing `.env`

### Issue: Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Testing the Backend

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the endpoints from `API_DOCUMENTATION.md`
3. Create a collection with:
   - Register endpoint
   - Login endpoint
   - Other endpoints with Authorization header

### Using cURL

See `API_DOCUMENTATION.md` for example cURL commands

### Using the Frontend

Once the React frontend is set up, it will automatically connect to the backend at `http://localhost:5000`

## Database Schema Overview

The database includes these main tables:
- **Users** - All user accounts
- **PatientProfiles** - Patient-specific information
- **ResearcherProfiles** - Researcher/expert information
- **ClinicalTrials** - Clinical trial database
- **Publications** - Medical publications
- **Forums & ForumPosts** - Community forums
- **Favorites** - User favorites
- **MeetingRequests** - Meeting scheduling
- **Collaborations** - Research collaborations

See `database/schema.sql` for complete schema.

## Next Steps

1. Test all API endpoints using Postman or cURL
2. Populate the database with sample data
3. Set up the frontend React application
4. Configure CORS to allow frontend requests
5. Set up proper logging and monitoring

## Development Workflow

1. Start the backend server: `npm run dev`
2. Make changes to code
3. Server auto-restarts (if using nodemon)
4. Test endpoints with Postman/cURL
5. Check console for errors

## Production Deployment

Before deploying to production:

1. Change `NODE_ENV=production` in `.env`
2. Use a strong, unique `JWT_SECRET`
3. Set up proper MySQL database (not localhost)
4. Configure proper CORS origins
5. Set up SSL/HTTPS
6. Use environment variables instead of `.env` file
7. Set up proper logging
8. Configure rate limiting
9. Set up database backups

## Support

For issues or questions:
- Check `API_DOCUMENTATION.md` for API details
- Review `README.md` for general information
- Check database schema in `database/schema.sql`

## Security Best Practices

- Never commit `.env` to version control
- Use strong passwords for database
- Keep JWT_SECRET secure and random
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated
- Regular security audits
