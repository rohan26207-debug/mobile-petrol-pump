# Manual Backup Troubleshooting Guide

## Issue Investigation

The manual backup functionality is implemented in `/app/frontend/src/components/HeaderSettings.jsx` around line 923-1005.

## How Manual Backup Works

1. User clicks "💾 Export Data Backup" button
2. Code calls `localStorageService.exportAllData()`
3. Creates a JSON string with all data
4. Tries three methods to download:
   - Android native: `window.MPumpCalcAndroid.saveJsonBackup()`
   - Modern browsers: `window.showSaveFilePicker()` (File System Access API)
   - Fallback: Traditional download link

## Common Issues & Solutions

### Issue 1: Button Not Responding
**Symptoms**: Click button but nothing happens
**Possible Causes**:
- JavaScript error preventing execution
- localStorage data is corrupt
- Browser blocking the download

**How to Test**:
Open browser console (F12) and run:
```javascript
// Test if localStorage service is available
const backupData = localStorageService.exportAllData();
console.log('Backup data:', backupData);

// Test if data can be stringified
const dataStr = JSON.stringify(backupData, null, 2);
console.log('Data string length:', dataStr.length);
```

### Issue 2: Download Fails Silently
**Symptoms**: Button works but no file downloads
**Possible Causes**:
- Pop-up blocker
- Browser security settings
- File System Access API not supported

**Solutions**:
1. Check browser console for errors
2. Try the "📋 Copy Backup Data" button instead
3. Paste the data into a text file and save as .json

### Issue 3: Export Data is Empty
**Symptoms**: File downloads but is empty or missing data
**Possible Causes**:
- No data in localStorage
- exportAllData() function error

**How to Fix**:
1. Check if there's data in the app (sales, credit, etc.)
2. Open browser DevTools → Application → Local Storage
3. Look for keys starting with: `mpump_`, `mpp_`

## Quick Test Steps

1. Open the app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste this test code:

```javascript
// Test 1: Check if localStorage has data
console.log('LocalStorage keys:', Object.keys(localStorage));

// Test 2: Try to export data
try {
  const data = JSON.parse(localStorage.getItem('mpump_sales') || '[]');
  console.log('Sales data count:', data.length);
} catch (e) {
  console.error('Error reading sales:', e);
}

// Test 3: Try manual export
try {
  const backupData = {
    salesData: JSON.parse(localStorage.getItem('mpump_sales') || '[]'),
    creditData: JSON.parse(localStorage.getItem('mpump_credit') || '[]'),
    incomeData: JSON.parse(localStorage.getItem('mpump_income') || '[]'),
    expenseData: JSON.parse(localStorage.getItem('mpump_expense') || '[]'),
    fuelSettings: JSON.parse(localStorage.getItem('mpump_fuel_settings') || '{}'),
    exportDate: new Date().toISOString()
  };
  
  console.log('Backup data created:', backupData);
  
  // Download it
  const dataStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test-backup.json';
  link.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Backup download triggered');
} catch (e) {
  console.error('❌ Backup failed:', e);
}
```

## Alternative: Use Copy to Clipboard

If download doesn't work, use the "📋 Copy Backup Data" button:
1. Click the button
2. Open Notepad or any text editor
3. Paste (Ctrl+V)
4. Save as `backup.json`

## Need More Help?

Run this diagnostic:
```javascript
// Full diagnostic
const diagnostic = {
  hasLocalStorageService: typeof localStorageService !== 'undefined',
  hasFileSystemAPI: 'showSaveFilePicker' in window,
  isAndroid: typeof window.MPumpCalcAndroid !== 'undefined',
  localStorageSize: Object.keys(localStorage).length,
  canCreateBlob: typeof Blob !== 'undefined',
  canCreateURL: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
};

console.table(diagnostic);
```

This will show exactly what's supported in your browser.
