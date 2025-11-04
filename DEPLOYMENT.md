# CuraLink Deployment Guide

This guide will help you deploy the CuraLink application to production.

---

## 📋 **Pre-Deployment Checklist**

- [ ] All features tested locally
- [ ] Database schema tested
- [ ] Environment variables configured
- [ ] Production API keys obtained
- [ ] Security review completed
- [ ] Performance testing done

---

## 🌐 **Deployment Options**

### **Frontend Deployment**

#### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Environment Variables:**
- Add `VITE_API_URL` in Vercel dashboard
- Point to your production backend URL

4. **Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### **Option 2: Netlify**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
cd frontend
netlify deploy --prod
```

3. **netlify.toml** (create in frontend/):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### **Backend Deployment**

#### **Option 1: Railway (Recommended)**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy:**
```bash
cd backend
railway login
railway init
railway up
```

3. **Add Environment Variables:**
```bash
railway variables set DB_HOST=your_db_host
railway variables set DB_USER=your_db_user
railway variables set DB_PASSWORD=your_db_password
railway variables set DB_NAME=curalink
railway variables set JWT_SECRET=your_secret
railway variables set PORT=3000
```

4. **Railway MySQL:**
- Add MySQL plugin in Railway dashboard
- Copy connection details to environment variables

#### **Option 2: Render**

1. **Create render.yaml** in backend/:
```yaml
services:
  - type: web
    name: curalink-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DB_HOST
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        value: curalink
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
```

2. **Deploy:**
- Connect GitHub repository
- Render auto-deploys on push

#### **Option 3: DigitalOcean App Platform**

1. **Create App:**
```bash
doctl apps create --spec backend/app.yaml
```

2. **app.yaml:**
```yaml
name: curalink-backend
services:
- name: api
  github:
    repo: your-repo/curalink
    branch: main
    deploy_on_push: true
  source_dir: /backend
  run_command: npm start
  envs:
  - key: DB_HOST
  - key: DB_USER
  - key: DB_PASSWORD
  - key: DB_NAME
  - key: JWT_SECRET
  - key: PORT
    value: "8080"
```

---

### **Database Deployment**

#### **Option 1: PlanetScale (MySQL-compatible)**

1. **Create Database:**
```bash
pscale database create curalink
pscale branch create curalink main
```

2. **Import Schema:**
```bash
pscale shell curalink main < database/schema.sql
```

3. **Get Connection String:**
```bash
pscale connect curalink main
```

#### **Option 2: AWS RDS**

1. **Create RDS Instance:**
- Choose MySQL 8.0
- Select instance size (t3.micro for testing)
- Configure security group

2. **Connect and Import:**
```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p < database/schema.sql
```

#### **Option 3: DigitalOcean Managed Database**

1. **Create Database:**
- Choose MySQL 8
- Select region and size

2. **Get Connection Details:**
- Download CA certificate
- Note host, port, user, password

3. **Import Schema:**
```bash
mysql -h your-db-host -P 25060 -u doadmin -p < database/schema.sql
```

---

## 🔐 **Environment Variables**

### **Frontend (.env.production)**
```env
VITE_API_URL=https://your-backend-url.com/api
```

### **Backend (.env.production)**
```env
# Database
DB_HOST=your_production_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=curalink
DB_PORT=3306

# Authentication
JWT_SECRET=your_very_secret_key_at_least_32_chars

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-url.com

# External APIs (if needed)
PUBMED_API_KEY=optional
ORCID_CLIENT_ID=optional
ORCID_CLIENT_SECRET=optional
```

---

## 🚀 **Production Build**

### **Frontend**
```bash
cd frontend
npm run build
# Creates optimized build in 'dist' folder
```

### **Backend**
```bash
cd backend
npm install --production
# Ready to deploy
```

---

## 🔍 **Post-Deployment Testing**

1. **Health Check:**
```bash
curl https://your-backend-url.com/api/health
```

2. **Test Frontend:**
- Visit your frontend URL
- Test patient onboarding
- Test researcher onboarding
- Verify API connections

3. **Database Connection:**
```bash
mysql -h your_db_host -u your_user -p your_database
SHOW TABLES;
```

---

## 📊 **Monitoring**

### **Application Monitoring**
- Use platform-specific dashboards (Vercel, Railway, etc.)
- Set up error tracking (Sentry)
- Monitor API response times

### **Database Monitoring**
- Check connection pool usage
- Monitor query performance
- Set up automated backups

---

## 🔄 **CI/CD Setup**

### **GitHub Actions (.github/workflows/deploy.yml)**
```yaml
name: Deploy CuraLink

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd frontend
          npm install
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          cd backend
          npm install
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🐛 **Common Deployment Issues**

### **Frontend Issues**

**Problem:** Blank page after deployment
- **Solution:** Check browser console, verify API_URL

**Problem:** Routes not working (404)
- **Solution:** Add redirect rules for SPA

### **Backend Issues**

**Problem:** Database connection fails
- **Solution:** Check DB credentials, firewall rules

**Problem:** CORS errors
- **Solution:** Update CORS_ORIGIN in .env

---

## 📝 **Production Checklist**

- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add error logging
- [ ] Set up monitoring/alerts
- [ ] Test all user flows
- [ ] Optimize images and assets
- [ ] Enable compression

---

## 🔧 **Performance Optimization**

### **Frontend**
- Enable gzip compression
- Use CDN for static assets
- Lazy load components
- Optimize images

### **Backend**
- Enable database connection pooling
- Add caching (Redis)
- Optimize database queries
- Use CDN for API responses

---

## 📱 **Custom Domain Setup**

### **Frontend (Vercel)**
```bash
vercel domains add yourdomain.com
```

### **Backend (Railway)**
- Add custom domain in Railway dashboard
- Point DNS A record to Railway IP

---

## 🎯 **Quick Deploy Commands**

```bash
# Deploy everything quickly:

# 1. Frontend to Vercel
cd frontend && vercel --prod

# 2. Backend to Railway
cd ../backend && railway up

# 3. Database migration
railway run mysql < database/schema.sql
```

---

## 📞 **Support**

For deployment issues:
- Check platform documentation
- Review logs in platform dashboard
- Verify environment variables
- Test locally first

---

**Ready to deploy? Follow these steps and your CuraLink MVP will be live! 🚀**
