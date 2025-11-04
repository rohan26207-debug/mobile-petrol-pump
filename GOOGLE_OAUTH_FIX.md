# Google OAuth Configuration Fix

## Problem
Error: "Access blocked: Authorization Error - Custom scheme URLs are not allowed for web client type"

## Root Cause
The app was trying to use a custom scheme redirect URI (`com.mobilepetrolpump.app:/oauth2redirect`), but the OAuth client in Google Cloud Console is configured as a **Web application** type, which only allows `http://` or `https://` URLs.

## Solution Applied

### 1. Code Fix ✅
Updated `/app/frontend/src/services/googleDriveService.js` to use `http://localhost` as the redirect URI instead of the custom scheme.

**Changed line 167:**
```javascript
// OLD - Custom scheme (not allowed for Web clients)
const redirectUri = 'com.mobilepetrolpump.app:/oauth2redirect';

// NEW - Localhost (allowed for Web clients)
const redirectUri = 'http://localhost';
```

### 2. Google Cloud Console Configuration Required

You need to add `http://localhost` as an authorized redirect URI in your Google Cloud Console:

#### Step-by-Step Instructions:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Sign in with: rohan.26207@gmail.com

2. **Select Your OAuth Client ID**
   - Find your client ID: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla`
   - Click on it to edit

3. **Add Authorized Redirect URI**
   - Scroll to "Authorized redirect URIs"
   - Click "ADD URI"
   - Add: `http://localhost`
   - Click "ADD URI" again
   - Add: `http://127.0.0.1`
   - Click "SAVE" at the bottom

#### Current Configuration Should Include:

**Authorized JavaScript origins:**
- `https://fuel-app-sync.preview.emergentagent.com` (if using web)

**Authorized redirect URIs:**
- `http://localhost` ✅ **ADD THIS**
- `http://127.0.0.1` ✅ **ADD THIS**
- `https://fuel-app-sync.preview.emergentagent.com` (if needed for web)

### 3. Rebuild and Update Android App

After updating Google Cloud Console:

```bash
# Rebuild frontend
cd /app/frontend
yarn build

# Update Android assets
rm -rf /app/android/app/src/main/assets/*
cp -r /app/frontend/build/* /app/android/app/src/main/assets/

# Build APK in Android Studio
```

## How It Works Now

1. User clicks "Export to Google Drive" in the app
2. App detects Android WebView environment
3. Opens external browser (Chrome) with OAuth URL
4. User authorizes the app
5. Google redirects to `http://localhost` with access token in URL fragment
6. MainActivity.java intercepts the localhost URL
7. Extracts access token from URL
8. Passes token back to JavaScript
9. App completes the backup to Google Drive

## Testing

After updating Google Cloud Console and rebuilding:

1. Open the app on Android
2. Go to Settings → Online tab
3. Click "Export to Google Drive"
4. Should open Chrome/browser
5. Sign in with your Google account
6. Grant permissions
7. Should redirect back to app automatically
8. Backup should complete successfully

## Alternative Solution (If Above Doesn't Work)

If you prefer to use a custom scheme, you'll need to create a separate **Android** OAuth client:

1. In Google Cloud Console → Credentials
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Android" as application type
4. Add your app's package name: `com.mobilepetrolpump.app`
5. Add SHA-1 certificate fingerprint (from your APK)
6. Use the new Android Client ID in your app

However, using the localhost redirect with Web client is simpler and works immediately.

## Current Status

✅ Code updated to use `http://localhost`  
⏳ **ACTION REQUIRED:** Update Google Cloud Console redirect URIs  
⏳ Rebuild frontend and Android app  
⏳ Test OAuth flow

---

**Next Steps:**
1. Update Google Cloud Console (5 minutes)
2. Rebuild frontend and Android app
3. Test Google Drive backup

Once you've updated the redirect URIs in Google Cloud Console, let me know and I'll rebuild the frontend and update the Android assets!
