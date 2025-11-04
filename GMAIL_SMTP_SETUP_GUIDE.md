# Gmail SMTP Email Backup - Setup Guide

## ✅ Implementation Complete

**Gmail SMTP is now the ONLY email backup method** (SendGrid removed)

---

## 📋 Quick Setup (3 Steps)

### Step 1: Enable 2-Step Verification

1. Go to: **https://myaccount.google.com/security**
2. Find "2-Step Verification"
3. Click **"Get Started"**
4. Follow the prompts to enable it (use phone number)
5. ✅ Confirm it's enabled

**Note:** This is required for App Passwords to work.

---

### Step 2: Create App Password

1. Go to: **https://myaccount.google.com/apppasswords**
2. You'll see "App passwords" page
3. In the "Select app" dropdown: Choose **"Mail"**
4. In the "Select device" dropdown: Choose **"Other (Custom name)"**
5. Type: **"MPump Backup"**
6. Click **"Generate"**
7. You'll see a 16-character password like: **"abcd efgh ijkl mnop"**
8. ✅ Copy this password (you won't see it again!)

---

### Step 3: Update Backend Configuration

1. Open: `/app/backend/.env`
2. Replace these two lines:
   ```
   GMAIL_USERNAME="your.email@gmail.com"
   GMAIL_APP_PASSWORD="your_app_password_here"
   ```
   
   With your actual values:
   ```
   GMAIL_USERNAME="yourname@gmail.com"
   GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
   ```

3. Save the file

4. Restart backend:
   ```bash
   sudo supervisorctl restart backend
   ```

---

## 🧪 Testing Email Backup

### Test Immediately (Don't wait 24 hours):

1. Open the app
2. Go to **Settings → Contact**
3. Scroll down to **"Email Backup"** section
4. Enter your email address
5. Check **"Enable automatic email backup"**
6. Click **"Save Email Backup Settings"**

### Trigger Manual Test:

Open browser console and run:
```javascript
// Export all data
const backupData = JSON.parse(localStorage.getItem('salesData') || '[]');

// Send to backend
fetch('http://localhost:8001/api/backup/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    backup_data: {
      salesData: backupData,
      test: true
    },
    user_email: 'your@email.com'
  })
})
.then(res => res.json())
.then(data => console.log('Backup result:', data))
.catch(err => console.error('Backup error:', err));
```

---

## 📧 What You'll Receive

You'll get an email from your Gmail account with:

**Subject:** MPump Daily Backup - 2025-11-01

**Attachment:** `mpump-backup-2025-11-01.json`

**Content:**
- HTML formatted email
- Professional looking
- Lists what's included in backup
- JSON file with all your data

---

## ⚙️ How Automatic Backup Works

### Scheduling:
1. App checks every hour if 24 hours passed
2. When 24 hours pass since last backup
3. Automatically exports all data
4. Sends to backend API
5. Backend emails via Gmail SMTP
6. Updates last backup timestamp
7. Repeats every 24 hours

### What Gets Backed Up:
- ✅ Sales Data (Reading Sales)
- ✅ Credit Records
- ✅ Income Records
- ✅ Expense Records
- ✅ Customer Data
- ✅ Fuel Settings
- ✅ Stock Data (all fuel types)
- ✅ Payment Records

---

## 🔒 Security

### App Password Security:
- ✅ It's NOT your Gmail password
- ✅ Stored only in backend .env (never in frontend)
- ✅ Can be revoked anytime from Google Account
- ✅ Limited to email sending only
- ✅ Doesn't give full account access

### To Revoke Access:
1. Go to: https://myaccount.google.com/apppasswords
2. Find "MPump Backup"
3. Click "Remove"
4. App can no longer send emails

---

## ❓ Troubleshooting

### Error: "Gmail authentication failed"

**Cause:** Wrong username or app password

**Fix:**
1. Check `/app/backend/.env` for typos
2. Make sure 2-Step Verification is enabled
3. Create new App Password
4. Update .env with new password
5. Restart backend: `sudo supervisorctl restart backend`

---

### Error: "Email service not configured"

**Cause:** .env variables not set or backend not restarted

**Fix:**
1. Verify .env has GMAIL_USERNAME and GMAIL_APP_PASSWORD
2. Make sure values are NOT the default placeholders
3. Restart backend: `sudo supervisorctl restart backend`

---

### Email not received after 24 hours

**Check:**
1. Look in Spam/Junk folder
2. Check browser console for errors: `F12 → Console`
3. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
4. Verify "Enable automatic email backup" is checked in settings
5. Verify email address is correct

---

### How to check if it's working:

**Backend logs:**
```bash
tail -f /var/log/supervisor/backend.err.log
```

Look for:
- ✅ `"Email backup sent to your@email.com via Gmail SMTP"`
- ❌ `"Gmail SMTP not configured"`
- ❌ `"Gmail SMTP authentication failed"`

**Frontend console:**
```javascript
// Check settings
console.log(localStorage.getItem('email_backup_settings'))

// Should show:
// {"enabled":true,"email":"your@email.com","lastBackupTime":"2025-11-01T10:30:00.000Z"}
```

---

## 📊 Limits & Restrictions

### Gmail SMTP Limits:
- ✅ 500 emails per day (plenty for daily backup)
- ✅ 25 MB attachment limit (your backup will be ~1-5 MB)
- ✅ Free forever
- ⚠️ Gmail might flag as spam if sending too frequently

### Backup Frequency:
- Automatically: Every 24 hours
- Cannot be changed (hard-coded for safety)
- First backup: 24 hours after enabling

---

## 🎯 Current Configuration

**File:** `/app/backend/.env`
```bash
# Gmail SMTP Email Backup Configuration
GMAIL_USERNAME="your.email@gmail.com"
GMAIL_APP_PASSWORD="your_app_password_here"
```

**Status:**
- ✅ Backend code: READY
- ✅ Frontend UI: READY
- ⏳ Gmail credentials: NEEDS YOUR INPUT
- ⏳ 2-Step Verification: NEEDS YOUR SETUP
- ⏳ App Password: NEEDS YOUR CREATION

---

## 📝 Summary

**To activate email backup:**

1. ✅ Enable 2-Step Verification on Gmail
2. ✅ Create App Password
3. ✅ Update .env with your credentials
4. ✅ Restart backend
5. ✅ Enable in app settings (Settings → Contact)
6. ✅ Wait 24 hours or test manually

**Benefits:**
- ✅ No external service (SendGrid) needed
- ✅ Uses your existing Gmail
- ✅ Simple setup (just 3 steps)
- ✅ Free forever
- ✅ Automatic daily backups
- ✅ Secure (App Password, not real password)

---

**Questions? Issues? Check the troubleshooting section above!**
