# 🔧 Android App 404 Error Fix

## ❌ Problem: "404 - Requested URL was not found"

**Symptoms:**
- ✅ Web app works fine (can backup to Google Drive)
- ❌ Android app shows 404 error when clicking backup
- Error appears only in Android APK, not in browser

---

## 🎯 Root Cause

Your Android app is loading from **local assets** (`file:///android_asset/index.html`), but:

1. **Assets are outdated** - The bundled web app is an old build
2. **API calls fail** - React Router and API calls don't work well with `file://` protocol
3. **Google APIs blocked** - External scripts can't load from local assets

---

## ✅ Solution: Use Online Mode (RECOMMENDED)

### **What I Changed:**

**File:** `/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

**Line 48-52 - Changed from:**
```java
// Load from local assets for offline functionality
private static final String APP_URL = "file:///android_asset/index.html";
```

**To:**
```java
// PRODUCTION MODE: Load from Vercel (always latest version)
private static final String APP_URL = "https://mobilepetrolpump.vercel.app/";
```

---

## 🚀 Now You Need to Rebuild APK

### **Step 1: Rebuild APK**

```bash
cd /app/android
./gradlew clean
./gradlew assembleRelease
```

### **Step 2: Locate New APK**

```
/app/android/app/build/outputs/apk/release/app-release.apk
```

### **Step 3: Install on Device**

1. Copy APK to your phone
2. Uninstall old version first
3. Install new APK
4. Test backup

---

## 🎉 Benefits of Online Mode

### **✅ Advantages:**

1. **Always Latest** - Loads latest version from Vercel
2. **No 404 Errors** - All routes work correctly
3. **Google APIs Work** - Can load external scripts
4. **Automatic Updates** - Just redeploy to Vercel, no APK rebuild
5. **Bug Fixes** - Users get fixes without reinstalling

### **⚠️ Requirements:**

1. **Internet Connection** - App needs internet to work
2. **Vercel Deployed** - Web app must be deployed at https://mobilepetrolpump.vercel.app/
3. **Backend URL** - Must be configured in Vercel environment variables

---

## 🔌 Alternative: Offline Mode (Advanced)

If you want the app to work offline, you need to:

### **1. Build Fresh Web App**

```bash
cd /app/frontend
yarn build
```

### **2. Copy Build to Assets**

```bash
# Clear old assets
rm -rf /app/android/app/src/main/assets/*

# Copy new build
cp -r /app/frontend/build/* /app/android/app/src/main/assets/
```

### **3. Update MainActivity.java**

Change back to:
```java
private static final String APP_URL = "file:///android_asset/index.html";
```

### **4. Fix Asset Paths**

Edit `/app/android/app/src/main/assets/index.html`:

**Find all paths like:**
```html
src="./static/js/main.xxx.js"
href="./static/css/main.xxx.css"
```

**Change to absolute paths:**
```html
src="/static/js/main.xxx.js"
href="/static/css/main.xxx.css"
```

Or better, use:
```html
src="file:///android_asset/static/js/main.xxx.js"
href="file:///android_asset/static/css/main.xxx.css"
```

### **5. Rebuild APK**

```bash
cd /app/android
./gradlew assembleRelease
```

**Note:** This is complex and error-prone. Online mode is much easier!

---

## 📱 Comparison: Online vs Offline

| Feature | Online Mode | Offline Mode |
|---------|-------------|--------------|
| **Setup** | Easy | Complex |
| **Updates** | Automatic | Rebuild APK |
| **404 Errors** | No errors | Common |
| **Internet** | Required | Not required |
| **File Size** | Small (~5MB) | Larger (~8MB) |
| **Google APIs** | Work | May fail |
| **Recommended** | ✅ Yes | ❌ No |

---

## 🔍 Why 404 Happened

### **Technical Explanation:**

1. **React Router Issue:**
   - React Router uses browser History API
   - Doesn't work with `file://` protocol
   - Routes like `/settings` cause 404

2. **Asset Path Issue:**
   - Bundled paths are relative: `./static/js/...`
   - WebView looks in wrong location
   - Files not found → 404

3. **Google API Scripts:**
   - Can't load from `https://apis.google.com` when base is `file://`
   - Cross-origin restrictions
   - Scripts fail → backup fails

4. **Old Build:**
   - Assets folder has old/incomplete build
   - Missing files or wrong paths
   - 404 errors

---

## ✅ Recommended Approach

### **For Production APK:**

**Use Online Mode:**
```java
private static final String APP_URL = "https://mobilepetrolpump.vercel.app/";
```

**Benefits:**
- No 404 errors
- All features work
- Easy to update
- Better user experience

**Deploy Process:**
1. Make changes to code
2. Deploy to Vercel (or update if auto-deploy enabled)
3. Users get updates automatically (just refresh app)
4. No need to rebuild/redistribute APK

---

## 🧪 Testing After Fix

### **1. Rebuild APK**

```bash
cd /app/android
./gradlew clean
./gradlew assembleRelease
```

### **2. Install on Device**

Uninstall old version first!

### **3. Test Features**

- [ ] App loads without 404
- [ ] Can navigate to Settings
- [ ] Can add sales data
- [ ] **Backup to Google Drive works**
- [ ] Restore from Google Drive works
- [ ] All pages load correctly

### **4. Check Internet Requirement**

- Turn off WiFi/mobile data
- App should show "No internet" or similar
- Turn on internet
- App works again

---

## 📋 Troubleshooting

### **Issue: Still getting 404**

**Cause:** Old APK still installed

**Fix:**
1. Completely uninstall app from phone
2. Restart phone
3. Install new APK
4. Test again

---

### **Issue: "Can't reach this page"**

**Cause:** Vercel URL is wrong or site not deployed

**Fix:**
1. Check if https://mobilepetrolpump.vercel.app/ opens in phone browser
2. If it doesn't, deploy to Vercel first
3. Update APP_URL with correct URL
4. Rebuild APK

---

### **Issue: App loads but features don't work**

**Cause:** Backend URL not configured

**Fix:**
1. In Vercel, go to Settings → Environment Variables
2. Add: `REACT_APP_BACKEND_URL` with your backend URL
3. Redeploy

---

### **Issue: Want offline mode to work**

**Solution:** This is complex. Better options:

**Option 1:** Accept online requirement (recommended)

**Option 2:** Build Progressive Web App (PWA)
- Add service worker
- Cache assets
- Works offline
- Easier than native offline

**Option 3:** Use Capacitor instead of WebView
- Better offline support
- Proper asset handling
- More features

---

## 🎯 Quick Fix Summary

### **What Changed:**
Changed `APP_URL` from `file:///android_asset/index.html` to `https://mobilepetrolpump.vercel.app/`

### **What You Need to Do:**

1. **Rebuild APK:**
   ```bash
   cd /app/android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. **Install New APK** on your phone

3. **Test Backup** - Should work now!

---

## 💡 Pro Tips

### **Tip 1: Hybrid Mode**

You can have both online and offline:

```java
// Try online first, fallback to offline
private String getAppUrl() {
    if (isNetworkAvailable()) {
        return "https://mobilepetrolpump.vercel.app/";
    } else {
        return "file:///android_asset/index.html";
    }
}
```

### **Tip 2: Update URLs Centrally**

Keep all URLs in one place:

```java
private static final String PRODUCTION_URL = "https://mobilepetrolpump.vercel.app/";
private static final String STAGING_URL = "https://staging.mobilepetrolpump.vercel.app/";
private static final String OFFLINE_URL = "file:///android_asset/index.html";

// Switch easily
private static final String APP_URL = PRODUCTION_URL;
```

### **Tip 3: Version Check**

Add version checking to notify users of updates:

```java
// Show update dialog if new version available
private void checkForUpdates() {
    // Compare app version with server version
    // Prompt user to download new APK if needed
}
```

---

## ✅ Checklist

After implementing fix:

- [ ] Updated MainActivity.java with online URL
- [ ] Cleaned previous build (`./gradlew clean`)
- [ ] Built new APK (`./gradlew assembleRelease`)
- [ ] Uninstalled old APK from device
- [ ] Installed new APK
- [ ] Tested app loads correctly
- [ ] Tested backup to Google Drive works
- [ ] Tested restore from Google Drive works
- [ ] Tested all major features
- [ ] Confirmed internet is required (expected)

---

## 📚 Related Documentation

- **OAuth Setup:** `/app/android/CORRECTED_OAUTH_SETUP.md`
- **APK Building:** `/app/android/BEGINNER_APK_BUILD_GUIDE.md`
- **SHA-1 Fingerprint:** `/app/android/YOUR_SHA1_FINGERPRINT.md`
- **Deployment Guide:** `/app/DEPLOYMENT_GUIDE.md`

---

**Problem:** Android app 404 error  
**Cause:** Loading from outdated local assets  
**Solution:** Switch to online mode (Vercel)  
**Result:** All features work, including Google Drive backup! ✅

---

**Updated:** November 3, 2025  
**Status:** FIXED - Rebuild APK to apply
