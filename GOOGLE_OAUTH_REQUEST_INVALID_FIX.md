# Google OAuth "Request is Invalid" Error - SOLUTION

## Current Error
**From Android App:** "Access blocked - Mobile Petrol Pump request is invalid"

## Root Cause
The OAuth request needs a properly formatted redirect URI. Google requires:
- Either `http://localhost` with a specific port (e.g., `http://localhost:8080`)
- Or registered custom schemes for mobile apps

## What I've Fixed

### Updated Code
Changed redirect URI from `http://localhost` to `http://localhost:8080`

**File:** `/app/frontend/src/services/googleDriveService.js`
- Line 167: `const redirectUri = 'http://localhost:8080';`
- Added `prompt=consent` to force consent screen
- MainActivity.java already handles localhost with any port

### Rebuilt Assets
- ✅ Frontend rebuilt with new redirect URI
- ✅ Android assets updated
- ✅ Web app restarted

## CRITICAL: Update Google Cloud Console

You MUST update your Google Cloud Console with the new redirect URI:

### Step-by-Step Instructions

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/apis/credentials
   - Sign in with: rohan.26207@gmail.com

2. **Find Your OAuth Client**
   - Client ID: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla`
   - Click on it to open settings

3. **Update Authorized Redirect URIs**
   
   Under "Authorized redirect URIs" section, you should have these URIs:
   
   **ADD THESE (if not already added):**
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
   - `http://localhost`
   - `http://127.0.0.1`
   
   **Keep existing web URLs (if any):**
   - `https://fuel-app-sync.preview.emergentagent.com` (or your web domain)

4. **SAVE**
   - Click the blue "SAVE" button at the bottom
   - **IMPORTANT:** Wait 5-10 minutes for changes to propagate through Google's servers

5. **Verify Settings**
   - Make sure you see all 4-5 redirect URIs listed
   - Double-check there are no typos

## Rebuild Android APK

After updating Google Cloud Console and waiting 5-10 minutes:

1. **Open Android Studio**
2. **Open Project:** `/app/android/`
3. **Sync Gradle:** File → Sync Project with Gradle Files
4. **Build APK:**
   - Go to: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete (takes 2-5 minutes)
5. **Locate APK:**
   - Click "locate" in the notification, or
   - Navigate to: `android/app/build/outputs/apk/debug/app-debug.apk`

## Install & Test

1. **Transfer APK to Phone**
   - Via USB, email, cloud storage, or ADB

2. **UNINSTALL Old App**
   - Go to Settings → Apps → Mobile Petrol Pump
   - Uninstall completely
   - This clears old cached OAuth settings

3. **Install New APK**
   - Allow installation from unknown sources if prompted
   - Install the new APK

4. **Test Google Drive Export**
   - Open the app
   - Go to Settings (gear icon) → Online tab
   - Click "Export to Google Drive"
   - **Expected flow:**
     1. Chrome browser opens
     2. Google sign-in page appears
     3. Sign in with your account
     4. Grant permissions to Mobile Petrol Pump
     5. Browser redirects to `http://localhost:8080#access_token=...`
     6. App automatically detects and completes backup
     7. Success message appears

## Troubleshooting

### Still Getting "Request is Invalid"?

**Check 1: Did you wait 5-10 minutes after updating Google Console?**
- Google's servers need time to propagate changes
- Wait at least 10 minutes, then try again

**Check 2: Are you using the NEW APK?**
- Make sure you uninstalled the old app
- Install the fresh APK built after the fix
- Old APK will have old redirect URI and won't work

**Check 3: Correct Redirect URIs in Google Console?**
- Go back to https://console.cloud.google.com/apis/credentials
- Verify these URIs are listed:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`
  - `http://localhost`
  - `http://127.0.0.1`

**Check 4: Using Correct Client ID?**
- Client ID: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla`
- This should be a "Web application" type, not "Android" type

### Different Error Messages?

**"Access blocked: This app's request is invalid"**
- Redirect URI not registered → Add `http://localhost:8080` to Google Console

**"Redirect URI mismatch"**
- Typo in redirect URI → Double-check spelling in Google Console

**"App is not verified"**
- Normal for testing → Click "Advanced" → "Go to Mobile Petrol Pump (unsafe)"
- Or add your email to test users in Google Console

**Browser doesn't redirect back to app**
- MainActivity should intercept localhost URLs automatically
- Check if app is still in background (don't close it)

## Alternative Solution (If Above Doesn't Work)

If you continue to have issues, you can create a separate Android OAuth client:

1. **In Google Cloud Console → Credentials**
2. **Click "CREATE CREDENTIALS" → "OAuth client ID"**
3. **Select "Android" as application type**
4. **Enter details:**
   - Package name: `com.mobilepetrolpump.app`
   - SHA-1 certificate fingerprint: (from your APK - see YOUR_SHA1_FINGERPRINT.md)
5. **Use the new Android Client ID in your app**
6. **Use custom URI scheme:** `com.mobilepetrolpump.app:/oauth2redirect`

However, using localhost redirect with Web client is simpler and should work.

## Summary Checklist

- [ ] Updated Google Cloud Console redirect URIs
- [ ] Added `http://localhost:8080` and `http://127.0.0.1:8080`
- [ ] Also added `http://localhost` and `http://127.0.0.1`
- [ ] Clicked SAVE in Google Console
- [ ] Waited 10 minutes for propagation
- [ ] Built new APK in Android Studio
- [ ] Uninstalled old app from phone
- [ ] Installed new APK
- [ ] Tested Google Drive export

## Current Status

✅ Code fixed - using `http://localhost:8080` redirect URI  
✅ Frontend rebuilt with fix  
✅ Android assets updated  
✅ Web app restarted  

⏳ **NEXT: You need to:**
1. Update Google Cloud Console (add redirect URIs)
2. Wait 10 minutes
3. Build new APK
4. Test on phone

---

**After doing all steps, if it still doesn't work, share the exact error message and I'll help debug further!**
