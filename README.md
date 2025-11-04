# CuraLink - AI-Powered Healthcare Platform

**CuraLink** is an AI-powered platform that connects **patients** and **researchers** by simplifying the discovery of **clinical trials**, **medical publications**, and **health experts**. This MVP demonstrates a clean, intuitive UI/UX for both user types.

---

## 🎯 **Features**

### **For Patients:**
- 🏥 **Personalized Dashboard** with tailored recommendations
- 👨‍⚕️ **Health Experts Discovery** with meeting requests
- 🔬 **Clinical Trials Search** with advanced filters
- 📚 **Publications Library** with AI summaries
- 💬 **Community Forums** for asking questions
- ⭐ **Favorites System** to save interesting content

### **For Researchers:**
- 📊 **Professional Dashboard** with stats and insights
- 👥 **Collaborator Network** to find research partners
- 🔬 **Trial Management** to create and manage studies
- 💬 **Forum Engagement** to answer patient questions
- 📖 **Publication Integration** (ORCID, ResearchGate)
- ⭐ **Favorites & Connections** management

---

## 🛠️ **Tech Stack**

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL
- **APIs:** PubMed, ClinicalTrials.gov, ORCID, ResearchGate

---

## 📁 **Project Structure**

```
CuraLink/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TrialCard.jsx
│   │   │   ├── ExpertCard.jsx
│   │   │   ├── PublicationCard.jsx
│   │   │   └── ForumPostCard.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Forums.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── patient/
│   │   │   │   ├── PatientOnboarding.jsx
│   │   │   │   ├── PatientDashboard.jsx
│   │   │   │   ├── HealthExperts.jsx
│   │   │   │   ├── ClinicalTrials.jsx
│   │   │   │   └── Publications.jsx
│   │   │   └── researcher/
│   │   │       ├── ResearcherOnboarding.jsx
│   │   │       ├── ResearcherDashboard.jsx
│   │   │       └── Collaborators.jsx
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/               # Node.js + Express backend
│   ├── config/
│   │   └── database.js
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth middleware
│   ├── database/
│   │   └── schema.sql    # MySQL schema
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ installed
- MySQL 8+ installed and running
- npm or yarn package manager

### **1. Clone and Setup**

```bash
cd CuraLink
```

### **2. Backend Setup**

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup MySQL database
mysql -u root -p < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env and add your database credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=curalink
# JWT_SECRET=your_secret_key

# Start backend server
npm start
```

Backend will run on `http://localhost:3000`

### **3. Frontend Setup**

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed (default: http://localhost:3000/api)

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🌐 **Application Flow**

### **Landing Page**
1. Clean, minimal design with two options:
   - "I'm a Patient" → Patient Onboarding
   - "I'm a Researcher" → Researcher Onboarding

### **Patient Flow**
1. **Onboarding:** Enter medical condition, location, additional conditions
2. **Dashboard:** View personalized recommendations
3. **Explore:**
   - Search health experts and request meetings
   - Find relevant clinical trials
   - Browse research publications
   - Participate in forums
   - Save favorites

### **Researcher Flow**
1. **Onboarding:** Enter specialties, research interests, ORCID/ResearchGate (optional)
2. **Dashboard:** View stats, meeting requests, forum activity
3. **Engage:**
   - Find collaborators
   - Manage clinical trials
   - Answer patient questions in forums
   - Save favorites

---

## 📊 **Key Features Explained**

### **🤖 AI-Powered Features**
- **Smart Matching:** Recommendations based on user profiles
- **AI Summaries:** Simplified clinical trial and publication summaries
- **Natural Language:** Enter conditions in plain English

### **🔍 Search & Filtering**
- Advanced filters for trials (phase, status, location)
- Expert search by specialty and availability
- Publication search by keywords, year, journal

### **💬 Community Forums**
- Patients can post questions
- Researchers can reply and create communities
- Threaded discussions with reply counts

### **⭐ Favorites System**
- Save trials, publications, experts/collaborators
- Organized by category
- Quick access from dashboard

### **📧 Communication**
- Meeting requests with availability checking
- Collaboration requests for researchers
- Email integration for trial administrators

---

## 🎨 **Design Principles**

- **Clean & Minimal:** Inspired by Duolingo's simple UX
- **Intuitive Navigation:** Clear paths for both user types
- **Responsive Design:** Works on mobile, tablet, desktop
- **Accessible:** Readable fonts, logical structure
- **Color-Coded:**
  - **Patients:** Indigo/Purple theme
  - **Researchers:** Cyan/Blue theme

---

## 🔐 **Security Features**

- JWT authentication
- bcrypt password hashing
- Role-based access control
- SQL injection prevention
- CORS protection

---

## 📚 **API Documentation**

See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference including:
- 40+ endpoints
- Request/response examples
- Authentication flows
- Error handling

---

## 🗄️ **Database Schema**

11 MySQL tables with proper relationships:
- Users & Profiles (Patient/Researcher)
- Clinical Trials
- Publications
- Forums & Posts
- Favorites
- Meeting Requests
- Collaborations

See [backend/database/schema.sql](backend/database/schema.sql)

---

## 🧪 **Testing the Application**

### **As a Patient:**
1. Go to `http://localhost:5173`
2. Click "I'm a Patient"
3. Complete onboarding with a condition (e.g., "Brain Cancer")
4. Explore personalized dashboard
5. Search for clinical trials, experts, publications
6. Post in forums and save favorites

### **As a Researcher:**
1. Go to `http://localhost:5173`
2. Click "I'm a Researcher"
3. Complete onboarding with specialties
4. View dashboard and stats
5. Find collaborators
6. Reply to patient questions in forums

---

## 📦 **Deployment**

### **Frontend (Vercel/Netlify)**
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### **Backend (Heroku/Railway/DigitalOcean)**
```bash
cd backend
# Set environment variables
# Deploy using your platform's CLI
```

### **Database**
- Use managed MySQL (AWS RDS, DigitalOcean Databases, PlanetScale)
- Import schema.sql
- Update .env with production credentials

---

## 🐛 **Troubleshooting**

### **Frontend won't start**
- Check Node.js version (18+)
- Delete node_modules and run `npm install` again
- Check port 5173 is not in use

### **Backend errors**
- Verify MySQL is running
- Check database credentials in .env
- Ensure schema.sql was imported correctly
- Check port 3000 is available

### **API connection fails**
- Verify backend is running on port 3000
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend

---

## 🎯 **Future Enhancements**

- [ ] Real-time chat system
- [ ] Video consultation integration
- [ ] Advanced AI recommendations
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Calendar integration for meetings
- [ ] Analytics dashboard
- [ ] Multi-language support

---

## 👥 **Contributing**

This is a hackathon project. For the full team experience and continued development, join as a founding team member!

---

## 📝 **License**

© 2025 CuraLink. All rights reserved.

---

## 📧 **Support**

For questions or issues:
- Check the documentation in `/backend` folder
- Review API documentation
- Test with provided mock data

---

## 🏆 **Hackathon Submission**

### **What's Included:**
✅ Complete MVP with all required features
✅ Clean, intuitive UI/UX
✅ Fully functional patient and researcher flows
✅ Responsive design
✅ Working backend API
✅ MySQL database schema
✅ External API integrations
✅ Comprehensive documentation

### **Demo Video:**
Record a 3-5 minute demo showing:
1. Landing page
2. Patient onboarding and features
3. Researcher onboarding and features
4. Key interactions (search, forums, favorites)

---

**Built with dedication, obsession, and AI-powered productivity! 🚀**
