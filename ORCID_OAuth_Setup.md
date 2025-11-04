# ORCID OAuth Integration Setup Guide

This guide explains how to set up ORCID OAuth authentication for researcher sign-up and login in CuraLink.

## What is ORCID OAuth?

ORCID OAuth allows researchers to sign in to CuraLink using their ORCID iD, automatically importing their:
- Full name
- Research interests and keywords
- Institutional affiliations
- Publications history
- Education background

## Benefits

1. **Faster Onboarding**: Researchers can skip manual form filling
2. **Verified Data**: Profile information comes directly from ORCID
3. **Auto-sync**: Research profiles stay up-to-date with ORCID
4. **Trust**: ORCID is the standard identifier for researchers worldwide

## Setup Instructions

### Step 1: Register Your Application with ORCID

#### For Development/Testing (Sandbox):

1. Go to [https://sandbox.orcid.org/signin](https://sandbox.orcid.org/signin)
2. Create an account or sign in
3. Click your name in the top right → **Developer Tools**
4. Click **Register for ORCID Public API credentials**
5. Fill in the application form:
   - **Application name**: CuraLink Dev
   - **Application URL**: http://localhost:5173
   - **Application description**: Healthcare research collaboration platform connecting patients with researchers
   - **Redirect URIs**:
     ```
     http://localhost:5000/api/auth/orcid/callback
     ```

6. Save the application to receive:
   - **Client ID** (e.g., `APP-XXXXXXXXX`)
   - **Client Secret** (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### For Production:

1. Go to [https://orcid.org/signin](https://orcid.org/signin)
2. Follow the same steps as above
3. **Important**: Only HTTPS redirect URIs are accepted in production
   - Example: `https://yourdomain.com/api/auth/orcid/callback`

### Step 2: Configure Environment Variables

1. Open `backend/.env`
2. Update the ORCID OAuth section:

```env
# ORCID OAuth Configuration
ORCID_CLIENT_ID=APP-XXXXXXXXX
ORCID_CLIENT_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ORCID_CALLBACK_URL=http://localhost:5000/api/auth/orcid/callback

# For sandbox testing, use:
ORCID_AUTH_URL=https://sandbox.orcid.org/oauth/authorize
ORCID_TOKEN_URL=https://sandbox.orcid.org/oauth/token

# For production, use:
# ORCID_AUTH_URL=https://orcid.org/oauth/authorize
# ORCID_TOKEN_URL=https://orcid.org/oauth/token
```

### Step 3: Restart the Backend Server

```bash
cd backend
node server.js
```

You should see:
```
Server running on port 5000
Database connected successfully
```

## How It Works

### Authentication Flow

```
1. User clicks "Continue with ORCID" on researcher onboarding page
   ↓
2. Redirected to ORCID login page (sandbox.orcid.org or orcid.org)
   ↓
3. User signs in with ORCID credentials
   ↓
4. ORCID asks user to authorize CuraLink
   ↓
5. User approves, ORCID redirects back to:
   http://localhost:5000/api/auth/orcid/callback
   ↓
6. Backend receives ORCID iD and access token
   ↓
7. Backend fetches full profile from ORCID API
   ↓
8. Backend creates user account and researcher profile
   ↓
9. Backend generates JWT token
   ↓
10. Frontend receives token and redirects to /profile
```

### API Endpoints

#### `GET /api/auth/orcid`
Initiates ORCID OAuth flow. Redirects user to ORCID login page.

#### `GET /api/auth/orcid/callback`
Handles OAuth callback from ORCID. Creates or logs in user, then redirects to frontend with JWT token.

**Success Response:**
- Redirects to: `http://localhost:5173/auth/orcid/callback?token=<jwt_token>`

**Error Response:**
- Redirects to: `http://localhost:5173/login?error=orcid_auth_failed`

### Frontend Components

#### OrcidCallback Component (`/auth/orcid/callback`)
- Receives JWT token from URL
- Stores token in localStorage
- Redirects to `/profile`

#### ResearcherOnboarding Component
- Shows "Continue with ORCID" button
- Links to `GET /api/auth/orcid`
- Provides manual registration fallback

## Testing

### Test with ORCID Sandbox

1. Create a test ORCID account at [https://sandbox.orcid.org/register](https://sandbox.orcid.org/register)

2. Add some test data to your ORCID profile:
   - Employment information
   - Education history
   - Research keywords

3. Go to CuraLink researcher onboarding:
   ```
   http://localhost:5173/researcher/onboarding
   ```

4. Click "Continue with ORCID"

5. Sign in with your sandbox ORCID account

6. Authorize CuraLink

7. You should be redirected back and logged in automatically

8. Check your profile at `/profile` to see imported data

### Verify Data Import

After successful ORCID login, check that the following data was imported:

- ✅ Name (from ORCID profile)
- ✅ ORCID iD (stored in ResearcherProfiles.orcid)
- ✅ Institution (from primary employment)
- ✅ Research interests/keywords
- ✅ Email (temporary, user can update)

## Troubleshooting

### Error: "No ORCID iD received"
- **Cause**: OAuth callback didn't include ORCID iD
- **Solution**: Check that your redirect URI exactly matches the one registered with ORCID

### Error: "Failed to fetch ORCID profile"
- **Cause**: ORCID API call failed
- **Solution**:
  - Verify ORCID_API_BASE is set to correct endpoint
  - Check that ORCID profile is public (not private)
  - Review backend logs for specific API error

### Redirect URI Mismatch
- **Error**: ORCID shows "The redirect URI included is not valid"
- **Solution**:
  - Verify `ORCID_CALLBACK_URL` in .env matches registered URI exactly
  - Check for typos, including http vs https
  - Domains must match exactly (including subdomains)

### Empty Profile Data
- **Cause**: ORCID profile doesn't have employment/education data
- **Solution**: This is expected behavior. The system will:
  - Use ORCID iD for verification
  - Allow user to manually fill profile later
  - Show "Not specified" for missing fields

## Security Considerations

1. **Never commit secrets**: Keep `.env` file out of version control
2. **Use HTTPS in production**: ORCID requires HTTPS redirect URIs
3. **Validate tokens**: Backend validates all ORCID responses
4. **Scoped access**: Only requests `/authenticate` scope (basic profile)
5. **Temporary emails**: Users can update auto-generated emails

## Production Deployment Checklist

- [ ] Register production application at orcid.org (not sandbox)
- [ ] Update `ORCID_CLIENT_ID` and `ORCID_CLIENT_SECRET` with production credentials
- [ ] Change `ORCID_AUTH_URL` to `https://orcid.org/oauth/authorize`
- [ ] Change `ORCID_TOKEN_URL` to `https://orcid.org/oauth/token`
- [ ] Update `ORCID_CALLBACK_URL` to use HTTPS production domain
- [ ] Register HTTPS redirect URI with ORCID
- [ ] Test full OAuth flow in production environment
- [ ] Monitor logs for OAuth errors
- [ ] Set up error alerting for failed authentications

## Additional Resources

- [ORCID Public API Documentation](https://info.orcid.org/documentation/api-tutorials/)
- [ORCID OAuth Specification](https://info.orcid.org/orcid-public-api-documentation/)
- [Register ORCID Application](https://orcid.org/developer-tools)
- [ORCID Sandbox](https://sandbox.orcid.org/)

## Support

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with ORCID sandbox first before production
4. Review ORCID API rate limits (public API has restrictions)
