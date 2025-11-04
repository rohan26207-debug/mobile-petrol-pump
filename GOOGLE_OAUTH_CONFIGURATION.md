# Google OAuth Configuration Guide

## ✅ Configuration Complete

Your Google OAuth Client ID has been successfully configured for the Mobile Petrol Pump application.

---

## 📋 Configuration Details

### **Google OAuth Client ID**
```
411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
```

### **Production URL**
```
https://mobilepetrolpump.vercel.app/
```

### **Authorized Redirect URIs (in Google Cloud Console)**
Make sure these are configured in your Google Cloud Console:
- `https://mobilepetrolpump.vercel.app/`
- `https://mobilepetrolpump.vercel.app`
- `http://localhost:3000` (for local development)
- `com.mobilepetrolpump.app:/oauth2redirect` (for Android app)

### **Authorized JavaScript Origins**
- `https://mobilepetrolpump.vercel.app`
- `http://localhost:3000` (for local development)

---

## 🔧 What Was Updated

### 1. Frontend Environment Variables (`/app/frontend/.env`)
```env
REACT_APP_GOOGLE_CLIENT_ID=411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
```

### 2. Google Drive Service (`/app/frontend/src/services/googleDriveService.js`)
- Updated to use environment variable
- Falls back to your Client ID if env var not found
- Line 2 now reads: `const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com';`

---

## 🎯 For Vercel Deployment

When deploying to Vercel, make sure to add this environment variable:

### In Vercel Dashboard:
1. Go to your project: https://vercel.com/your-username/mobilepetrolpump
2. Navigate to: **Settings** → **Environment Variables**
3. Add:
   - **Key**: `REACT_APP_GOOGLE_CLIENT_ID`
   - **Value**: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com`
4. Click **Save**
5. Redeploy your application

---

## 📱 For Android App

The Android app is already configured to work with Google OAuth. However, you have two options:

### Option 1: Load from Vercel (Online Mode) - RECOMMENDED
Update `MainActivity.java` line 48:
```java
// Change from:
private static final String APP_URL = "file:///android_asset/index.html";

// To:
private static final String APP_URL = "https://mobilepetrolpump.vercel.app/";
```

**Advantages:**
- Always loads latest version from your Vercel deployment
- No need to rebuild APK when web app updates
- Automatic bug fixes and features

**Requirements:**
- Internet connection needed
- Slightly slower initial load

### Option 2: Offline Mode (Current Setup)
Keep the current configuration and bundle the web app in assets.

**To update bundled assets:**
1. Build frontend: `cd /app/frontend && yarn build`
2. Copy build files to: `/app/android/app/src/main/assets/`
3. Rebuild APK

**Advantages:**
- Works offline
- Faster app startup

**Disadvantages:**
- Need to rebuild APK for every web app update

---

## 🔐 Google Cloud Console Setup

Make sure your Google Cloud Console OAuth 2.0 Client ID has these settings:

### Application Type
- **Web application**

### Authorized JavaScript origins
```
https://mobilepetrolpump.vercel.app
http://localhost:3000
```

### Authorized redirect URIs
```
https://mobilepetrolpump.vercel.app/
https://mobilepetrolpump.vercel.app
http://localhost:3000/
com.mobilepetrolpump.app:/oauth2redirect
```

### OAuth consent screen
- Make sure app is published or add test users
- Required scopes: 
  - `.../auth/drive.file` (Google Drive API - Create, edit and delete files)

---

## ✅ Testing Google OAuth

### On Web (Local Development):
1. Open http://localhost:3000
2. Look for Google Drive backup/login feature
3. Click to authenticate
4. Should open Google OAuth popup
5. Grant permissions
6. Should be authenticated

### On Web (Vercel Production):
1. Open https://mobilepetrolpump.vercel.app/
2. Same testing steps as above

### On Android App:
1. Install APK on Android device
2. Open Google Drive backup feature
3. App will open external browser for authentication
4. Complete authentication in browser
5. Browser should redirect back to app
6. App should show "Google Drive connected"

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Add the redirect URI to your Google Cloud Console OAuth settings

### Error: "access_blocked" or "app not verified"
**Solution:** 
- Add yourself as a test user in OAuth consent screen
- Or submit app for verification (if going public)

### Android: OAuth doesn't redirect back to app
**Solution:**
- Verify `com.mobilepetrolpump.app:/oauth2redirect` is in authorized redirect URIs
- Check AndroidManifest.xml has the intent-filter (already configured)

### Token expires quickly
**Note:** This is normal. OAuth tokens expire. The app should automatically request a new token when needed.

---

## 📄 Related Files

- `/app/frontend/.env` - Environment variables
- `/app/frontend/src/services/googleDriveService.js` - Google Drive OAuth implementation
- `/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java` - Android OAuth handling
- `/app/android/app/src/main/AndroidManifest.xml` - Android deep link configuration

---

## 🎉 Summary

✅ Google OAuth Client ID configured  
✅ Environment variable added  
✅ Service updated to use env variable  
✅ Frontend restarted with new config  
✅ Ready for Vercel deployment  
✅ Android app compatible  

Your Google OAuth setup is complete! The application can now authenticate users and access Google Drive for backup functionality.

---

**Last Updated:** November 3, 2025  
**Client ID:** 411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com  
**Production URL:** https://mobilepetrolpump.vercel.app/
