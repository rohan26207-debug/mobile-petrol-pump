# 🔍 Troubleshooting "URL Not Found" Backup Error

## ❌ Error: "Requested URL not found on this server"

This error when clicking backup can have several causes. Let's diagnose and fix it.

---

## 🔎 Possible Causes

### **1. Google APIs Not Loading (Most Likely)**

The backup feature loads Google API scripts from:
- `https://apis.google.com/js/api.js`
- `https://accounts.google.com/gsi/client`

**If these fail to load**, you'll get errors.

**Common reasons:**
- Network/firewall blocking Google domains
- Ad blocker blocking scripts
- CSP (Content Security Policy) restrictions
- No internet connection

---

### **2. Backend API Endpoint Missing**

The app might be trying to call a backend endpoint that doesn't exist.

---

### **3. Wrong Backend URL Configuration**

The frontend might be pointing to the wrong backend URL.

---

## ✅ Quick Diagnosis

### **Step 1: Open Browser Console**

1. **Open the app in browser**
2. **Press F12** or **Right-click → Inspect**
3. **Go to "Console" tab**
4. **Click "Backup" button**
5. **Look for error messages**

**What to look for:**
```
❌ Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
❌ Failed to load https://apis.google.com/js/api.js
❌ 404 Not Found
❌ CORS error
```

---

### **Step 2: Check Network Tab**

1. **Stay in DevTools (F12)**
2. **Go to "Network" tab**
3. **Click "Backup" button**
4. **Look for failed requests (red)**

**Check:**
- Which URL is failing?
- What's the status code (404, 500, etc.)?
- What's the error message?

---

## 🛠️ Solutions Based on Error Type

### **Solution 1: Google API Script Blocked**

**If you see:**
```
Failed to load https://apis.google.com/js/api.js
ERR_BLOCKED_BY_CLIENT
```

**Fix: Disable Ad Blocker**
1. Click ad blocker icon in browser
2. Disable for your app domain
3. Refresh page
4. Try backup again

**Or try different browser:**
- Chrome without extensions
- Firefox
- Safari

---

### **Solution 2: Network/Internet Issue**

**If scripts timeout or fail to load:**

1. **Check internet connection**
2. **Try accessing** https://apis.google.com/js/api.js **directly in browser**
3. **If that fails**, check firewall/proxy settings

---

### **Solution 3: Backend URL Wrong**

**Check if backend is running:**

Open a new browser tab and go to:
```
http://localhost:8001/api/
```

**Should see:**
```json
{"message":"Hello World"}
```

**If you see error:**
- Backend is not running
- Wrong port

**Fix: Restart backend**
```bash
sudo supervisorctl restart backend
```

---

### **Solution 4: CORS Error**

**If you see:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**This means backend CORS is misconfigured.**

**Check backend CORS settings:**
File: `/app/backend/server.py`

Should have:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Test Google APIs Manually

### **Test if Google APIs are accessible:**

**Open browser console (F12) and paste:**

```javascript
// Test loading Google API
var script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.onload = function() {
    console.log('✅ Google API loaded successfully');
};
script.onerror = function() {
    console.error('❌ Failed to load Google API');
};
document.head.appendChild(script);
```

**If it logs ✅**, Google APIs work fine.  
**If it logs ❌**, Google APIs are blocked.

---

## 🔧 Workaround: Use Manual Backup Instead

If Google Drive backup isn't working, you can still backup manually:

### **Manual JSON Backup:**

1. **Go to Settings → Backup**
2. **Click "💾 Export Data Backup"** (instead of Google Drive backup)
3. **File downloads** to your Downloads folder
4. **Save this file** safely

### **Manual JSON Restore:**

1. **Go to Settings → Backup**
2. **Click "📥 Import Data Backup"**
3. **Select your backup JSON file**
4. **Data restores**

**This works without Google Drive or internet!**

---

## 🌐 Check Which Environment You're On

### **Are you testing on:**

**A) Local Development (localhost)**
- URL: `http://localhost:3000`
- Backend: `http://localhost:8001`

**B) Production (Vercel/Preview)**
- URL: `https://mobilepetrolpump.vercel.app`
- Backend: May need to be deployed separately

**C) Android App**
- Loaded from: `file:///android_asset/index.html`
- Backend URL: Check APP_URL in MainActivity.java

---

## 📱 If Testing on Android App

**The error might be different on Android:**

1. **Check if APP_URL is correct** in MainActivity.java
2. **Try changing to online mode:**
   ```java
   private static final String APP_URL = "https://mobilepetrolpump.vercel.app/";
   ```
3. **Rebuild APK**
4. **Test again**

---

## 🔍 Advanced Debugging

### **Check Backend Logs:**

```bash
# Check for errors
tail -n 100 /var/log/supervisor/backend.err.log

# Check backend requests
tail -n 50 /var/log/supervisor/backend.out.log
```

### **Check Frontend Logs:**

```bash
# Check for compilation errors
tail -n 50 /var/log/supervisor/frontend.err.log
```

### **Test Backend Health:**

```bash
# Should return Hello World
curl http://localhost:8001/api/

# If no response, backend is down
sudo supervisorctl status backend
sudo supervisorctl restart backend
```

---

## ✅ Step-by-Step Fix Procedure

### **1. Verify Services Running:**

```bash
sudo supervisorctl status
```

All should show `RUNNING`.

**If not:**
```bash
sudo supervisorctl restart all
```

---

### **2. Test Backend:**

```bash
curl http://localhost:8001/api/
```

Should return: `{"message":"Hello World"}`

---

### **3. Open Browser Console:**

1. Open app
2. Press F12
3. Go to Console tab
4. Clear all messages
5. Click "Backup" button
6. Read error messages

---

### **4. Check Network Tab:**

1. F12 → Network tab
2. Click "Backup" button
3. Look for red/failed requests
4. Click on failed request
5. See response/error

---

### **5. Try Manual Backup:**

If Google Drive doesn't work:
- Use "Export Data Backup" button instead
- Downloads JSON file
- Works offline

---

## 💡 Most Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **Ad blocker blocking Google** | Disable ad blocker |
| **No internet** | Check connection |
| **Backend down** | `sudo supervisorctl restart backend` |
| **Wrong backend URL** | Check .env file |
| **Browser cache** | Hard refresh (Ctrl+Shift+R) |
| **CORS error** | Check backend CORS config |

---

## 📋 Information to Provide

**If still having issues, please provide:**

1. **Exact error message** from browser console
2. **Failed URL** from Network tab
3. **Environment** (localhost/production/Android)
4. **Browser** being used
5. **Backend status:** `sudo supervisorctl status backend`
6. **Screenshot** of console errors (if possible)

---

## 🚀 Quick Test Script

**Paste this in browser console to diagnose:**

```javascript
console.log('=== Backup Diagnostic ===');

// 1. Check if we're online
console.log('1. Online:', navigator.onLine);

// 2. Check backend URL
console.log('2. Backend URL:', process.env.REACT_APP_BACKEND_URL);

// 3. Test backend
fetch(process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api/')
  .then(r => r.json())
  .then(data => console.log('3. Backend response:', data))
  .catch(e => console.error('3. Backend error:', e));

// 4. Test Google APIs
var s = document.createElement('script');
s.src = 'https://apis.google.com/js/api.js';
s.onload = () => console.log('4. ✅ Google APIs accessible');
s.onerror = () => console.error('4. ❌ Google APIs blocked');
document.head.appendChild(s);

// 5. Check localStorage
console.log('5. LocalStorage works:', !!window.localStorage);

console.log('=== End Diagnostic ===');
```

**Copy the output and share it for detailed help!**

---

**Last Updated:** November 3, 2025  
**For:** Mobile Petrol Pump App  
**Issue:** "Requested URL not found on this server" backup error
