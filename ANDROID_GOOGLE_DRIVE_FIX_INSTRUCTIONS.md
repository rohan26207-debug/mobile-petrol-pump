# Fix for Android App Google Drive Export Error

## Current Situation

✅ **Web App** - Google Drive export works perfectly  
❌ **Android App** - Getting error: "Access blocked: Authorization Error - Custom scheme URLs are not allowed for web client type"

## Why Android App Shows Error

Your current Android APK was built with the OLD code that uses a custom scheme redirect URI. The fix has been applied to the code, but you need to build a **NEW APK** with the updated code.

## What I've Done

✅ **Fixed the code** - Changed redirect URI from `com.mobilepetrolpump.app:/oauth2redirect` to `http://localhost`  
✅ **Rebuilt frontend** - New build created with the fix  
✅ **Updated Android assets** - Assets folder now contains the fixed code  

## What You Need to Do

### Step 1: Update Google Cloud Console (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Sign in with: rohan.26207@gmail.com
3. Find your OAuth client: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla`
4. Click on it to edit
5. Scroll to **"Authorized redirect URIs"**
6. Click **"ADD URI"** and add: `http://localhost`
7. Click **"ADD URI"** again and add: `http://127.0.0.1`
8. Click **"SAVE"** at the bottom

**Important:** Wait 5-10 minutes after saving for Google's changes to propagate.

### Step 2: Build New APK in Android Studio

1. **Open Android Studio**
2. **Open Project**: `/app/android/` folder
3. **Sync Gradle**: Click "Sync Now" if prompted (or File → Sync Project with Gradle Files)
4. **Build APK**: 
   - Go to: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete
5. **Locate APK**: 
   - Click "locate" in the notification, or
   - Find at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Install New APK on Your Device

1. **Transfer APK** to your Android device (via USB, email, or cloud)
2. **Uninstall old app** (important - to clear old settings)
3. **Install new APK**
4. **Allow installation from unknown sources** if prompted

### Step 4: Test Google Drive Export

1. Open the newly installed app
2. Go to **Settings** (gear icon) → **Online** tab
3. Click **"Export to Google Drive"**
4. Should open Chrome browser
5. Sign in with your Google account
6. Click **"Allow"** to grant permissions
7. Browser should redirect to `http://localhost` with a token
8. App should automatically detect and complete the backup

## What Changed in the Code

**Before (OLD APK):**
```javascript
const redirectUri = 'com.mobilepetrolpump.app:/oauth2redirect'; // ❌ Not allowed for Web client
```

**After (NEW - in updated assets):**
```javascript
const redirectUri = 'http://localhost'; // ✅ Allowed for Web client
```

## Technical Flow (How It Works Now)

```
1. User clicks "Export to Google Drive" in Android app
   ↓
2. App detects Android WebView environment
   ↓
3. Opens external browser (Chrome) with Google OAuth URL
   ↓
4. User signs in and authorizes
   ↓
5. Google redirects to: http://localhost#access_token=xxx...
   ↓
6. MainActivity.java intercepts the localhost URL
   ↓
7. Extracts access token from URL fragment
   ↓
8. Passes token back to JavaScript via handleGoogleOAuthCallback()
   ↓
9. App uses token to upload backup to Google Drive
   ↓
10. Success! ✅
```

## Verification Checklist

Before testing, make sure:
- [ ] Google Cloud Console has `http://localhost` in redirect URIs
- [ ] Waited 5-10 minutes after updating Google Console
- [ ] Built NEW APK in Android Studio with updated assets
- [ ] Uninstalled OLD app from device
- [ ] Installed NEW APK on device
- [ ] Testing with the NEW app

## Troubleshooting

### If Still Getting Same Error:
- **Check**: Are you testing with the NEW APK or old one?
- **Solution**: Make sure you uninstalled old app and installed fresh

### If Browser Doesn't Redirect Back:
- **Check**: Did you add `http://localhost` in Google Console?
- **Solution**: Double-check and wait 10 minutes

### If Different Error:
- Take a screenshot and share the exact error message

## Quick Commands Reference

```bash
# If you need to rebuild frontend assets again:
cd /app/frontend
yarn build

# Update Android assets:
rm -rf /app/android/app/src/main/assets/*
cp -r /app/frontend/build/* /app/android/app/src/main/assets/
```

---

## Summary

The fix is ready in the code. You just need to:
1. ✅ Update Google Cloud Console redirect URIs
2. ✅ Build new APK in Android Studio  
3. ✅ Install new APK on device
4. ✅ Test

**The current APK on your device has the OLD code - that's why it's still showing the error!**
