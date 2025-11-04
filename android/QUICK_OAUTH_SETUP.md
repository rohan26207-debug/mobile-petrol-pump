# Quick Start: Android OAuth Setup

## 🚀 3-Step Setup for Android Google Drive

### **Step 1: Generate SHA-1 Fingerprint**

**Windows:**
```cmd
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Copy the SHA-1 value** (looks like: `A1:B2:C3:D4:...`)

---

### **Step 2: Create Android OAuth Client**

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. Fill in:
   - **Type:** Android
   - **Name:** Mobile Petrol Pump - Android
   - **Package name:** `com.mobilepetrolpump.app`
   - **SHA-1:** Paste your SHA-1 from Step 1

4. Click **"CREATE"**

5. **Copy the Client ID** that appears

---

### **Step 3: Update Android App**

**File:** `/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

**Line 52:** Replace `REPLACE_WITH_YOUR_ANDROID_CLIENT_ID` with your actual Client ID:

```java
private static final String ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID_HERE";
```

**Example:**
```java
private static final String ANDROID_CLIENT_ID = "123456789-abc123def456.apps.googleusercontent.com";
```

---

### **Step 4: Add Redirect URI to Web Client**

1. Go back to: https://console.cloud.google.com/apis/credentials

2. **Click on your WEB Client ID** (411840168577-hqpoggit...)

3. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**

4. Add: `com.mobilepetrolpump.app:/oauth2redirect`

5. Click **"SAVE"**

---

### **Step 5: Rebuild APK**

```bash
cd /app/android
./gradlew assembleDebug
```

APK location: `/app/android/app/build/outputs/apk/debug/app-debug.apk`

---

### **Step 6: Test**

1. Install APK on Android device
2. Open app → Settings → Backup
3. Tap "Connect Google Drive"
4. Sign in with Google account
5. Should redirect back to app
6. Test backup and restore

---

## ⚠️ Important Notes

### **Two Client IDs Needed:**

✅ **Web Client ID** (already have):
- For: Web browser version
- ID: 411840168577-hqpoggit0nncfetfgtu4g465udsbuhla...

✅ **Android Client ID** (need to create):
- For: Android app version
- ID: Get from Google Cloud Console

### **Common Issues:**

❌ **"Invalid client"** → Wrong Client ID or SHA-1
✅ Fix: Regenerate SHA-1, update Google Cloud Console

❌ **"redirect_uri_mismatch"** → Redirect URI not added
✅ Fix: Add `com.mobilepetrolpump.app:/oauth2redirect` to Web Client

❌ **Browser doesn't come back** → Intent filter issue
✅ Fix: Check AndroidManifest.xml (already configured)

---

## 📚 Full Guide

For detailed instructions, troubleshooting, and explanations:

📄 **See:** `/app/android/ANDROID_OAUTH_SETUP_GUIDE.md`

---

## ✅ Checklist

- [ ] Generated SHA-1 fingerprint
- [ ] Created Android OAuth Client in Google Cloud
- [ ] Copied Android Client ID
- [ ] Updated MainActivity.java with Client ID
- [ ] Added redirect URI to Web Client
- [ ] Rebuilt APK with changes
- [ ] Tested on real Android device
- [ ] Google Drive connection works
- [ ] Backup to Drive works
- [ ] Restore from Drive works

---

**Package Name:** `com.mobilepetrolpump.app`  
**Redirect URI:** `com.mobilepetrolpump.app:/oauth2redirect`  
**Last Updated:** November 3, 2025
