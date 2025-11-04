# 🔑 YOUR APK SHA-1 FINGERPRINT

## ✅ Successfully Extracted from app-release.apk

---

## 📜 Certificate Information

**Certificate Owner:**
- Name: ROHAN KHANDVE
- Organization Unit: VISHNU PARVATI PETROLEUM
- Location: PUNE, MAHARASHTRA, INDIA

**Certificate Details:**
- Serial Number: 1
- Valid From: November 3, 2025
- Valid Until: October 28, 2050 (25 years validity)
- Self-Signed: Yes (Issuer = Subject)

---

## 🔑 Certificate Fingerprints

### **SHA-1 Fingerprint:**
```
56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26
```

### **SHA-256 Fingerprint:**
```
6F:1E:6C:10:B7:16:75:08:74:A4:3B:C9:C1:76:E0:AB:A3:38:F5:93:BE:40:DF:C0:E5:0C:E3:EA:E6:2E:78:C0
```

---

## 📱 For Google OAuth Setup

### **Use These Details:**

**Package Name:**
```
com.mobilepetrolpump.app
```

**SHA-1 Certificate Fingerprint:**
```
56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26
```

---

## 🚀 Next Steps: Create Android OAuth Client

### **Step 1: Go to Google Cloud Console**
https://console.cloud.google.com/apis/credentials

### **Step 2: Create OAuth Client**

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. Choose application type: **"Android"**

### **Step 3: Fill in Details**

**Name:**
```
Mobile Petrol Pump - Android
```

**Package name:**
```
com.mobilepetrolpump.app
```

**SHA-1 certificate fingerprint:**
```
56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26
```

### **Step 4: Create**

Click **"CREATE"** button

### **Step 5: Copy Your Android Client ID**

You'll see something like:
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**SAVE THIS!** You need it for the next step.

---

## 📝 Update Your Android App

### **File to Update:**
`/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

### **Line 52 - Replace with your Client ID:**

```java
// BEFORE:
private static final String ANDROID_CLIENT_ID = "REPLACE_WITH_YOUR_ANDROID_CLIENT_ID";

// AFTER (example):
private static final String ANDROID_CLIENT_ID = "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

**Replace with YOUR actual Android Client ID from Google Cloud Console!**

---

## 🔗 Add Redirect URI to Web Client

### **Important:** Also update your Web OAuth Client

1. Go to Google Cloud Console → Credentials
2. Click on your **Web Client ID** (411840168577-hqpoggit...)
3. Scroll to **"Authorized redirect URIs"**
4. Click **"+ ADD URI"**
5. Add:
   ```
   com.mobilepetrolpump.app:/oauth2redirect
   ```
6. Click **"SAVE"**

---

## 🔄 Rebuild and Test

### **After updating MainActivity.java:**

1. **Rebuild APK:**
   ```bash
   cd /app/android
   ./gradlew assembleRelease
   ```

2. **Install on device:**
   - Copy APK to phone
   - Install it
   - Open app

3. **Test Google Drive:**
   - Go to Settings → Backup
   - Tap "Connect Google Drive"
   - Browser should open
   - Sign in with Google
   - Browser redirects back to app
   - Should show "Google Drive connected" ✅

4. **Test Backup/Restore:**
   - Tap "Backup to Google Drive"
   - Check Google Drive for backup file
   - Tap "Restore from Google Drive"
   - Data should restore successfully

---

## ⚠️ Important Notes

### **This is a Release Keystore**

- The SHA-1 is from your **release keystore**
- This keystore is located somewhere on your computer
- **KEEP THIS KEYSTORE SAFE!**
- You'll need it for:
  - All future app updates
  - Play Store uploads
  - Re-signing APKs

### **Keystore Backup**

**Critical:** Make backups of your release keystore file:
- Google Drive
- USB drive
- Password manager
- Multiple secure locations

**If you lose this keystore:**
- ❌ Cannot update your app on Play Store
- ❌ Users cannot upgrade, only fresh install
- ❌ Lose all user data
- ❌ Need to create new app listing

### **Keystore Location**

Your keystore is likely at one of these locations:
- `/path/to/your/keystore.jks`
- `/path/to/your/keystore.keystore`
- Wherever you created it for signing

**Find it and back it up NOW!**

---

## 📊 OAuth Setup Summary

### **You Need TWO OAuth Clients:**

**1. Web Client (Already Have):**
```
Type: Web application
Client ID: 411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
For: Web browser version
Redirect URIs:
  - https://mobilepetrolpump.vercel.app/
  - http://localhost:3000/
  - com.mobilepetrolpump.app:/oauth2redirect ← ADD THIS
```

**2. Android Client (Need to Create):**
```
Type: Android
Package: com.mobilepetrolpump.app
SHA-1: 56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26
For: Android app version
```

---

## ✅ Checklist

Complete OAuth setup:

- [ ] Go to Google Cloud Console
- [ ] Create Android OAuth Client
- [ ] Use package name: `com.mobilepetrolpump.app`
- [ ] Use SHA-1: `56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26`
- [ ] Click CREATE
- [ ] Copy Android Client ID
- [ ] Update MainActivity.java line 52
- [ ] Add redirect URI to Web Client
- [ ] Rebuild APK
- [ ] Test on device
- [ ] Verify Google Drive connection works
- [ ] Test backup to Drive
- [ ] Test restore from Drive
- [ ] **BACKUP YOUR KEYSTORE FILE!**

---

## 📚 Related Documentation

- **Quick Setup:** `/app/android/QUICK_OAUTH_SETUP.md`
- **Complete Guide:** `/app/android/ANDROID_OAUTH_SETUP_GUIDE.md`
- **APK Analysis:** `/app/android/APK_SIGNATURE_ANALYSIS.md`
- **Import/Export:** `/app/android/ANDROID_IMPORT_EXPORT_GUIDE.md`

---

## 🎉 You're Almost Done!

With this SHA-1, you can now:
1. Create Android OAuth Client ✅
2. Enable Google Drive backup in Android app ✅
3. Distribute your APK to users ✅
4. Upload to Play Store (optional) ✅

---

**Package:** com.mobilepetrolpump.app  
**SHA-1:** 56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26  
**Extracted From:** app-release.apk  
**Date:** November 3, 2025  
**Certificate Owner:** ROHAN KHANDVE
