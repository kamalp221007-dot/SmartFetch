# Complete Deployment Guide - SmartFetch

## Overview
This guide will help you deploy the complete SmartFetch application (Frontend + Backend) to a public URL.

## Prerequisites
- GitHub account (for code hosting)
- Railway account (free tier available at railway.app)
- Vercel account (free tier available at vercel.com)

---

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SmartFetch application"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/smartfetch.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Environment Files
- `backend/.env` - Contains Twilio credentials and PORT=3001
- `frontend/.env` - Contains VITE_API_URL=http://localhost:3001 (will be updated during deployment)

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

### 2.2 Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your smartfetch repository
3. Railway will auto-detect it's a Node.js project
4. Configure environment variables:
   - Go to Variables tab
   - Add all variables from `backend/.env`:
     ```
     TWILIO_ACCOUNT_SID=REDACTED_TWILIO_SID
     TWILIO_AUTH_TOKEN=REDACTED_TWILIO_TOKEN
     TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
     TWILIO_VERIFY_SERVICE_ID=REDACTED_VERIFY_SID
     PORT=3001
     NODE_ENV=production
     FRONTEND_URL=https://YOUR_FRONTEND_URL.vercel.app
     ```

### 2.3 Configure Build Settings
1. In Railway dashboard, go to Settings
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy

### 2.4 Get Backend URL
- Railway will provide a public URL like: `https://smartfetch-backend-prod.up.railway.app`
- Copy this URL - you'll need it for the frontend

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Select "Next.js" as framework (or "Vite" if using Vite)
4. Configure environment variables:
   ```
   VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app
   NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL.up.railway.app
   VITE_SUPABASE_URL=https://sxghctohznlmuuyzyaut.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z2hjdG9oem5sbXV1eXp5YXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDM1NTQsImV4cCI6MjA4ODUxOTU1NH0.7p8wjA4lyVApfp8NaLo4RJ0A_7PtyIRjVgG40h-Jpbo
   ```
5. Set Root Directory: `frontend` (if using monorepo structure)
6. Deploy

### 3.3 Get Frontend URL
- Vercel will provide a public URL like: `https://smartfetch-frontend.vercel.app`

---

## Step 4: Update Backend with Frontend URL

1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend

---

## Step 5: Test the Complete System

### 5.1 Test Backend Health
```bash
curl https://YOUR_BACKEND_URL.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "SmartFetch OTP Service",
  "timestamp": "2026-03-17T..."
}
```

### 5.2 Test OTP Sending
```bash
curl -X POST https://YOUR_BACKEND_URL.up.railway.app/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"6309527895"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully via WhatsApp",
  "expiresIn": 300
}
```

### 5.3 Test Frontend
1. Open your Vercel URL in browser
2. Click "Login with WhatsApp"
3. Enter phone number: 6309527895
4. Check WhatsApp for OTP
5. Enter OTP to verify

---

## Step 6: Troubleshooting

### Backend Not Starting
- Check Railway logs: Dashboard → Logs tab
- Verify all environment variables are set
- Ensure `backend/package.json` has `"main": "simple-server.js"`

### OTP Not Sending
- Verify Twilio credentials in Railway environment variables
- Check if phone number is in Twilio sandbox (for testing)
- Check Railway logs for Twilio API errors

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS is enabled in backend (it is in simple-server.js)
- Check browser console for network errors

### Supabase Connection Issues
- Verify Supabase URL and key in frontend environment variables
- Check Supabase project is active
- Verify RLS policies allow anonymous access

---

## Complete Working URLs

After deployment, you'll have:

**Frontend URL**: `https://smartfetch-frontend.vercel.app`
**Backend URL**: `https://smartfetch-backend-prod.up.railway.app`
**Supabase**: `https://sxghctohznlmuuyzyaut.supabase.co`

**To use the application**: Open the Frontend URL in your browser

---

## Alternative Deployment Options

### Option 1: Render.com (Free Tier)
- Similar to Railway
- Go to https://render.com
- Connect GitHub repository
- Deploy backend and frontend separately

### Option 2: Heroku (Paid, but reliable)
- Go to https://heroku.com
- Connect GitHub repository
- Deploy with Procfile

### Option 3: AWS (Free tier available)
- Use AWS Amplify for frontend
- Use AWS Lambda for backend
- More complex setup

---

## Monitoring & Maintenance

### Check Backend Status
- Railway Dashboard → Deployments tab
- View logs in real-time

### Monitor Errors
- Check Railway logs for backend errors
- Check Vercel logs for frontend errors
- Check browser console for frontend issues

### Update Code
1. Make changes locally
2. Commit and push to GitHub
3. Railway and Vercel will auto-redeploy

---

## Security Notes

1. **Never commit `.env` files** - Use environment variables in deployment platforms
2. **Rotate Twilio credentials** if exposed
3. **Enable HTTPS** - Both Railway and Vercel provide HTTPS by default
4. **Set CORS properly** - Backend only allows requests from your frontend URL
5. **Use strong passwords** - For Supabase and other services

---

## Support

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Verify all environment variables are set correctly
3. Test endpoints using curl or Postman
4. Check Twilio console for message delivery status

