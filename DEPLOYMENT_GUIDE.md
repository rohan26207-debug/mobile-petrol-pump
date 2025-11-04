# Deployment Guide - Mobile Petrol Pump

## 🚀 Deployment Options

Your application can be deployed in multiple ways:

---

## 1️⃣ Vercel Deployment (Web App)

### ✅ Current Production URL
```
https://mobilepetrolpump.vercel.app/
```

### 📦 What to Deploy
Deploy the `/app/frontend` folder to Vercel.

### 🔧 Environment Variables for Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
REACT_APP_BACKEND_URL=<your-backend-url>
REACT_APP_GOOGLE_CLIENT_ID=411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
WDS_SOCKET_PORT=443
```

### 📝 Deployment Steps
1. **Push to GitHub** (if not already done)
2. **Connect Vercel to your GitHub repo**
3. **Configure build settings:**
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Root Directory: `frontend`
4. **Add environment variables** (see above)
5. **Deploy!**

### 🔄 Auto Deploy
- Every push to main branch auto-deploys
- Preview deployments for pull requests

---

## 2️⃣ Android App Deployment

### Option A: Direct APK Distribution (No Play Store)

#### Build APK
```bash
cd /app/android
./gradlew assembleDebug  # For testing
./gradlew assembleRelease  # For production (requires keystore)
```

#### Distribute
- Email APK to users
- Host on your website
- Use Firebase App Distribution
- Share via Google Drive/Dropbox

#### Installation
Users need to:
1. Enable "Install from Unknown Sources"
2. Download and install APK
3. Open app and start using

**Pros:**
- ✅ Fast deployment
- ✅ No approval process
- ✅ Free

**Cons:**
- ❌ Users need to enable unknown sources
- ❌ No automatic updates
- ❌ Limited distribution

---

### Option B: Google Play Store

#### Requirements
- Google Play Developer Account ($25 one-time fee)
- Signed Release APK
- App assets (screenshots, description, icon)
- Privacy Policy URL
- Target API level 33+ (already configured)

#### Steps
1. **Create Release APK with signing**
2. **Create Play Console account**
3. **Create app listing**
4. **Upload APK/AAB**
5. **Fill app details**
6. **Submit for review** (2-7 days)

**See `/app/android/PLAY_STORE_DEPLOYMENT_GUIDE.md` for detailed guide**

**Pros:**
- ✅ Professional distribution
- ✅ Automatic updates
- ✅ User trust
- ✅ Play Store visibility

**Cons:**
- ❌ $25 fee
- ❌ Review process
- ❌ Ongoing policy compliance

---

## 3️⃣ Backend Deployment (If Not Using Emergent)

### Current Setup
Backend is running on Emergent platform:
```
https://fuel-app-sync.preview.emergentagent.com
```

### Alternative Options

#### Option A: Railway.app
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
cd /app/backend
railway init

# Deploy
railway up
```

#### Option B: Render.com
1. Connect GitHub repo
2. Select `/backend` folder
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

#### Option C: Heroku
```bash
# Install Heroku CLI
# cd /app/backend
heroku create mobilepetrolpump-api
heroku config:set MONGO_URL=<your-mongo-url>
git push heroku main
```

---

## 4️⃣ Database Options

### Current Setup
MongoDB running on Emergent platform.

### Alternative Options

#### Option A: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (512MB, sufficient for MVP)
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string
6. Update `MONGO_URL` in backend

#### Option B: Railway MongoDB
```bash
railway add mongodb
# Get MONGO_URL from Railway dashboard
```

#### Option C: Self-hosted
- Install MongoDB on VPS (DigitalOcean, Linode, AWS EC2)
- Configure security
- Use connection string in backend

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  USERS                                              │
│    │                                                │
│    ├──────► Web Browser                            │
│    │           │                                    │
│    │           └──► Vercel                         │
│    │                 (Frontend)                     │
│    │                   │                            │
│    │                   └──► Backend API            │
│    │                          │                     │
│    └──────► Android App       │                     │
│                 │              │                     │
│                 └──────────────┴──► MongoDB         │
│                                      (Database)     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Checklist

### Before Production Deployment

- [ ] Change all default secrets/keys
- [ ] Set proper CORS origins (no wildcards)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Implement proper error handling
- [ ] Don't expose internal errors to users
- [ ] Keep dependencies updated
- [ ] Add authentication for sensitive endpoints
- [ ] Backup database regularly
- [ ] Monitor logs for suspicious activity

### Environment Variables to Secure
```env
MONGO_URL=<production-mongodb-url>
DB_NAME=<production-db-name>
CORS_ORIGINS=https://mobilepetrolpump.vercel.app
JWT_SECRET=<generate-secure-random-string>
```

---

## 💰 Cost Estimates

### Free Tier (Suitable for MVP)
- **Vercel:** Free (hobby plan)
- **MongoDB Atlas:** Free (512MB)
- **Backend on Railway:** Free ($5 credit/month)
- **Android APK Distribution:** Free
- **Total:** $0/month

### With Play Store
- **Google Play Developer:** $25 one-time
- **Everything else:** Free
- **Total:** $25 one-time

### Production Scale (1000+ users)
- **Vercel Pro:** $20/month
- **MongoDB Atlas:** $9/month (2GB)
- **Railway Pro:** $5/month
- **Play Store:** $0 ongoing
- **Total:** ~$34/month

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Test all features locally
- [ ] Test on multiple devices
- [ ] Test with real data
- [ ] Check mobile responsiveness
- [ ] Verify Google OAuth works
- [ ] Test PDF generation
- [ ] Test backup/restore
- [ ] Check error handling

### Web Deployment
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Analytics setup (optional)
- [ ] Error tracking setup (optional)

### Android Deployment
- [ ] Update APP_URL in MainActivity
- [ ] Test on multiple Android versions
- [ ] Test on different screen sizes
- [ ] Verify permissions work
- [ ] Test PDF save to Downloads
- [ ] Test Google OAuth redirect
- [ ] Check app icon/splash screen
- [ ] Sign release APK
- [ ] Test release APK thoroughly

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Monitor performance
- [ ] Verify backups working
- [ ] Check analytics
- [ ] Plan updates/features

---

## 🆘 Support Resources

### Documentation
- `/app/GOOGLE_OAUTH_CONFIGURATION.md` - OAuth setup
- `/app/android/BEGINNER_APK_BUILD_GUIDE.md` - Android build guide
- `/app/android/PLAY_STORE_DEPLOYMENT_GUIDE.md` - Play Store guide

### Platform Docs
- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Google Play Console:** https://support.google.com/googleplay/android-developer

---

## 🎉 Quick Start Commands

### Build Frontend for Production
```bash
cd /app/frontend
yarn build
```

### Build Android Debug APK
```bash
cd /app/android
./gradlew assembleDebug
```

### Build Android Release APK
```bash
cd /app/android
./gradlew assembleRelease
```

### Run Backend Locally
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### Test Frontend Locally
```bash
cd /app/frontend
yarn install
yarn start
```

---

**Last Updated:** November 3, 2025  
**App Version:** 1.0.0  
**Status:** Ready for Production Deployment 🚀
