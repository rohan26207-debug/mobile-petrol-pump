# APK Signature Analysis Report

## 🔍 Analysis Result

**APK File:** `app-debug.apk`  
**Status:** ❌ **UNSIGNED APK**

---

## 📊 What This Means

The APK you uploaded is **not signed** with any certificate. This means:

❌ **No SHA-1 fingerprint available** - The APK has no signing certificate  
❌ **Cannot be installed on real devices** - Android requires signed APKs  
❌ **Cannot use for OAuth setup** - Google needs SHA-1 from signed APK  
❌ **Not suitable for distribution** - Unsigned APKs are rejected  

---

## 🛠️ Why This Happened

**Possible Causes:**

1. **APK was built without signing**
   - Built with `assembleDebug` but signing not configured
   - Debug keystore not found during build
   - Gradle configuration issue

2. **Extracted/Modified APK**
   - APK was unzipped and re-zipped
   - Signature was removed

3. **Build tool issue**
   - Android SDK not properly configured
   - Build process incomplete

---

## ✅ Solution: Build a Properly Signed APK

### **Option 1: Using Android Studio (Recommended)**

1. **Open Android Studio**

2. **Open Project**
   - File → Open
   - Select `/app/android/` folder

3. **Build Signed APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete
   - Android Studio will automatically sign with debug keystore

4. **Locate APK**
   - Click "locate" in the notification
   - Or: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Verify It's Signed**
   - File size should be similar (around 8MB)
   - Will have `META-INF/CERT.RSA` or similar files inside

---

### **Option 2: Using Gradle Command Line**

**Prerequisites:**
- Android SDK installed
- Gradle installed
- Debug keystore exists at `~/.android/debug.keystore`

**Steps:**

1. **Navigate to project:**
   ```bash
   cd /app/android
   ```

2. **Clean previous builds:**
   ```bash
   ./gradlew clean
   ```

3. **Build debug APK:**
   ```bash
   ./gradlew assembleDebug
   ```

4. **Check build output:**
   ```bash
   ls -lh app/build/outputs/apk/debug/
   ```

5. **APK location:**
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

---

### **Option 3: Sign Existing APK Manually**

If you want to sign the current APK:

**Requirements:**
- Java JDK installed
- Android SDK build-tools

**Steps:**

1. **Create debug keystore (if not exists):**
   ```bash
   keytool -genkey -v -keystore ~/.android/debug.keystore \
           -storepass android -alias androiddebugkey \
           -keypass android -keyalg RSA -keysize 2048 \
           -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```

2. **Sign the APK:**
   ```bash
   jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
             -keystore ~/.android/debug.keystore \
             -storepass android -keypass android \
             app-debug.apk androiddebugkey
   ```

3. **Verify signature:**
   ```bash
   jarsigner -verify -verbose app-debug.apk
   ```

4. **Zipalign (optional but recommended):**
   ```bash
   zipalign -v 4 app-debug.apk app-debug-aligned.apk
   ```

---

## 📋 How to Get SHA-1 from Signed APK

**Method 1: From Keystore (Before Building)**

This is what you should use for OAuth setup:

```bash
# For debug builds
keytool -list -v -keystore ~/.android/debug.keystore \
        -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

Output:
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

**Method 2: From APK (After Building)**

```bash
# Extract certificate from signed APK
unzip -p app-debug.apk META-INF/*.RSA | \
keytool -printcert | grep SHA1
```

**Method 3: Using apksigner (if available)**

```bash
apksigner verify --print-certs app-debug.apk | grep SHA-256
```

---

## 🎯 Recommended Workflow

### **For OAuth Setup:**

1. **Don't use the APK SHA-1** - It's unreliable and changes with each build

2. **Use the keystore SHA-1 instead:**
   - Debug builds: SHA-1 from debug keystore
   - Release builds: SHA-1 from release keystore

3. **Generate SHA-1 from keystore:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore \
           -alias androiddebugkey -storepass android -keypass android
   ```

4. **Copy the SHA-1 value**

5. **Use it in Google Cloud Console:**
   - Create Android OAuth Client
   - Package: `com.mobilepetrolpump.app`
   - SHA-1: [Your SHA-1 from keystore]

---

## 🔐 Debug Keystore Information

**Default Debug Keystore Location:**
- Windows: `C:\Users\YourName\.android\debug.keystore`
- Mac/Linux: `~/.android/debug.keystore`

**Default Credentials:**
- Keystore password: `android`
- Key alias: `androiddebugkey`
- Key password: `android`

**Created by:** Android Studio (automatically)

**SHA-1:** Different for each developer's machine

---

## ⚠️ Important Notes

### **For Google OAuth:**

1. **Use keystore SHA-1, not APK SHA-1**
   - More reliable
   - Same for all builds from same keystore
   - Recommended by Google

2. **Debug vs Release:**
   - Debug keystore: For development
   - Release keystore: For production
   - Need separate OAuth clients for each

3. **Multiple Developers:**
   - Each developer has different debug keystore
   - Need to add all SHA-1 fingerprints to OAuth client
   - OR use shared release keystore

---

## 🚀 Next Steps

### **Immediate Action:**

1. **On your local machine**, run:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore \
           -alias androiddebugkey -storepass android -keypass android
   ```

2. **Copy the SHA1 value** that appears

3. **Use that SHA-1** in Google Cloud Console for Android OAuth setup

4. **Then rebuild APK properly** using Android Studio or Gradle

---

### **For OAuth Setup:**

Follow these guides with your keystore SHA-1:
- `/app/android/QUICK_OAUTH_SETUP.md`
- `/app/android/ANDROID_OAUTH_SETUP_GUIDE.md`

---

## 📚 Additional Information

### **Verifying a Signed APK:**

**Check if APK is signed:**
```bash
jarsigner -verify -verbose app-debug.apk
```

Good output:
```
jar verified.
```

Bad output:
```
jar is unsigned.
```

### **Viewing APK Certificate:**

```bash
# Extract and view certificate
unzip -p app-debug.apk META-INF/CERT.RSA | \
keytool -printcert
```

### **APK Signature Schemes:**

Android uses multiple signature schemes:
- **v1 (JAR Signing):** Traditional, uses META-INF/
- **v2 (APK Signing):** Faster verification, whole-file signature
- **v3 (APK Signing v3):** Supports key rotation
- **v4 (APK Signing v4):** Streaming verification

Most debug APKs use v1 + v2.

---

## ✅ Checklist

To get your SHA-1 and build a working APK:

- [ ] Have Android Studio installed
- [ ] OR have Android SDK + Gradle installed
- [ ] Debug keystore exists (`~/.android/debug.keystore`)
- [ ] Run keytool command to get SHA-1
- [ ] Copy SHA-1 value
- [ ] Create Android OAuth Client with SHA-1
- [ ] Build signed APK properly
- [ ] Verify APK is signed (`jarsigner -verify`)
- [ ] Install and test on device

---

## 💡 Pro Tips

1. **Always use keystore SHA-1 for OAuth**, not APK SHA-1

2. **Keep your release keystore safe** - you'll need it for all future updates

3. **Add multiple SHA-1s** to OAuth client for flexibility

4. **Test on real device** after OAuth setup

5. **Document your keystores** and their locations

---

**Last Updated:** November 3, 2025  
**APK Analyzed:** app-debug.apk (UNSIGNED)  
**Package Name:** com.mobilepetrolpump.app  
**Recommendation:** Generate SHA-1 from keystore, not from APK
