# ✅ CORRECTED: OAuth Client Setup

## 🔧 How Android OAuth Actually Works

You **DO NOT** need to add `com.mobilepetrolpump.app:/oauth2redirect` to your Web Client!

---

## 📱 Correct OAuth Setup

### **You Need TWO SEPARATE OAuth Clients:**

### **1. Web OAuth Client** (Already Have)
```
Type: Web application
Client ID: 411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com
```

**Authorized JavaScript origins:**
```
https://mobilepetrolpump.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://mobilepetrolpump.vercel.app/
http://localhost:3000/
```

**Used by:** Web browser version of your app

---

### **2. Android OAuth Client** (Need to Create)
```
Type: Android
Package name: com.mobilepetrolpump.app
SHA-1: 56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26
```

**Android OAuth clients DON'T have redirect URI fields!**

The redirect is handled automatically by:
- Package name verification
- SHA-1 certificate matching
- AndroidManifest.xml deep link configuration (already done)

**Used by:** Android app version

---

## 🚀 Step-by-Step: Create Android OAuth Client

### **Step 1: Go to Google Cloud Console**
https://console.cloud.google.com/apis/credentials

### **Step 2: Click "+ CREATE CREDENTIALS"**
Select **"OAuth client ID"**

### **Step 3: Select Application Type**
Choose **"Android"** (NOT "Web application")

### **Step 4: Fill in the Form**

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

**Notice:** There's NO "Redirect URI" field for Android clients!

### **Step 5: Click CREATE**

You'll see your new Android Client ID:
```
123456789-abc123def456.apps.googleusercontent.com
```

**COPY THIS!**

---

## 📝 Update Your Android App

### **File to Edit:**
`/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

### **Line 52 - Update:**

```java
// Replace this:
private static final String ANDROID_CLIENT_ID = "REPLACE_WITH_YOUR_ANDROID_CLIENT_ID";

// With your actual Android Client ID:
private static final String ANDROID_CLIENT_ID = "YOUR_ANDROID_CLIENT_ID_HERE";
```

**Example:**
```java
private static final String ANDROID_CLIENT_ID = "123456789-abc123def456ghi789.apps.googleusercontent.com";
```

---

## 🔗 How the Redirect Works (Technical Explanation)

### **For Android Apps:**

1. **App initiates OAuth:**
   - Opens browser with Android Client ID
   - URL: `https://accounts.google.com/o/oauth2/auth?client_id=ANDROID_CLIENT_ID...`

2. **User signs in:**
   - Browser shows Google login
   - User grants permissions

3. **Google redirects:**
   - Google redirects to: `com.mobilepetrolpump.app:/oauth2redirect?code=...`
   - This is an Android deep link (not HTTP/HTTPS)

4. **Android catches deep link:**
   - AndroidManifest.xml has intent-filter (already configured)
   - Android OS redirects to your app
   - App receives the OAuth code

5. **No redirect URI needed:**
   - Google automatically allows `PACKAGE_NAME:/oauth2redirect`
   - SHA-1 verification ensures it's your app
   - No manual redirect URI configuration needed

### **For Web Apps:**

- Uses HTTP/HTTPS redirect URIs
- Configured in Web OAuth Client
- Completely separate from Android

---

## ✅ Your Complete OAuth Configuration

### **Two Clients, Two Purposes:**

```
┌─────────────────────────────────────────────────────┐
│ WEB OAUTH CLIENT                                    │
│ ID: 411840168577-hqpoggit...                       │
│                                                     │
│ For: Browser (mobilepetrolpump.vercel.app)        │
│ Redirect: https://mobilepetrolpump.vercel.app/    │
│ Used by: React web app in browser                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ANDROID OAUTH CLIENT                                │
│ ID: [Your new Android Client ID]                   │
│                                                     │
│ For: Android app (com.mobilepetrolpump.app)       │
│ Package: com.mobilepetrolpump.app                  │
│ SHA-1: 56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:... │
│ Used by: Android APK                               │
│ Redirect: Automatic (no manual config needed)     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 AndroidManifest.xml (Already Configured)

Your app already has the deep link configuration:

**File:** `/app/android/app/src/main/AndroidManifest.xml`

**Lines 38-45:**
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

**This tells Android:**
- "My app can handle URLs like `com.mobilepetrolpump.app:/oauth2redirect`"
- "When Google redirects to this URL, open MY app"

---

## ❌ Common Mistakes to Avoid

### **WRONG ❌**
- ~~Adding Android redirect URI to Web Client~~
- ~~Using same Client ID for web and Android~~
- ~~Trying to add custom redirect URI for Android~~

### **CORRECT ✅**
- Create separate Android OAuth Client
- Use package name + SHA-1 only
- Let Google handle redirect automatically
- Update MainActivity.java with Android Client ID

---

## 🧪 Testing Your Setup

### **After creating Android OAuth Client and updating code:**

1. **Rebuild APK:**
   ```bash
   cd /app/android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. **Install on device:**
   - Copy APK to phone
   - Install it

3. **Test OAuth flow:**
   - Open app
   - Settings → Backup
   - Tap "Connect Google Drive"
   
4. **What should happen:**
   - ✅ External browser opens (Chrome, Firefox, etc.)
   - ✅ Google login page appears
   - ✅ Sign in with your Google account
   - ✅ Grant permissions screen
   - ✅ Browser automatically goes back to app
   - ✅ App shows "Google Drive connected"

5. **If it works:**
   - ✅ Tap "Backup to Google Drive"
   - ✅ Check Google Drive for backup file
   - ✅ Tap "Restore from Google Drive"
   - ✅ Verify data restores

---

## 🚨 Troubleshooting

### **"Invalid client" error**
**Cause:** Client ID doesn't match or SHA-1 is wrong

**Fix:**
1. Verify Android Client ID is correct in MainActivity.java
2. Verify SHA-1 matches: `56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26`
3. Wait 5-10 minutes for Google to propagate changes

### **Browser doesn't redirect back to app**
**Cause:** Deep link not working

**Fix:**
1. Verify AndroidManifest.xml has intent-filter (should already be there)
2. Uninstall old APK completely
3. Install new APK
4. Try again

### **"App not verified" warning**
**Cause:** OAuth consent screen not published

**Fix:**
**Option 1 - Add test user:**
1. Google Cloud Console → OAuth consent screen
2. Scroll to "Test users"
3. Click "+ ADD USERS"
4. Add your Gmail address
5. Save

**Option 2 - Publish app:**
1. OAuth consent screen → Click "PUBLISH APP"
2. (Takes 2-7 days for verification)

---

## 📋 Quick Checklist

Setup checklist:

- [ ] Have SHA-1: `56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26`
- [ ] Go to Google Cloud Console
- [ ] Click "+ CREATE CREDENTIALS" → "OAuth client ID"
- [ ] Select "Android" (NOT Web)
- [ ] Enter package: `com.mobilepetrolpump.app`
- [ ] Enter SHA-1 fingerprint
- [ ] Click CREATE
- [ ] Copy Android Client ID
- [ ] Update MainActivity.java line 52
- [ ] **DO NOT touch Web Client**
- [ ] Rebuild APK
- [ ] Install on device
- [ ] Test OAuth flow
- [ ] Add as test user (if needed)

---

## 💡 Key Takeaways

1. **Two separate OAuth clients** - Web and Android
2. **Android clients don't use HTTP redirect URIs**
3. **Package name + SHA-1 = authentication**
4. **Deep link handled by AndroidManifest.xml**
5. **No manual redirect URI configuration needed**
6. **Keep Web Client unchanged**

---

## ✅ Summary

**What you asked about:**
- Adding Android redirect URI to Web Client

**Why it failed:**
- Web Clients only accept HTTP/HTTPS schemes
- Android deep links use custom schemes (like `com.mobilepetrolpump.app:`)

**Correct approach:**
- Create separate Android OAuth Client (no redirect URI field)
- Google handles redirect automatically using package name + SHA-1
- Deep link configured in AndroidManifest.xml (already done)

**What you need to do:**
1. Create Android OAuth Client with your SHA-1
2. Update MainActivity.java with Android Client ID
3. Rebuild and test
4. **Don't modify Web Client at all**

---

**Package:** com.mobilepetrolpump.app  
**SHA-1:** 56:41:17:73:EB:B8:56:51:E6:93:1C:59:BC:3C:CD:FF:DB:32:48:26  
**Last Updated:** November 3, 2025
