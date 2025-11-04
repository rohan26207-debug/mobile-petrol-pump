# Android OAuth 2.0 Client ID Setup Guide
## Google Drive Export/Import Configuration

---

## 🎯 Overview

For the Android app to use Google Drive backup/restore, you need to create a **separate OAuth 2.0 Client ID** specifically for Android (in addition to the web client ID).

**Important:** Android requires a different type of OAuth client than the web application!

---

## 📋 Prerequisites

Before starting, you need:
- ✅ Google Cloud Project (same one as your web app)
- ✅ Google Drive API enabled in the project
- ✅ Android app package name: `com.mobilepetrolpump.app`
- ✅ SHA-1 certificate fingerprint (we'll generate this)

---

## 🔐 Part 1: Generate SHA-1 Certificate Fingerprint

### **Option A: For Debug APK (Development/Testing)**

#### **Windows:**

1. **Open Command Prompt**
   - Press `Win + R`
   - Type `cmd` and press Enter

2. **Navigate to Java keytool location:**
   ```cmd
   cd C:\Program Files\Java\jdk-XX\bin
   ```
   *(Replace XX with your Java version, e.g., jdk-11, jdk-17)*

3. **Run keytool command:**
   ```cmd
   keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```

4. **Copy the SHA-1 fingerprint**
   - Look for line: `SHA1: XX:XX:XX:XX:...`
   - Copy the entire SHA-1 value
   - Example: `A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0`

#### **Mac/Linux:**

1. **Open Terminal**

2. **Run keytool command:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

3. **Copy the SHA-1 fingerprint**

---

### **Option B: For Release APK (Production)**

**You'll need this when publishing to Play Store!**

1. **Locate your release keystore file**
   - The keystore you created when building release APK
   - Example: `my-release-key.keystore`

2. **Run keytool command:**
   ```bash
   keytool -list -v -keystore path/to/your-keystore.keystore -alias your-alias-name
   ```

3. **Enter keystore password** when prompted

4. **Copy the SHA-1 fingerprint**

---

## 🔧 Part 2: Create Android OAuth 2.0 Client ID

### **Step 1: Open Google Cloud Console**

1. Go to: https://console.cloud.google.com/

2. **Select your project** (same project as web app)
   - Click project dropdown at top
   - Select: "Mobile Petrol Pump" (or your project name)

---

### **Step 2: Navigate to Credentials**

1. **Left sidebar** → Click **"APIs & Services"**

2. Click **"Credentials"**

3. You should see your existing credentials:
   - Web client (411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com)

---

### **Step 3: Create Android OAuth Client**

1. **Click "+ CREATE CREDENTIALS"** (top of page)

2. Select **"OAuth client ID"**

3. **Application type:**
   - Select **"Android"** from dropdown
   - (NOT "Web application" - that's different!)

4. **Fill in details:**

   **a) Name:**
   ```
   Mobile Petrol Pump - Android
   ```

   **b) Package name:**
   ```
   com.mobilepetrolpump.app
   ```
   ⚠️ **CRITICAL:** Must match exactly with your Android app package!

   **c) SHA-1 certificate fingerprint:**
   - Paste the SHA-1 you copied earlier
   - Example: `A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0`

5. **Click "CREATE"**

---

### **Step 4: Get Your Android Client ID**

1. **Success dialog appears** showing:
   ```
   Your client ID
   XXXXXX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
   ```

2. **Copy this Client ID** - you'll need it!

3. **Note:** Android client IDs look similar to web client IDs but are different

---

## 📱 Part 3: Configure Android App

Now we need to update the Android app with this Client ID.

### **Method 1: Update in Code (Recommended)**

**File:** `/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

**Currently not implemented - needs to be added!**

The Android app currently loads the web app which uses the web client ID. For proper Android Google Drive integration, we need to:

1. **Pass the Android Client ID to JavaScript**

Add this code after line 64 in `MainActivity.java`:

```java
// After webView.loadUrl(APP_URL);

// Inject Android OAuth Client ID for Google Drive
webView.evaluateJavascript(
    "window.ANDROID_OAUTH_CLIENT_ID = '" + ANDROID_CLIENT_ID + "';",
    null
);
```

2. **Define the Client ID** (add after line 48):

```java
private static final String APP_URL = "file:///android_asset/index.html";
// Add this line:
private static final String ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID_HERE";
private static final int SELECT_JSON_FILE_REQUEST = 102;
```

**Replace `YOUR_ANDROID_CLIENT_ID_HERE` with your actual Android Client ID!**

---

### **Method 2: Update in Web Code**

**File:** `/app/frontend/src/services/googleDriveService.js`

Update the `GOOGLE_CLIENT_ID` to detect Android and use the appropriate ID:

```javascript
// Google Drive Backup Service
const WEB_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID_HERE'; // Add your Android Client ID

// Detect platform and use appropriate Client ID
const GOOGLE_CLIENT_ID = (() => {
  // Check if running in Android WebView
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isWebView = ua.includes('wv') || ua.includes('mpumpcalc') || typeof window.MPumpCalcAndroid !== 'undefined';
  
  if (isAndroid && isWebView) {
    // Use Android Client ID if available from native injection
    return window.ANDROID_OAUTH_CLIENT_ID || ANDROID_CLIENT_ID;
  }
  
  // Use Web Client ID for browser
  return WEB_CLIENT_ID;
})();

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
```

---

## 🔗 Part 4: Verify Redirect URI Configuration

The Android app already has the correct redirect URI configured in `AndroidManifest.xml`:

**File:** `/app/android/app/src/main/AndroidManifest.xml` (lines 38-45)

```xml
<!-- Deep link for OAuth redirect -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="com.mobilepetrolpump.app"
        android:host="oauth2redirect" />
</intent-filter>
```

This creates the redirect URI: `com.mobilepetrolpump.app:/oauth2redirect`

---

## ☁️ Part 5: Update Google Cloud Console Redirect URIs

1. **Go back to Google Cloud Console → Credentials**

2. **Click on your WEB Client ID** (not Android)
   - The one with ID: `411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com`

3. **Add Authorized redirect URIs:**
   - Scroll to "Authorized redirect URIs"
   - Click "+ ADD URI"
   - Add: `com.mobilepetrolpump.app:/oauth2redirect`
   - Click "SAVE"

**⚠️ Important:** This allows the Android app to receive OAuth callbacks.

---

## 🧪 Part 6: Testing the Setup

### **Test on Debug APK:**

1. **Build and install debug APK** with updated Client ID

2. **Open the app**

3. **Go to Settings → Backup**

4. **Tap "Connect Google Drive"**

5. **What should happen:**
   - External browser opens (Chrome, Firefox, etc.)
   - Google login page appears
   - Sign in with your Google account
   - Grant permissions
   - Browser should redirect back to app
   - App shows: "Google Drive connected" ✅

6. **Test Backup:**
   - Tap "☁️ Backup to Google Drive"
   - Should show success message
   - Check your Google Drive - backup file should appear

7. **Test Restore:**
   - Tap "⬇️ Restore from Google Drive"
   - Should list your backup files
   - Select one and restore

---

## 🚨 Troubleshooting

### **Issue: "Sign-in failed" or "Invalid client"**

**Cause:** Client ID doesn't match or SHA-1 fingerprint is wrong

**Solution:**
1. Verify package name is exactly: `com.mobilepetrolpump.app`
2. Re-generate SHA-1 fingerprint
3. Update in Google Cloud Console
4. Wait 5-10 minutes for changes to propagate
5. Try again

---

### **Issue: "redirect_uri_mismatch"**

**Cause:** Redirect URI not configured

**Solution:**
1. Add `com.mobilepetrolpump.app:/oauth2redirect` to:
   - Web Client ID's authorized redirect URIs
2. Save and wait a few minutes
3. Try again

---

### **Issue: Browser doesn't redirect back to app**

**Cause:** Intent filter not working or redirect URI mismatch

**Solution:**
1. Check `AndroidManifest.xml` has the intent-filter (see Part 4)
2. Rebuild APK
3. Uninstall old APK completely
4. Install new APK
5. Try again

---

### **Issue: "App not verified" warning**

**Cause:** OAuth consent screen not published

**Solution:**
**Option 1:** Add yourself as a test user
1. Google Cloud Console → OAuth consent screen
2. Scroll to "Test users"
3. Click "+ ADD USERS"
4. Add your Google account email
5. Save

**Option 2:** Publish the app (for production)
1. Google Cloud Console → OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification (takes 2-7 days)

---

### **Issue: Works on one device but not another**

**Cause:** Different devices may have different SHA-1 fingerprints

**Solution:**
1. Generate SHA-1 for each device's debug keystore
2. Add all SHA-1 fingerprints to the same Android OAuth Client
3. Or use release keystore (same SHA-1 for all devices)

---

## 📊 Summary of Required Client IDs

Your project needs **TWO OAuth 2.0 Client IDs:**

### **1. Web Client ID** ✅ (Already configured)
```
Application type: Web application
Client ID: 411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
Used for: Web browser version of the app
Authorized JavaScript origins:
  - https://mobilepetrolpump.vercel.app
  - http://localhost:3000
Authorized redirect URIs:
  - https://mobilepetrolpump.vercel.app/
  - http://localhost:3000/
  - com.mobilepetrolpump.app:/oauth2redirect (for Android)
```

### **2. Android Client ID** 📱 (Need to create)
```
Application type: Android
Client ID: [Your new Android Client ID]
Package name: com.mobilepetrolpump.app
SHA-1 fingerprint: [Your SHA-1 from debug/release keystore]
Used for: Android app version
```

---

## 🔄 For Multiple Build Variants

### **Debug Build:**
- Create OAuth client with debug keystore SHA-1
- For testing and development

### **Release Build:**
- Create separate OAuth client with release keystore SHA-1
- For production (Play Store)

**OR** (Recommended):

Add **both SHA-1 fingerprints** to the **same Android OAuth Client**:
1. Google Cloud Console → Credentials
2. Click your Android OAuth Client
3. Click "ADD FINGERPRINT"
4. Add release SHA-1
5. Now both debug and release builds work!

---

## 📝 Quick Setup Checklist

- [ ] Generate SHA-1 certificate fingerprint
- [ ] Create Android OAuth 2.0 Client ID in Google Cloud
- [ ] Copy Android Client ID
- [ ] Update `MainActivity.java` with Client ID
- [ ] Update `googleDriveService.js` with Android detection
- [ ] Add Android redirect URI to Web Client
- [ ] Build new APK with changes
- [ ] Test Google Drive connection
- [ ] Test backup to Drive
- [ ] Test restore from Drive
- [ ] Add as test user (if app not published)
- [ ] Document Client IDs for future reference

---

## 🎯 Complete Configuration Example

### **Your OAuth Setup Should Look Like:**

```
Project: Mobile Petrol Pump

OAuth 2.0 Credentials:
┌─────────────────────────────────────────────────┐
│ Web client (for web app)                       │
│ ID: 411840168577-hqpoggit...googleusercontent   │
│ Origins: mobilepetrolpump.vercel.app           │
│ Redirects: .../   + android redirect           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Android client (for Android app)               │
│ ID: XXXXXX-xxxxxxxx.apps.googleusercontent.com │
│ Package: com.mobilepetrolpump.app              │
│ SHA-1: A1:B2:C3:D4:...                         │
└─────────────────────────────────────────────────┘

OAuth consent screen: Published / Test users added
Google Drive API: Enabled
Scopes: drive.file
```

---

## 🚀 Next Steps

After setup:
1. **Test thoroughly** on real Android device
2. **Document** your Client IDs safely
3. **Keep keystore file** secure (for release builds)
4. **Add test users** or publish OAuth consent screen
5. **Consider** using release keystore for all builds
6. **Update** documentation with your specific Client IDs

---

## 📚 Additional Resources

- **Google Cloud Console:** https://console.cloud.google.com/
- **OAuth 2.0 Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Android Deep Links:** https://developer.android.com/training/app-links
- **Google Drive API:** https://developers.google.com/drive/api/guides/about-sdk

---

## 💡 Pro Tips

1. **Keep Both Client IDs:** Don't delete web client when creating Android client!

2. **Use Same Project:** Both web and Android clients should be in the same Google Cloud project

3. **Test Users:** Add your email as test user while app is in development

4. **Release Keystore:** Use the same keystore for all release builds (never lose it!)

5. **Backup Keystore:** Keep release keystore file in multiple secure locations

6. **Document:** Save all Client IDs, SHA-1 fingerprints, and keystore passwords securely

7. **Multiple Devices:** Add multiple SHA-1 fingerprints to support testing on different devices

---

## ✅ Verification

**How to know it's working:**

✅ App opens browser for Google OAuth  
✅ Successfully signs in and grants permissions  
✅ Browser redirects back to app  
✅ App shows "Google Drive connected"  
✅ Backup to Drive succeeds  
✅ Can see backup file in Google Drive  
✅ Restore from Drive works  
✅ No error messages in Android logs  

---

**Last Updated:** November 3, 2025  
**For:** Mobile Petrol Pump Android App  
**Package:** com.mobilepetrolpump.app  
**Version:** 1.0.0
