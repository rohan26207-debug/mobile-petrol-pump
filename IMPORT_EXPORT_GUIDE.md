# Import & Export Guide - Mobile Petrol Pump App

## 📱 Complete Guide for Web & Android

This guide explains how to backup (export) and restore (import) your data in both the web application and Android app.

---

## 🌐 WEB APPLICATION - Import/Export

### **What Data is Backed Up?**

When you export data, the following information is saved:
- ✅ **Sales Data** - All fuel sales records
- ✅ **Credit Sales** - Customer credit transactions
- ✅ **Income Records** - Income entries
- ✅ **Expense Records** - Expense entries
- ✅ **Fuel Settings** - Fuel types, prices, nozzle counts
- ✅ **Customers** - Customer list and starting balances
- ✅ **Payments** - Payment received records
- ✅ **Stock Data** - Fuel stock records
- ✅ **Contact Information** - Pump name, dealer name, address, email
- ✅ **Notes** - Saved notes
- ✅ **App Preferences** - Text size, theme settings
- ✅ **Backup Settings** - Auto-backup configurations

---

### **📤 How to EXPORT Data (Web)**

#### **Method 1: Download as JSON File (Recommended)**

1. **Open Settings**
   - Click the ⚙️ **Settings** icon at the top left

2. **Go to Backup Tab**
   - Click on the **"Backup"** tab in Settings

3. **Export Data**
   - Scroll down to **"Manual Backup"** section
   - Click the **"💾 Export Data Backup"** button

4. **Save the File**
   - **On Chrome/Edge:** A file picker will open - choose where to save
   - **On other browsers:** File downloads automatically to your Downloads folder
   - **File name format:** `mpump-backup-2025-11-03.json`

5. **Store Safely**
   - Keep the file in a safe location (Google Drive, USB, etc.)
   - You can email it to yourself for safekeeping

---

#### **Method 2: Copy to Clipboard**

1. **Open Settings → Backup Tab**

2. **Copy Backup Data**
   - Click **"📋 Copy Backup Data"** button
   - Data is copied to your clipboard

3. **Save Manually**
   - Open a text editor (Notepad, TextEdit, etc.)
   - **Paste** (Ctrl+V / Cmd+V)
   - **Save As** → Choose file type: **"All Files"** or **".json"**
   - File name: `mpump-backup-2025-11-03.json`

**When to use this method:**
- If download doesn't work
- If you want to inspect the data
- For sharing via WhatsApp/Email (copy-paste)

---

#### **Method 3: Google Drive Auto-Backup**

1. **Enable Auto-Backup**
   - Open **Settings → Backup**
   - Scroll to **"Google Drive Backup"** section
   - Click **"🔐 Connect Google Drive"**
   - Sign in with your Google account
   - Grant permissions

2. **Manual Backup to Drive**
   - After connecting, click **"☁️ Backup to Google Drive"**
   - File is automatically uploaded
   - File name: `mobile-petrol-pump-backup-2025-11-03.json`

3. **Enable Auto-Backup (Optional)**
   - Toggle **"Auto Backup (24h)"** switch
   - App will automatically backup every 24 hours
   - Last backup time is shown below the button

4. **Check Your Backups**
   - Go to https://drive.google.com
   - Search for "mobile-petrol-pump-backup"
   - You'll see all your backup files

---

### **📥 How to IMPORT Data (Web)**

#### **Method 1: Import from File**

1. **Open Settings → Backup Tab**

2. **Import Backup**
   - Click **"📥 Import Data Backup"** button

3. **Select File**
   - File picker opens
   - Navigate to your backup JSON file
   - Click **"Open"**

4. **Confirm Import**
   - Popup appears: *"This will replace all existing data. Are you sure?"*
   - Click **"OK"** to proceed
   - Click **"Cancel"** to abort

5. **Wait for Import**
   - Success message appears
   - Page automatically refreshes after 2 seconds
   - All your data is restored!

**⚠️ Important:** This will **replace** all current data. Make sure you have a backup of current data if needed.

---

#### **Method 2: Restore from Google Drive**

1. **Open Settings → Backup**

2. **Restore from Drive**
   - Click **"⬇️ Restore from Google Drive"**
   - App fetches your backup files from Google Drive

3. **Select Backup**
   - List of available backups appears
   - Click on the backup you want to restore
   - Confirm restoration

4. **Data Restored**
   - Success message appears
   - Page refreshes
   - All data is restored from the selected backup

---

### **📊 Check Storage Usage**

Want to know how much data you're storing?

1. **Open Settings → Backup**
2. **Click "📊 Check Storage Usage"**
3. **See Information:**
   - Percentage of browser storage used
   - Number of data items stored
   - Available storage space

---

## 📱 ANDROID APP - Import/Export

The Android app has **enhanced features** for import/export compared to the web version.

### **📤 How to EXPORT Data (Android)**

#### **Export to Downloads Folder**

1. **Open App Settings**
   - Tap ⚙️ **Settings** icon (top left)

2. **Go to Backup Tab**
   - Tap **"Backup"** tab

3. **Export Data**
   - Scroll to **"Manual Backup"**
   - Tap **"💾 Export Data Backup"**

4. **Android Saves Automatically**
   - File is **automatically saved** to:
     ```
     /Downloads/mpump-backup-2025-11-03.json
     ```
   - Toast notification: **"Backup saved to Downloads: mpump-backup..."**

5. **Find Your Backup**
   - Open **File Manager** / **My Files** app
   - Go to **Downloads** folder
   - Look for `mpump-backup-*.json` files

6. **Share or Backup**
   - **Long press** on the file
   - Tap **"Share"**
   - Send via WhatsApp, Email, Telegram, etc.
   - Or upload to Google Drive, Dropbox manually

---

### **📥 How to IMPORT Data (Android)**

#### **Import from Downloads/Storage**

1. **Open App Settings → Backup**

2. **Import Backup**
   - Tap **"📥 Import Data Backup"**

3. **Android File Picker Opens**
   - **Native Android file picker** appears
   - Navigate to your backup file location
   - Common locations:
     - **Downloads** folder
     - **Google Drive** (if you have the Drive app)
     - **Documents** folder

4. **Select JSON File**
   - Tap on your `.json` backup file
   - File types shown: `.json` and `.txt` (for flexibility)

5. **Import Process**
   - Toast: **"Loading backup data..."**
   - Data is imported
   - Toast: **"Data Imported Successfully"** or **"Import Failed"**

6. **Automatic Refresh**
   - App automatically refreshes
   - All restored data appears

**⚠️ Important:** This will **replace** all existing data in the app.

---

### **☁️ Google Drive Backup (Android)**

The Android app **fully supports** Google Drive backup!

#### **Connect Google Drive**

1. **Open Settings → Backup**

2. **Connect Drive**
   - Tap **"🔐 Connect Google Drive"**

3. **External Browser Opens**
   - Android opens your **default browser** (Chrome, Firefox, etc.)
   - Google OAuth login page appears

4. **Sign In**
   - Enter your Google account credentials
   - Grant permissions to access Google Drive

5. **Redirect Back to App**
   - After successful login, browser **automatically redirects** back to the app
   - Toast: **"Google Drive connected"**

#### **Backup to Drive (Android)**

1. After connecting, tap **"☁️ Backup to Google Drive"**
2. Backup uploads automatically
3. Toast: **"✓ Backup Successful - Saved to your Google Drive as..."**

#### **Restore from Drive (Android)**

1. Tap **"⬇️ Restore from Google Drive"**
2. App fetches backup files
3. Select backup from list
4. Data restores automatically

---

## 📂 Backup File Format

### **File Structure**

Your backup file is a JSON file containing all your data:

```json
{
  "salesData": [...],
  "creditData": [...],
  "incomeData": [...],
  "expenseData": [...],
  "fuelSettings": {...},
  "customers": [...],
  "payments": [...],
  "stockData": {...},
  "contactInfo": {...},
  "notes": "...",
  "appPreferences": {...},
  "exportDate": "2025-11-03T12:00:00.000Z",
  "version": "2.0"
}
```

### **File Details**

- **Format:** JSON (JavaScript Object Notation)
- **Extension:** `.json`
- **Readable:** Yes, can be opened in text editor
- **Editable:** Yes, but be careful with syntax
- **Size:** Typically 50KB - 5MB (depends on data volume)

---

## 🔄 Backup Best Practices

### **Recommended Backup Strategy**

1. **Daily Backups** (High Activity)
   - If you enter data daily
   - Use Google Drive Auto-Backup
   - Keep last 7 days of backups

2. **Weekly Backups** (Moderate Activity)
   - If you use the app 2-3 times per week
   - Manual export every weekend
   - Store on Google Drive or USB

3. **Monthly Backups** (Low Activity)
   - If you use app occasionally
   - Export at month-end
   - Keep 3-4 months of backups

4. **Before Major Changes**
   - Before importing new data
   - Before deleting old records
   - Before app updates

---

### **Where to Store Backups**

#### ✅ **Recommended:**

1. **Google Drive**
   - Auto-backup enabled
   - Accessible from anywhere
   - Safe from device loss

2. **Email to Yourself**
   - Export file → Attach to email
   - Send to your email
   - Forever accessible

3. **Multiple Locations**
   - Cloud (Google Drive, Dropbox)
   - USB drive
   - Computer hard drive

#### ❌ **Not Recommended:**

1. **Only on Phone**
   - If phone is lost/damaged, data is gone
   - Storage can be accidentally deleted

2. **Only in Downloads**
   - Downloads folder often gets cleaned
   - Files can be deleted by mistake

---

## 🆘 Troubleshooting

### **Web - Export Issues**

#### **"Export Failed" Error**
**Solution:**
1. Try **"Copy Backup Data"** instead
2. Paste into text editor
3. Save manually as `.json` file

#### **Download Doesn't Start**
**Solution:**
1. Check browser permissions for downloads
2. Try different browser (Chrome recommended)
3. Use copy-paste method

#### **File is Too Small (< 1KB)**
**Solution:**
- Data might not be saved properly
- Check if you have any data in the app
- Try entering some test data and export again

---

### **Web - Import Issues**

#### **"Invalid Backup File" Error**
**Causes:**
- File is corrupted
- File is not proper JSON format
- File doesn't contain required data

**Solution:**
1. Open file in text editor
2. Check if it starts with `{` and ends with `}`
3. Verify it contains fields like `salesData`, `creditData`
4. Try re-exporting from backup source

#### **Import Doesn't Refresh Page**
**Solution:**
- Manually refresh page (F5 / Ctrl+R)
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

---

### **Android - Export Issues**

#### **"Failed to save backup" Error**
**Solution:**
1. Check if app has **storage permissions**
   - Go to **Settings → Apps → M.Pump Calc → Permissions**
   - Enable **"Storage"** or **"Files and media"**
2. Check if storage is full
3. Try clearing Downloads folder

#### **Can't Find Exported File**
**Solution:**
1. Open **File Manager**
2. Go to **Downloads** folder
3. Sort by **"Date modified"** (newest first)
4. Look for `mpump-backup-*.json`
5. Or search for "mpump" in file manager

---

### **Android - Import Issues**

#### **"Failed to read file" Error**
**Solution:**
1. Check file extension is `.json`
2. Try renaming file if needed
3. Ensure file is complete (not partially downloaded)
4. Try copying file to **Documents** folder and import from there

#### **File Picker Doesn't Show JSON Files**
**Solution:**
1. Change filter to **"All files"** in file picker
2. Or change file extension to `.txt` (temporarily)
3. After import, you can delete the `.txt` version

---

### **Google Drive Issues (Both Platforms)**

#### **"Could not connect to Google Drive"**
**Solution:**
1. Check internet connection
2. Try disconnecting and reconnecting
3. Clear browser cache (if web)
4. Re-login to Google account

#### **"No Backups Found" When Restoring**
**Solution:**
1. Go to https://drive.google.com
2. Search for "mobile-petrol-pump-backup"
3. If files exist but app doesn't see them:
   - Check if files are in correct Drive account
   - Try uploading a new backup
4. If no files exist:
   - Create manual backup first
   - Then restore will work

#### **"Backup Failed" Error**
**Solution:**
1. Check Google Drive storage space
2. Disconnect and reconnect Google Drive
3. Try revoking app permissions and reconnecting:
   - Go to https://myaccount.google.com/permissions
   - Remove "Mobile Petrol Pump" access
   - Reconnect in app

---

## 💡 Tips & Tricks

### **Tip 1: Regular Auto-Backups**
Enable Google Drive auto-backup (24h) and forget about it. Your data is always safe!

### **Tip 2: Multiple Backup Methods**
Use both Google Drive AND manual download. Double safety!

### **Tip 3: Test Your Backups**
After creating backup, try importing it once to make sure it works.

### **Tip 4: Backup Before Clearing**
Before clearing old data, always export a backup first.

### **Tip 5: Share Backups Across Devices**
Export on one device → Import on another device = Data in sync!

### **Tip 6: Keep Multiple Versions**
Don't overwrite backups. Keep files like:
- `mpump-backup-2025-11-01.json`
- `mpump-backup-2025-11-08.json`
- `mpump-backup-2025-11-15.json`

### **Tip 7: Compress for Sharing**
If backup file is too large for WhatsApp, zip it first:
- **Android:** Use file manager's "Compress" feature
- **Web:** Right-click → Send to → Compressed folder

---

## 📧 Support

### **Need Help?**

If you encounter issues not covered here:

1. **Check app logs** (Settings → Advanced → Logs)
2. **Try on different device** (Web vs Android)
3. **Contact support** with:
   - Device details (Android version / Browser name)
   - Error message screenshot
   - Steps that led to the issue

---

## ✅ Quick Reference Card

### **WEB**
| Action | Steps |
|--------|-------|
| **Export** | Settings → Backup → "💾 Export Data Backup" |
| **Import** | Settings → Backup → "📥 Import Data Backup" |
| **Copy Data** | Settings → Backup → "📋 Copy Backup Data" |
| **Drive Backup** | Settings → Backup → "☁️ Backup to Google Drive" |
| **Drive Restore** | Settings → Backup → "⬇️ Restore from Google Drive" |

### **ANDROID**
| Action | Steps |
|--------|-------|
| **Export** | Settings → Backup → "💾 Export Data Backup" → Saved to Downloads |
| **Import** | Settings → Backup → "📥 Import Data Backup" → Select file |
| **Drive Backup** | Connect Drive → "☁️ Backup to Google Drive" |
| **Drive Restore** | Connect Drive → "⬇️ Restore from Google Drive" |
| **Find Backups** | File Manager → Downloads → `mpump-backup-*.json` |

---

## 🎉 Summary

✅ **Web & Android** both support full import/export  
✅ **3 methods** available: Download, Copy-Paste, Google Drive  
✅ **Android** automatically saves to Downloads folder  
✅ **All data** is backed up including settings  
✅ **Easy restore** process with confirmation  
✅ **Google Drive** integration for cloud backup  
✅ **Cross-platform** - backup on web, restore on Android (or vice versa)  

Your data is always safe and portable! 🔒📱💾

---

**Last Updated:** November 3, 2025  
**App Version:** 1.0.0  
**Guide Version:** 1.0
