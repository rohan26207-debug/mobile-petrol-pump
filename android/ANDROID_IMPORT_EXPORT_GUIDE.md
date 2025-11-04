# Android App - Quick Import/Export Guide

## 📱 For Android Users Only

Simple guide for backing up and restoring your data on Android.

---

## 🎯 Quick Start

### **Where is Settings?**
- Open the app
- Look for ⚙️ **Settings** icon at the top left corner
- Tap on it

---

## 📤 BACKUP (Export) Your Data

### **Step-by-Step:**

1. **Open Settings** ⚙️ (top left)

2. **Tap "Backup" Tab**

3. **Scroll down to "Manual Backup"**

4. **Tap "💾 Export Data Backup"**

5. **Done!** File is automatically saved to:
   ```
   Phone Storage → Downloads → mpump-backup-2025-11-03.json
   ```

6. **Find your backup:**
   - Open **File Manager** or **My Files** app
   - Go to **Downloads** folder
   - Look for `mpump-backup-*.json`

---

## 📥 RESTORE (Import) Your Data

### **Step-by-Step:**

1. **Make sure you have the backup file**
   - Should be in **Downloads** folder
   - Or download from email/WhatsApp/Drive first

2. **Open Settings** ⚙️ → **Backup Tab**

3. **Tap "📥 Import Data Backup"**

4. **File Picker Opens**
   - Navigate to **Downloads** folder (or wherever your file is)
   - Look for `.json` files

5. **Tap on your backup file**
   - File name like: `mpump-backup-2025-11-03.json`

6. **Wait...**
   - Message: "Loading backup data..."
   - Message: "Data Imported Successfully"

7. **App Refreshes Automatically**
   - All your data is back! ✅

---

## ☁️ Google Drive Backup

### **First Time Setup:**

1. **Open Settings → Backup**

2. **Tap "🔐 Connect Google Drive"**

3. **Browser Opens**
   - Don't panic! This is normal
   - Google login page appears

4. **Sign In**
   - Enter your Google email & password
   - Tap "Allow" when asked for permissions

5. **Back to App**
   - Browser automatically goes back to app
   - Message: "Google Drive connected" ✅

### **Backup to Google Drive:**

1. **Tap "☁️ Backup to Google Drive"**
2. Wait for success message
3. Done! Your data is in Google Drive

### **Restore from Google Drive:**

1. **Tap "⬇️ Restore from Google Drive"**
2. Choose which backup to restore
3. Confirm
4. Done! Data restored

---

## 📤 Share Backup via WhatsApp/Email

### **Method 1: From File Manager**

1. **Export data first** (see above)

2. **Open File Manager → Downloads**

3. **Long press** on `mpump-backup-*.json` file

4. **Tap "Share"**

5. **Choose app:**
   - WhatsApp → Send to yourself or someone
   - Gmail → Email to yourself
   - Drive → Upload to Google Drive
   - Any other app you prefer

### **Method 2: Direct Share**

1. After exporting, go to **Downloads** folder immediately

2. The backup file should be the **newest file**

3. Tap on it → **Share**

4. Send via your preferred method

---

## 🆘 Common Issues

### **Problem: "Failed to save backup"**

**Fix:**
1. Go to phone **Settings** (not app settings)
2. **Apps** → **M.Pump Calc** → **Permissions**
3. Enable **"Storage"** or **"Files and media"**
4. Try export again

---

### **Problem: "Can't find backup file"**

**Fix:**
1. Open **File Manager** / **My Files**
2. Tap **"Downloads"** folder
3. Look at top - tap **"Sort by: Date"** or **"Recent"**
4. Your file should be at top
5. File name: `mpump-backup-2025-11-03.json`

---

### **Problem: "File picker shows no files"**

**Fix:**
1. In file picker, look for **"Show all files"** or **"All"** filter
2. Or look for `.txt` files (same as .json)
3. Check **Downloads**, **Documents**, **Internal Storage** folders

---

### **Problem: "Import says invalid file"**

**Fix:**
1. Make sure file is **complete** (not partially downloaded)
2. File should be at least **10KB** in size
3. Try downloading/copying file again
4. Make sure it's a `.json` file

---

### **Problem: "Google Drive won't connect"**

**Fix:**
1. Make sure you have **internet connection**
2. Make sure you're using the correct **Google account**
3. Try:
   - Close app completely
   - Reopen app
   - Try connecting again
4. If still fails:
   - Go to https://myaccount.google.com/permissions (on phone browser)
   - Remove "Mobile Petrol Pump" if listed
   - Try connecting again in app

---

## 💡 Pro Tips

### **Tip 1: Backup Weekly**
Every Sunday, tap "Export Data Backup". Takes 2 seconds!

### **Tip 2: Send to Email**
After backup, share file to your email. Safe forever!

### **Tip 3: Google Drive Auto-Backup**
Connect Google Drive once → Enable "Auto Backup" → Never worry again!

### **Tip 4: Before Clearing Data**
Always export backup before:
- Uninstalling app
- Clearing app data
- Factory reset phone
- Getting new phone

### **Tip 5: Test Backup Works**
Once a month, try importing your backup to make sure it works.

### **Tip 6: Multiple Backups**
Don't delete old backups. Keep multiple:
- `mpump-backup-2025-11-01.json` ✅
- `mpump-backup-2025-11-08.json` ✅
- `mpump-backup-2025-11-15.json` ✅

---

## 📂 Where Files are Saved

### **Backup Files:**
```
Phone Storage
  └── Downloads
       └── mpump-backup-2025-11-03.json ← HERE
```

### **PDF Reports:**
```
Phone Storage
  └── Downloads
       └── (PDF files saved here)
```

---

## ✅ Quick Reference

| What? | How? |
|-------|------|
| **Backup** | Settings → Backup → Export Data |
| **Restore** | Settings → Backup → Import Data |
| **Find File** | File Manager → Downloads |
| **Share** | Long press file → Share |
| **Google Drive** | Settings → Backup → Connect Drive |
| **Check Backup** | File Manager → Downloads → Look for .json |

---

## 🎬 Visual Steps (Text Description)

### **Backup Process:**
```
[App Home] 
   → Tap ⚙️ Settings (top left)
   → Tap "Backup" tab
   → Scroll down
   → Tap "💾 Export Data Backup"
   → Toast: "Backup saved to Downloads..."
   → Done! ✅
```

### **Restore Process:**
```
[App Home]
   → Tap ⚙️ Settings
   → Tap "Backup" tab  
   → Tap "📥 Import Data Backup"
   → File picker opens
   → Navigate to Downloads
   → Tap on .json file
   → Toast: "Loading backup..."
   → Toast: "Data Imported Successfully"
   → App refreshes
   → Done! ✅
```

---

## 📞 Need More Help?

**Full detailed guide available at:**
`/app/IMPORT_EXPORT_GUIDE.md`

**Or see:**
- Android build guide: `/app/android/BEGINNER_APK_BUILD_GUIDE.md`
- Deployment guide: `/app/DEPLOYMENT_GUIDE.md`

---

## 🎉 Summary

✅ **Export:** Settings → Backup → Export → Saved to Downloads  
✅ **Import:** Settings → Backup → Import → Select file  
✅ **Share:** File Manager → Long press → Share  
✅ **Google Drive:** Connect once → Auto-backup enabled  
✅ **Find Backups:** File Manager → Downloads → `.json` files  

**Remember:** Always backup before major changes! 🔒

---

**For Android Users** 📱  
**Last Updated:** November 3, 2025  
**App Version:** 1.0.0
