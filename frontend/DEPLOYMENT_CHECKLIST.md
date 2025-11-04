# Vercel Deployment Checklist

## ✅ Completed Setup

- [x] Created `.env` file with production backend URL
- [x] Created `.env.production` file
- [x] Created `vercel.json` configuration for SPA routing
- [x] Updated `.gitignore` to exclude environment files
- [x] Updated `.env.example` with deployment instructions
- [x] Created `DEPLOYMENT.md` guide

## 🚀 Ready to Deploy

Your frontend is now configured to connect to: `https://curalink-self.vercel.app/api`

### Quick Deploy Options:

#### Option 1: Vercel Dashboard (Recommended)
1. Visit https://vercel.com/new
2. Import your GitHub/GitLab repository
3. Set Root Directory: `frontend`
4. Framework: Vite (auto-detected)
5. Add environment variable:
   - `VITE_API_URL` = `https://curalink-self.vercel.app/api`
6. Click Deploy

#### Option 2: Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 📝 Post-Deployment Tasks

1. **Update Backend CORS**
   - Get your frontend URL from Vercel (e.g., `https://curalink-frontend.vercel.app`)
   - Update backend environment variable:
     ```
     CORS_ORIGIN=https://your-frontend-url.vercel.app
     ```
   - Redeploy backend if needed

2. **Test the Application**
   - Visit your Vercel URL
   - Test user registration/login
   - Verify API calls work correctly
   - Check browser console for errors

3. **Optional: Custom Domain**
   - Go to Vercel project settings
   - Add your custom domain
   - Update DNS records as instructed

## 🔧 Configuration Files

### vercel.json
Location: `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables
Required in Vercel dashboard:
- `VITE_API_URL`: https://curalink-self.vercel.app/api

## 🐛 Common Issues

### Issue: 404 on page refresh
**Solution**: Ensure `vercel.json` exists and contains the rewrite rules above

### Issue: API calls failing
**Solution**:
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend CORS settings
- Check browser console for CORS errors

### Issue: Build failing
**Solution**:
- Run `npm run build` locally first
- Check Vercel build logs
- Ensure all dependencies are in package.json

## 📦 What's Configured

✅ API client automatically uses `https://curalink-self.vercel.app/api`
✅ SPA routing configured for client-side navigation
✅ Environment files properly ignored in git
✅ Build scripts ready for Vercel

## 🎯 Next Steps

1. Deploy to Vercel using one of the options above
2. Update backend CORS with your new frontend URL
3. Test the complete application flow
4. (Optional) Add custom domain
5. Share your application!

---

**Need help?** See `DEPLOYMENT.md` for detailed instructions.
