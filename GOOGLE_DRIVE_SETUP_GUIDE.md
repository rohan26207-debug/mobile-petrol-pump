# Google Drive Backup Setup Guide
**Complete Step-by-Step Instructions**

## Part 1: Google Cloud Console Setup (One-Time)

### Step 1: Go to Google Cloud Console
1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with YOUR personal Gmail account (e.g., yourname@gmail.com)

### Step 2: Create a New Project
1. At the top, you'll see "Select a project" dropdown
2. Click on it
3. Click **"NEW PROJECT"** button (top right)
4. Enter Project Details:
   - **Project name:** `Mobile Petrol Pump` (or any name you like)
   - **Organization:** Leave as is (No organization)
5. Click **"CREATE"**
6. Wait 10-15 seconds for project creation
7. You'll see "Project created" notification

### Step 3: Enable Google Drive API
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   (Or use the hamburger menu ☰ if sidebar is hidden)
2. In the search bar, type: **"Google Drive API"**
3. Click on **"Google Drive API"** from results
4. Click the blue **"ENABLE"** button
5. Wait a few seconds
6. You'll see "API enabled" confirmation

### Step 4: Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Click **"CREATE"**
4. Fill in the required fields:
   - **App name:** `Mobile Petrol Pump Backup`
   - **User support email:** YOUR email (select from dropdown)
   - **Developer contact email:** YOUR email
5. Click **"SAVE AND CONTINUE"**
6. On "Scopes" page, click **"ADD OR REMOVE SCOPES"**
7. Find and check: **`../auth/drive.file`** (allows app to access only files it creates)
8. Click **"UPDATE"** at bottom
9. Click **"SAVE AND CONTINUE"**
10. On "Test users" page:
    - Click **"+ ADD USERS"**
    - Enter YOUR email address
    - Click **"ADD"**
11. Click **"SAVE AND CONTINUE"**
12. Review summary, click **"BACK TO DASHBOARD"**

### Step 5: Create OAuth Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (at top)
3. Select **"OAuth client ID"**
4. Choose Application type: **"Web application"**
5. Enter Name: **"Mobile Petrol Pump Web Client"**
6. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**:
   - Add: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Add: `https://fuel-app-sync.preview.emergentagent.com`
   - If you have Vercel URL, add that too
7. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**:
   - Add: `https://fuel-app-sync.preview.emergentagent.com`
8. Click **"CREATE"**

### Step 6: Copy Your Client ID
1. A popup appears: "OAuth client created"
2. **COPY the Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
3. Paste it somewhere safe (Notepad/Notes app)
4. Click **"OK"**

**✅ Google Cloud Console Setup Complete!**

---

## Part 2: Share Your Client ID with Me

Now, please share your Client ID here so I can integrate it into your app.

**Example format:**
```
123456789-abcdefghijk.apps.googleusercontent.com
```

Once you share it, I'll:
1. Add Google Drive backup button to Settings
2. Implement backup to YOUR Google Drive
3. Implement restore from YOUR Google Drive
4. Update Android app

---

## Part 3: How It Will Work (After Implementation)

### Backup Process:
1. Open app → Settings → Cloud Sync tab
2. Click **"Backup to Google Drive"** button
3. Google login popup appears
4. Login with YOUR Gmail account
5. Google asks permission: "Allow Mobile Petrol Pump to access files it creates in Google Drive?"
6. Click **"Allow"**
7. App uploads backup file: `mobile-petrol-pump-backup-2025-11-03.json`
8. Done! ✅

### Restore Process:
1. Open app → Settings → Cloud Sync tab
2. Click **"Restore from Google Drive"** button
3. Login (if not already)
4. App shows list of backup files from YOUR Drive
5. Select the backup you want
6. Click "Restore"
7. All data restored! ✅

### What Gets Backed Up:
- Customers
- Credit Sales
- Payments/Receipts
- Daily Sales
- Income & Expenses
- Stock Records
- Fuel Settings
- Notes
- Contact Info
- All preferences

---

## Part 4: Verification

After implementation, you can verify:
1. Go to https://drive.google.com/
2. Login with YOUR Gmail
3. You'll see backup files created by the app
4. You can download them, view them, delete them
5. They're JSON files - human-readable

---

## Troubleshooting

**If you get stuck:**
- **Can't find "APIs & Services"**: Click the ☰ hamburger menu (top left)
- **Don't see "CREATE CREDENTIALS"**: Make sure you enabled Google Drive API first
- **OAuth consent screen error**: Make sure you added YOUR email as a test user

**Security Note:**
- Your Client ID is safe to share (it's not a secret key)
- It only allows people to request permission from Google
- Actual access requires YOUR approval each time

---

## Next Steps

**Please share your Client ID here, and I'll implement the Google Drive backup feature in your app!**

Format: `123456789-abc...apps.googleusercontent.com`
