# Google Drive Web-Based Integration Guide

## Overview

This is a **simplified web-based approach** for Google Drive integration in your Android app. All the complex logic is handled in JavaScript - no complicated native Java code needed!

## Architecture

```
┌─────────────────────────────────────┐
│   Android WebView (Simple)          │
│   - Just loads web app              │
│   - No OAuth handling               │
│   - No file upload logic            │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Web App (JavaScript)              │
│   - Handles OAuth                   │
│   - Exports to Drive                │
│   - Imports from Drive              │
│   - All logic in browser            │
└─────────────────────────────────────┘
```

## Benefits

✅ **Simple**: No complex native code  
✅ **Easy to Debug**: Use browser DevTools  
✅ **Cross-Platform**: Works on web & Android  
✅ **Easy to Update**: Just update JavaScript  
✅ **No APK Rebuild**: Changes to Drive logic don't require new APK  

---

## Files Created

### 1. **MainActivity_WebBased.java**
Location: `/app/android/app/src/main/java/com/mobilepetrolpump/app/MainActivity_WebBased.java`

**What it does**:
- Simple WebView wrapper
- Opens OAuth URLs in external browser
- Handles file upload dialogs for import
- ~130 lines vs 210+ lines in native version

**Key Features**:
```java
// Open OAuth in browser
if (url.contains("accounts.google.com")) {
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    startActivity(intent);
    return true;
}

// Inject Android flag
view.evaluateJavascript("window.isAndroidApp = true;", null);

// Handle file picker for import
@Override
public boolean onShowFileChooser(...) {
    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
    intent.setType("application/json");
    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
    return true;
}
```

### 2. **google-drive-web.js**
Location: `/app/frontend/public/google-drive-web.js`

**What it does**:
- Complete Google Drive API in JavaScript
- OAuth authentication
- Export data (create/update files)
- Import data (download files)
- List backup files
- Token management

**Key Functions**:
```javascript
// Authenticate
await googleDriveService.authenticate();

// Export
await googleDriveService.exportToGoogleDrive(data, 'mpump-backup.json');

// Import
const data = await googleDriveService.importFromGoogleDrive('mpump-backup.json');

// List backups
const files = await googleDriveService.listBackupFiles();
```

---

## Implementation Steps

### Step 1: Replace MainActivity.java

**Option A: Rename files**
```bash
cd /app/android/app/src/main/java/com/mobilepetrolpump/app
mv MainActivity.java MainActivity_Native.java.backup
mv MainActivity_WebBased.java MainActivity.java
```

**Option B: Copy content**
Copy the content from `MainActivity_WebBased.java` into your existing `MainActivity.java`

### Step 2: Add Google Drive script to index.html

In `/app/frontend/public/index.html`, add before closing `</head>`:

```html
<!-- Google Drive Web Service -->
<script src="./google-drive-web.js"></script>
```

### Step 3: Add UI Component

Create a React component for Drive operations:

```jsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Upload, Download, List } from 'lucide-react';

const GoogleDriveManager = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    try {
      setLoading(true);
      await window.googleDriveService.authenticate();
      setIsConnected(true);
      alert('✅ Connected to Google Drive');
    } catch (error) {
      alert('❌ Connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      
      // Get all app data
      const data = {
        salesData: JSON.parse(localStorage.getItem('mpump_sales_data') || '[]'),
        creditData: JSON.parse(localStorage.getItem('mpump_credit_data') || '[]'),
        incomeData: JSON.parse(localStorage.getItem('mpump_income_data') || '[]'),
        expenseData: JSON.parse(localStorage.getItem('mpump_expense_data') || '[]'),
        fuelSettings: JSON.parse(localStorage.getItem('mpump_fuel_settings') || '{}'),
        exportDate: new Date().toISOString(),
        version: '2.0'
      };

      const filename = `mpump-backup-${new Date().toISOString().split('T')[0]}.json`;
      await window.googleDriveService.exportToGoogleDrive(data, filename);
      
      alert('✅ Data exported to Google Drive!');
    } catch (error) {
      alert('❌ Export failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const importData = async () => {
    try {
      setLoading(true);
      
      const filename = `mpump-backup-${new Date().toISOString().split('T')[0]}.json`;
      const data = await window.googleDriveService.importFromGoogleDrive(filename);
      
      // Restore data
      if (data.salesData) localStorage.setItem('mpump_sales_data', JSON.stringify(data.salesData));
      if (data.creditData) localStorage.setItem('mpump_credit_data', JSON.stringify(data.creditData));
      if (data.incomeData) localStorage.setItem('mpump_income_data', JSON.stringify(data.incomeData));
      if (data.expenseData) localStorage.setItem('mpump_expense_data', JSON.stringify(data.expenseData));
      if (data.fuelSettings) localStorage.setItem('mpump_fuel_settings', JSON.stringify(data.fuelSettings));
      
      alert('✅ Data imported successfully! Please refresh the app.');
      window.location.reload();
    } catch (error) {
      alert('❌ Import failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Google Drive Backup</h3>
      
      {!isConnected ? (
        <Button onClick={connect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect to Google Drive'}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button onClick={exportData} disabled={loading} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export to Drive'}
          </Button>
          
          <Button onClick={importData} disabled={loading} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Importing...' : 'Import from Drive'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveManager;
```

### Step 4: Build and Test

```bash
# Build frontend
cd /app/frontend
yarn build

# Update Android assets
rm -rf /app/android/app/src/main/assets/*
cp -r /app/frontend/build/* /app/android/app/src/main/assets/

# Build APK
cd /app/android
./gradlew clean assembleRelease
```

---

## Usage

### In Web Browser

1. Open app
2. Go to Settings → Google Drive
3. Click "Connect to Google Drive"
4. Authorize in popup
5. Click "Export to Drive" or "Import from Drive"

### In Android App

1. Open app
2. Go to Settings → Google Drive  
3. Click "Connect to Google Drive"
4. Browser opens → Authorize
5. Returns to app
6. Click "Export to Drive" - file uploaded!
7. Click "Import from Drive" - data restored!

---

## Advanced Features

### Auto-Backup

```javascript
// Setup auto-backup every 24 hours
setInterval(async () => {
  if (window.googleDriveService.isAuthenticated()) {
    try {
      const data = getAllAppData();
      await window.googleDriveService.exportToGoogleDrive(data, 'mpump-backup-auto.json');
      console.log('✅ Auto-backup completed');
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  }
}, 24 * 60 * 60 * 1000); // 24 hours
```

### List All Backups

```javascript
const listBackups = async () => {
  const files = await window.googleDriveService.listBackupFiles();
  console.log('Available backups:', files);
  
  files.forEach(file => {
    console.log(`- ${file.name} (${new Date(file.modifiedTime).toLocaleString()})`);
  });
};
```

### Import Specific Backup

```javascript
const importSpecificBackup = async (filename) => {
  const data = await window.googleDriveService.importFromGoogleDrive(filename);
  // Restore data...
};
```

---

## Debugging

### Browser Console

Open DevTools (F12) and run:

```javascript
// Check if service is loaded
console.log('Drive service:', window.googleDriveService);

// Check authentication
console.log('Is authenticated:', window.googleDriveService.isAuthenticated());

// Test export
const testData = { test: 'data', timestamp: new Date().toISOString() };
await window.googleDriveService.exportToGoogleDrive(testData, 'test-backup.json');

// Test import
const imported = await window.googleDriveService.importFromGoogleDrive('test-backup.json');
console.log('Imported:', imported);

// List backups
const backups = await window.googleDriveService.listBackupFiles();
console.log('Backups:', backups);
```

### Android Logcat

```bash
# Enable WebView debugging
adb logcat | grep -E "chromium|Console"
```

---

## Comparison: Native vs Web-Based

| Feature | Native (Java) | Web-Based (JS) |
|---------|--------------|----------------|
| **Code Size** | 210+ lines Java | 130 lines Java + 350 lines JS |
| **Complexity** | High | Low |
| **Debugging** | Logcat only | Browser DevTools |
| **Updates** | Requires APK rebuild | Just update JS |
| **OAuth Flow** | Complex | Simple popup |
| **File Operations** | Java I/O + HTTP | Fetch API |
| **Error Handling** | Try-catch in Java | Try-catch in JS |
| **Token Storage** | Manual | localStorage |
| **Cross-Platform** | Android only | Works on web too |

---

## Troubleshooting

### OAuth Popup Blocked

**Solution**: Allow popups for your domain

```javascript
// Alternative: Use redirect instead of popup
if (!window.open(authUrl)) {
  window.location.href = authUrl;
}
```

### Token Expired

**Solution**: Automatic re-authentication

```javascript
try {
  await googleDriveService.exportToGoogleDrive(data, filename);
} catch (error) {
  if (error.message.includes('expired')) {
    await googleDriveService.authenticate();
    // Retry
    await googleDriveService.exportToGoogleDrive(data, filename);
  }
}
```

### File Not Found on Import

**Solution**: List available files first

```javascript
const files = await googleDriveService.listBackupFiles();
if (files.length === 0) {
  alert('No backups found. Please export first.');
} else {
  // Show file picker
  const filename = files[0].name;
  const data = await googleDriveService.importFromGoogleDrive(filename);
}
```

---

## Summary

This web-based approach is **much simpler** than native Java implementation:

✅ **Easier to maintain**
✅ **Easier to debug**  
✅ **Easier to extend**
✅ **Works on both web and Android**
✅ **No native code complexity**

The Android app becomes just a simple WebView wrapper, while all the complex Drive logic is handled in JavaScript where it's easier to work with!
