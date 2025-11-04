# Deploying Mobile Petrol Pump App to Vercel

## ⚠️ IMPORTANT: Two-Part Deployment Required

Your app has:
- **Frontend**: React app (can deploy to Vercel ✅)
- **Backend**: FastAPI + MongoDB (must deploy elsewhere ❌ not on Vercel)

## Part 1: Deploy Frontend to Vercel

### Prerequisites:
1. GitHub account
2. Vercel account (free tier available)
3. Push your code to GitHub using Emergent's "Save to GitHub" feature

### Steps:

1. **Push to GitHub** (if not done already)
   - Use Emergent's "Save to GitHub" button
   - Or manually push your code

2. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub

3. **Import Project**
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Framework Preset: Create React App

4. **Configure Build Settings**
   - Build Command: `cd frontend && yarn build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && yarn install`

5. **Environment Variables** (Important!)
   - Add: `REACT_APP_BACKEND_URL`
   - Value: Your deployed backend URL (see Part 2)

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Part 2: Deploy Backend (Choose One Platform)

### Option A: Railway (Recommended)

1. **Go to Railway**
   - Visit https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository

3. **Configure Python Backend**
   - Root Directory: `backend`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Add MongoDB**
   - Click "New" > "Database" > "Add MongoDB"
   - Railway will provide connection string

5. **Environment Variables**
   - `MONGO_URL`: Use Railway's MongoDB connection string
   - Copy the generated URL for your backend

6. **Update Frontend**
   - Go back to Vercel
   - Update `REACT_APP_BACKEND_URL` with Railway backend URL
   - Redeploy frontend

### Option B: Render

1. **Go to Render**
   - Visit https://render.com
   - Sign in with GitHub

2. **Create Web Service**
   - Click "New" > "Web Service"
   - Connect your repository
   - Root Directory: `backend`

3. **Configure**
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Add MongoDB**
   - Use MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
   - Create free cluster
   - Get connection string

5. **Environment Variables**
   - `MONGO_URL`: Your MongoDB Atlas connection string

6. **Update Frontend**
   - Update Vercel's `REACT_APP_BACKEND_URL`
   - Redeploy

## Part 3: Configure CORS

### Update backend/server.py:

```python
from fastapi.middleware.cors import CORSMiddleware

# Add after app initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app"],  # Your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ⚠️ Current Limitations with Vercel Deployment:

1. **No Offline Functionality**: Your app currently uses localStorage and is designed for offline Android use. When deployed to Vercel, it becomes a web app that requires internet connection.

2. **Android WebView Won't Work**: The Android app built with Android Studio loads from local assets. It won't automatically connect to your Vercel deployment.

3. **Database Required**: You'll need a cloud MongoDB (like MongoDB Atlas) instead of local MongoDB.

4. **Two Separate Services**: Frontend and backend are separate, requiring CORS configuration and careful URL management.

5. **Cost**: While Vercel frontend is free, backend hosting (Railway/Render) may have costs beyond free tier.

## 💡 Recommended Alternative:

Use Emergent's deployment feature:
- One-click deployment
- Handles full stack automatically
- No CORS issues
- Keeps offline functionality for Android
- 50 credits/month

## Final Checklist for Vercel Deployment:

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway/Render
- [ ] MongoDB Atlas set up (or Railway MongoDB)
- [ ] Backend URL obtained
- [ ] Frontend deployed to Vercel
- [ ] REACT_APP_BACKEND_URL configured in Vercel
- [ ] CORS configured in backend
- [ ] Tested frontend connects to backend
- [ ] All API endpoints working

## Common Errors:

**"Not Found" Error:**
- Make sure `vercel.json` is in root directory
- Verify output directory is `frontend/build`
- Check build command includes `cd frontend`

**"Backend Connection Failed":**
- Verify REACT_APP_BACKEND_URL is set correctly
- Check CORS configuration in backend
- Ensure backend is running and accessible

**"Build Failed":**
- Check all dependencies in `frontend/package.json`
- Verify Node version compatibility
- Review build logs in Vercel dashboard

