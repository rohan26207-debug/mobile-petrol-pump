# SHA-1 Fingerprint for Android OAuth

## 🔑 What is SHA-1 and Why Do You Need It?

The **SHA-1 fingerprint** is a unique identifier for your Android app's signing certificate. Google uses it to verify that OAuth requests are coming from your legitimate app.

---

## 📱 Current Status

**Your Android app package:** `com.mobilepetrolpump.app`

**SHA-1 needed for:**
- Creating Android OAuth 2.0 Client ID in Google Cloud Console
- Enabling Google Drive backup/restore in Android app

---

## 🔧 How to Generate SHA-1

Since we're in a cloud environment, **you need to generate the SHA-1 on your local machine** where you'll be building the Android APK.

### **For Debug Build (Development/Testing):**

#### **On Your Computer:**

**Windows (Command Prompt):**
```cmd
cd C:\Program Files\Java\jdk-XX\bin
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Mac (Terminal):**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Linux (Terminal):**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### **What You'll See:**
```
Keystore type: jks
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: androiddebugkey
Creation date: Oct 10, 2024
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: C=US, O=Android, CN=Android Debug
Issuer: C=US, O=Android, CN=Android Debug
Serial number: 1
Valid from: Thu Oct 10 10:00:00 UTC 2024 until: Mon Oct 03 10:00:00 UTC 2054
Certificate fingerprints:
         SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0  ← THIS ONE!
         SHA256: XX:XX:XX:XX:XX:XX:XX:XX:...
```

**Copy the SHA1 value** - it looks like: `A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0`

---

## 🎯 Quick Extract Commands

**Just want the SHA-1? Use these:**

**Windows:**
```cmd
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr "SHA1"
```

**Mac/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

Output:
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

---

## 📋 Step-by-Step: What to Do Now

### **Step 1: Open Terminal/Command Prompt on Your Computer**
- Windows: Press `Win + R`, type `cmd`, press Enter
- Mac: Press `Cmd + Space`, type "Terminal", press Enter
- Linux: Press `Ctrl + Alt + T`

### **Step 2: Run the Command**
Copy and paste the appropriate command for your OS (from above)

### **Step 3: Copy the SHA-1**
Look for the line that says `SHA1:` and copy the entire value

### **Step 4: Save It**
Save this SHA-1 value somewhere safe - you'll need it for:
1. Creating Android OAuth Client in Google Cloud Console
2. Future reference
3. Adding more fingerprints later

### **Step 5: Use It**
Go to Google Cloud Console and create Android OAuth Client with:
- **Package name:** `com.mobilepetrolpump.app`
- **SHA-1 fingerprint:** [Your SHA-1 value]

---

## 🔐 For Release Build (Production)

**When you're ready for production/Play Store:**

### **Step 1: Create Release Keystore**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

You'll be asked:
- Keystore password (choose strong password)
- Your name, organization, etc.

**⚠️ IMPORTANT:** Save this keystore file and password securely! You'll need them for all future app updates.

### **Step 2: Get Release SHA-1**
```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

Enter the password you set, then copy the SHA-1.

### **Step 3: Add to Google Cloud Console**
Either:
- Create new Android OAuth Client with release SHA-1, OR
- Add release SHA-1 to existing client (click "+ ADD FINGERPRINT")

---

## 📊 Example SHA-1 Values

**Debug keystore SHA-1 might look like:**
```
A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

**Release keystore SHA-1 might look like:**
```
12:34:56:78:9A:BC:DE:F0:11:22:33:44:55:66:77:88:99:AA:BB:CC
```

**Both are valid!** They're just different because they come from different keystores.

---

## 🔄 Multiple SHA-1 Fingerprints

**You can add multiple SHA-1 fingerprints to the same OAuth Client!**

This is useful for:
- ✅ Having both debug and release builds work
- ✅ Testing on multiple developer machines
- ✅ Supporting different signing keys

**How to add multiple:**
1. Go to Google Cloud Console → Credentials
2. Click your Android OAuth Client
3. Click **"+ ADD FINGERPRINT"**
4. Add additional SHA-1 values
5. Save

---

## 🚨 Common Issues

### **"keytool is not recognized"**

**Cause:** Java not installed or not in PATH

**Solution:**
1. Install Java JDK: https://www.oracle.com/java/technologies/downloads/
2. Or find keytool: `C:\Program Files\Java\jdk-XX\bin\keytool.exe`
3. Use full path to keytool

**Windows example:**
```cmd
"C:\Program Files\Java\jdk-11\bin\keytool.exe" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### **"Keystore file does not exist"**

**Cause:** Debug keystore not created yet

**Solution:**
1. Open Android Studio
2. Build any Android project once
3. Debug keystore will be created automatically
4. Try command again

**Or manually create:**
```bash
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### **"Wrong password"**

**Cause:** You're trying to access a keystore with wrong password

**For debug keystore:**
- Password is always: `android`
- Alias is always: `androiddebugkey`

**For release keystore:**
- Use the password you set when creating it
- Use the alias you specified

---

## 💡 Pro Tips

### **Tip 1: Save Your SHA-1**
Create a file `SHA1_FINGERPRINTS.txt`:
```
Debug SHA-1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
Release SHA-1: (will add when creating release keystore)
Package Name: com.mobilepetrolpump.app
```

### **Tip 2: Use Release Keystore for Everything**
Instead of debug keystore, create a release keystore and use it for both development and production. Benefits:
- Same SHA-1 for all builds
- No need to maintain multiple OAuth clients
- Easier testing

### **Tip 3: Store Keystore in Safe Place**
- Google Drive (encrypted)
- Password manager
- USB drive (backup)
- **Never** commit to Git!

### **Tip 4: Document Everything**
Keep notes of:
- Keystore location
- Keystore password
- Key alias
- SHA-1 fingerprint
- When it was created

---

## ✅ Checklist

When you have your SHA-1, you need to:

- [ ] Generate SHA-1 fingerprint on your local machine
- [ ] Copy the SHA-1 value
- [ ] Save it in a secure location
- [ ] Go to Google Cloud Console
- [ ] Create Android OAuth 2.0 Client ID
- [ ] Paste SHA-1 fingerprint
- [ ] Add package name: `com.mobilepetrolpump.app`
- [ ] Click Create
- [ ] Copy the Android Client ID
- [ ] Update MainActivity.java with Client ID
- [ ] Rebuild APK
- [ ] Test on device

---

## 📞 Next Steps

**After getting your SHA-1:**

1. Follow the guide: `/app/android/QUICK_OAUTH_SETUP.md`
2. Or detailed guide: `/app/android/ANDROID_OAUTH_SETUP_GUIDE.md`
3. Create Android OAuth Client with your SHA-1
4. Update MainActivity.java with your Android Client ID
5. Build and test!

---

## 📚 Related Documentation

- **Quick Setup:** `/app/android/QUICK_OAUTH_SETUP.md`
- **Complete Guide:** `/app/android/ANDROID_OAUTH_SETUP_GUIDE.md`
- **Import/Export:** `/app/android/ANDROID_IMPORT_EXPORT_GUIDE.md`

---

**Package Name:** `com.mobilepetrolpump.app`  
**Required for:** Google Drive OAuth in Android app  
**Platform:** Android  
**Last Updated:** November 3, 2025
