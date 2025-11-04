# Curalink Frontend - Vercel Deployment Guide

This guide explains how to deploy the Curalink frontend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Git repository connected to Vercel
- Backend already deployed at: https://curalink-self.vercel.app

## Configuration

### Environment Variables

The frontend is configured to connect to the deployed backend at:
```
https://curalink-self.vercel.app/api
```

This is set in the `.env` and `.env.production` files.

### Files Created for Vercel Deployment

1. **vercel.json** - Vercel configuration for SPA routing
2. **.env** - Environment variables for all environments
3. **.env.production** - Production-specific environment variables

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - Name: `VITE_API_URL`
   - Value: `https://curalink-self.vercel.app/api`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Environment Variables in Vercel

Make sure to set the following environment variable in your Vercel project settings:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://curalink-self.vercel.app/api` |

## Post-Deployment

After deployment, Vercel will provide you with a URL for your frontend application (e.g., `https://your-app.vercel.app`).

### Update Backend CORS

Don't forget to update your backend's CORS settings to allow requests from your frontend URL:

In your backend `.env` file:
```env
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Local Development

For local development, you can:

1. Use the deployed backend:
   ```bash
   # .env.local (create this file)
   VITE_API_URL=https://curalink-self.vercel.app/api
   ```

2. Or use local backend:
   ```bash
   # .env.local (create this file)
   VITE_API_URL=http://localhost:5000/api
   ```

Then run:
```bash
npm run dev
```

## Build Locally

To test the production build locally:

```bash
npm run build
npm run preview
```

## Troubleshooting

### API Connection Issues

If the frontend can't connect to the backend:

1. Check that `VITE_API_URL` is set correctly in Vercel environment variables
2. Verify the backend is running at https://curalink-self.vercel.app
3. Check backend CORS settings allow your frontend domain

### Routing Issues

If page refreshes result in 404 errors:
- Verify `vercel.json` exists with the correct rewrite rules
- Check that the `vercel.json` is in the frontend root directory

### Build Failures

If the build fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally first: `npm run build`

## Project Structure

```
frontend/
├── .env                    # Environment variables (points to deployed backend)
├── .env.production         # Production environment variables
├── .env.example           # Example environment file
├── vercel.json            # Vercel configuration
├── src/
│   └── services/
│       └── api.js         # API client (reads VITE_API_URL)
└── ...
```

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Review build logs in Vercel dashboard
- Check browser console for frontend errors
