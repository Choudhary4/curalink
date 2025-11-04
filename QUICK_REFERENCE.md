# 🚀 CuraLink Quick Reference

## **Immediate Actions**

### **1. Test the Application (RIGHT NOW)**
```bash
# Frontend is already running at: http://localhost:5173
# Open your browser and visit the link above
```

### **2. Start the Backend**
```bash
# Open a new terminal
cd backend
npm install

# Setup database first:
# - Open MySQL: mysql -u root -p
# - Run: source database/schema.sql
# - Or: mysql -u root -p < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start server
npm start
# Backend will run on: http://localhost:3000
```

---

## **📁 File Locations**

### **Frontend Pages**
```
frontend/src/pages/
├── LandingPage.jsx              # Start here
├── patient/
│   ├── PatientOnboarding.jsx    # Patient signup
│   ├── PatientDashboard.jsx     # Patient home
│   ├── HealthExperts.jsx        # Find doctors
│   ├── ClinicalTrials.jsx       # Find trials
│   └── Publications.jsx         # Research papers
└── researcher/
    ├── ResearcherOnboarding.jsx # Researcher signup
    ├── ResearcherDashboard.jsx  # Researcher home
    └── Collaborators.jsx        # Find partners
```

### **Key Backend Files**
```
backend/
├── server.js                    # Entry point
├── database/schema.sql          # Database setup
├── routes/                      # All API routes
├── controllers/                 # Business logic
└── .env.example                 # Config template
```

---

## **🎮 Test User Flows**

### **Patient Flow**
1. Visit http://localhost:5173
2. Click "I'm a Patient"
3. Enter: "I have Brain Cancer" (or any condition)
4. Complete onboarding
5. Explore dashboard, trials, experts

### **Researcher Flow**
1. Visit http://localhost:5173
2. Click "I'm a Researcher"
3. Select specialties (Oncology, Neurology, etc.)
4. Complete onboarding
5. Explore dashboard, collaborators, forums

---

## **🔧 Common Commands**

```bash
# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm start            # Start server
npm run dev          # Start with nodemon (if configured)

# Database
mysql -u root -p     # Open MySQL
source database/schema.sql    # Import schema
```

---

## **📊 What's Included**

✅ 18 Frontend pages/components
✅ 40+ API endpoints
✅ 11 Database tables
✅ 5 Card components
✅ Full authentication system
✅ Search and filtering
✅ Forums and favorites
✅ Meeting requests
✅ AI summaries
✅ Responsive design

---

## **🐛 Quick Fixes**

### **Frontend won't start**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Backend errors**
```bash
# Check MySQL is running
mysql -u root -p

# Verify .env file exists
cat backend/.env

# Check port 3000 is free
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### **Database issues**
```bash
# Recreate database
mysql -u root -p
DROP DATABASE IF EXISTS curalink;
CREATE DATABASE curalink;
USE curalink;
source database/schema.sql;
```

---

## **🌐 URLs**

- **Frontend Dev:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **MySQL:** localhost:3306

---

## **📋 Environment Variables**

### **Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

### **Backend (.env)**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=curalink
DB_PORT=3306
JWT_SECRET=your_secret_key_min_32_chars
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

---

## **📦 Deployment (Quick)**

```bash
# Frontend to Vercel
cd frontend
vercel

# Backend to Railway
cd backend
railway up

# Or use deployment guide
cat DEPLOYMENT.md
```

---

## **📚 Documentation**

- **README.md** - Main guide
- **PROJECT_SUMMARY.md** - Complete overview
- **DEPLOYMENT.md** - Deployment steps
- **backend/API_DOCUMENTATION.md** - API reference
- **backend/SETUP_GUIDE.md** - Backend setup
- **backend/QUICK_START.md** - 5-min start

---

## **✅ Pre-Submission Checklist**

- [ ] Test patient flow completely
- [ ] Test researcher flow completely
- [ ] Verify all pages load
- [ ] Check responsive design on mobile
- [ ] Test search and filters
- [ ] Verify forums work
- [ ] Test favorites system
- [ ] Record 3-5 minute demo video
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Railway)
- [ ] Submit links to Telegram

---

## **🎬 Demo Video Script**

**0:00-0:30** - Landing page tour
**0:30-2:00** - Patient journey (onboarding → trials → experts)
**2:00-3:30** - Researcher journey (onboarding → collaborators → forums)
**3:30-5:00** - Key features (AI summaries, search, favorites)

---

## **🆘 Need Help?**

1. Check the error message
2. Review relevant documentation
3. Check browser console (F12)
4. Verify environment variables
5. Restart servers

---

## **💡 Pro Tips**

- Frontend is ALREADY RUNNING on port 5173
- Mock data is built-in for testing
- LocalStorage persists user data
- No backend needed for basic testing
- All pages are responsive
- UI is color-coded (Indigo=Patient, Cyan=Researcher)

---

**Everything is ready! Just open http://localhost:5173 and start testing! 🎉**
