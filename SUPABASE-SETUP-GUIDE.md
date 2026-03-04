# Supabase Setup Guide for Google OAuth Authentication

This guide walks you through setting up a Supabase project and configuring Google OAuth for the Personal Finance Tracker application.

## Prerequisites

- A Google Cloud Platform account
- A Supabase account (free tier is sufficient)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: personal-finance-tracker (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Choose the region closest to your users
4. Click "Create new project" and wait for provisioning to complete (1-2 minutes)

## Step 2: Get Supabase Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public key**: This is your `SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add **Authorized redirect URIs**:
     - For development: `http://localhost:3000/auth/callback`
     - For production: `https://your-domain.com/auth/callback`
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Google OAuth in Supabase

1. In your Supabase project, go to **Authentication** > **Providers**
2. Find **Google** in the list and click to expand
3. Enable Google authentication
4. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
5. Configure the redirect URL:
   - The redirect URL should be: `https://your-project.supabase.co/auth/v1/callback`
   - Copy this URL and add it to your Google Cloud Console OAuth credentials as an authorized redirect URI
6. Click "Save"

## Step 5: Update Environment Variables

Update your backend `.env` file with the Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-step-2
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-step-2

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5175

# Backend URL (for OAuth callbacks)
BACKEND_URL=http://localhost:3000

# Session Secret (for CSRF state tokens)
# Generate a random string for production
SESSION_SECRET=your-random-secret-key-change-this-in-production
```

**Important**: 
- Never commit the actual `.env` file to version control
- Use different credentials for development and production
- Keep the `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access to your database

## Step 6: Generate a Secure Session Secret

For production, generate a secure random string for `SESSION_SECRET`:

```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 7: Verify Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. The authentication endpoints should now be available:
   - OAuth initiation: `http://localhost:3000/auth/google`
   - OAuth callback: `http://localhost:3000/auth/callback`
   - Session check: `http://localhost:3000/auth/session`
   - Logout: `http://localhost:3000/auth/logout`

## Troubleshooting

### "Invalid redirect URI" error
- Ensure the redirect URI in Google Cloud Console exactly matches your backend callback URL
- Check for trailing slashes - they must match exactly

### "Invalid client" error
- Verify your Google Client ID and Client Secret are correct in Supabase
- Ensure the Google+ API is enabled in Google Cloud Console

### "CORS error" in browser
- Check that `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Ensure `withCredentials: true` is set in frontend API client

### Database connection issues
- Verify the users table was created successfully (run migration 005)
- Check database connection string in `.env`

## Security Checklist

Before deploying to production:

- [ ] Use HTTPS for all URLs (frontend, backend, and Supabase)
- [ ] Generate a strong, random `SESSION_SECRET`
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret and never expose it to the frontend
- [ ] Set `NODE_ENV=production` in production environment
- [ ] Configure proper CORS origins (not wildcard `*`)
- [ ] Enable rate limiting on authentication endpoints
- [ ] Review and restrict OAuth scopes to minimum required (email, profile)
- [ ] Set up proper logging and monitoring
- [ ] Use environment-specific Google OAuth credentials

## Next Steps

After completing this setup:

1. Implement the authentication routes (Task 7 in the implementation plan)
2. Create the frontend login page (Task 10 in the implementation plan)
3. Test the complete OAuth flow
4. Add authentication middleware to protect API routes

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
