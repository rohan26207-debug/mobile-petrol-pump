# Backup System Explanation - Mobile Petrol Pump App

## Current Backup System

### 📁 Current Implementation: File System Auto-Backup

The app currently has a **File System-based auto-backup** feature, NOT email backup.

**Location:** `/app/frontend/src/hooks/use-auto-backup.js`

#### How It Works:

1. **Manual Folder Selection** (One-time setup)
   - User selects a folder on their device
   - Uses Chrome/Edge File System Access API
   - Folder handle stored in IndexedDB

2. **Automatic Backup on Data Change**
   - Monitors: Sales, Credit, Income, Expense, Fuel Settings
   - Triggers when any data changes
   - 5-second debounce to avoid excessive backups
   - Creates backup file: `mpump-backup-YYYY-MM-DD.json`

3. **Backup Storage**
   - Saves to selected local folder
   - JSON format with all app data
   - Overwrites daily backup file
   - **NO 24-hour schedule** - triggers on data changes

#### Current Limitations:

❌ **NO Email Backup** - Only local file system
❌ **NO 24-hour Schedule** - Only on data changes
❌ **Browser-Only** - Doesn't work in Android WebView
❌ **Chrome/Edge Only** - File System Access API not universal

---

## ❌ Email Backup: NOT CURRENTLY IMPLEMENTED

Your app **does not have email backup functionality** yet.

---

## 🔧 How Email Backup COULD Work (Implementation Guide)

If you want to add email backup that syncs once every 24 hours, here's how it would work:

### Architecture Option 1: Backend Email Service (Recommended)

#### Components Needed:

1. **Backend API Endpoint** (`/api/backup/email`)
   - Receives backup data from frontend
   - Sends email with attachment
   - Uses email service (SendGrid, AWS SES, SMTP)

2. **Frontend Scheduler**
   - Checks last backup time in localStorage
   - Triggers backup if 24 hours passed
   - Sends data to backend API

3. **Email Configuration**
   - User provides email address in settings
   - Backend sends backup JSON as email attachment
   - Subject: "MPump Daily Backup - [Date]"

#### Implementation Flow:

```
┌─────────────┐
│   Frontend  │
│   (React)   │
│             │
│  Timer: 24h │
│  Check      │
└──────┬──────┘
       │ 1. Check if 24 hours passed
       │
       ▼
┌──────────────┐
│ localStorage │
│              │
│ lastBackup:  │
│ 2024-11-01   │
└──────┬───────┘
       │ 2. If yes, export all data
       │
       ▼
┌──────────────────┐
│  Backend API     │
│  /api/backup/    │
│  email           │
└────────┬─────────┘
         │ 3. Send to backend
         │
         ▼
┌──────────────────┐
│  Email Service   │
│  (SendGrid/SMTP) │
│                  │
│  Sends email     │
│  with JSON       │
│  attachment      │
└────────┬─────────┘
         │ 4. Email sent
         │
         ▼
┌──────────────────┐
│   User Email     │
│   Inbox          │
│                  │
│   📧 MPump       │
│   Backup.json    │
└──────────────────┘
```

---

### Architecture Option 2: Android-Only (No Backend)

For Android WebView, you could use:

1. **Android Native Email Intent**
   - Export data as JSON file
   - Use Android Intent to open email app
   - Attach backup file
   - User manually sends email

2. **Implementation:**
```javascript
// Frontend calls Android method
if (window.MPumpCalcAndroid && window.MPumpCalcAndroid.sendBackupEmail) {
  const backupData = JSON.stringify(localStorageService.exportAllData());
  window.MPumpCalcAndroid.sendBackupEmail(backupData, userEmail);
}
```

3. **Android Java Method:**
```java
@JavascriptInterface
public void sendBackupEmail(String backupJson, String recipientEmail) {
    Intent emailIntent = new Intent(Intent.ACTION_SEND);
    emailIntent.setType("application/json");
    emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[]{recipientEmail});
    emailIntent.putExtra(Intent.EXTRA_SUBJECT, "MPump Daily Backup");
    
    // Create file and attach
    File backupFile = new File(getExternalFilesDir(null), "backup.json");
    // Write backupJson to file
    // Attach file to email
    
    startActivity(Intent.createChooser(emailIntent, "Send Backup"));
}
```

---

## 📋 Implementation Steps for Email Backup

### Step 1: Choose Email Service

**Options:**
1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - Easy API integration
   - No SMTP configuration needed

2. **AWS SES**
   - Pay per email
   - Requires AWS account
   - More complex setup

3. **SMTP (Gmail, etc.)**
   - Free but limited
   - Less reliable
   - Security concerns

### Step 2: Backend Implementation

**Install Dependencies:**
```bash
pip install sendgrid python-dotenv
```

**Add to backend/server.py:**
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment
import base64

@api_router.post("/backup/email")
async def send_backup_email(backup_data: dict, user_email: str):
    try:
        # Convert backup to JSON string
        backup_json = json.dumps(backup_data)
        backup_base64 = base64.b64encode(backup_json.encode()).decode()
        
        # Create email
        message = Mail(
            from_email='noreply@yourapp.com',
            to_emails=user_email,
            subject=f'MPump Daily Backup - {datetime.now().strftime("%Y-%m-%d")}',
            html_content='<p>Your daily backup is attached.</p>'
        )
        
        # Attach backup file
        attachment = Attachment()
        attachment.file_content = backup_base64
        attachment.file_name = f'mpump-backup-{datetime.now().strftime("%Y-%m-%d")}.json'
        attachment.file_type = 'application/json'
        attachment.disposition = 'attachment'
        message.attachment = attachment
        
        # Send email
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        
        return {"success": True, "status": response.status_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Add to backend/.env:**
```
SENDGRID_API_KEY=your_api_key_here
```

### Step 3: Frontend Implementation

**Create Email Backup Hook:**
```javascript
// /app/frontend/src/hooks/use-email-backup.js
import { useEffect } from 'react';
import localStorageService from '../services/localStorage';

export const useEmailBackup = () => {
  useEffect(() => {
    const checkAndBackup = async () => {
      // Get settings
      const settings = localStorage.getItem('email_backup_settings');
      if (!settings) return;
      
      const { enabled, email, lastBackupTime } = JSON.parse(settings);
      if (!enabled || !email) return;
      
      // Check if 24 hours passed
      const now = new Date();
      const lastBackup = lastBackupTime ? new Date(lastBackupTime) : null;
      const hoursSinceBackup = lastBackup 
        ? (now - lastBackup) / (1000 * 60 * 60) 
        : 25; // First time, trigger backup
      
      if (hoursSinceBackup < 24) return;
      
      try {
        // Export all data
        const backupData = localStorageService.exportAllData();
        
        // Send to backend
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/backup/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            backup_data: backupData,
            user_email: email
          })
        });
        
        if (response.ok) {
          // Update last backup time
          localStorage.setItem('email_backup_settings', JSON.stringify({
            enabled,
            email,
            lastBackupTime: now.toISOString()
          }));
          console.log('✅ Email backup sent successfully');
        }
      } catch (error) {
        console.error('Email backup failed:', error);
      }
    };
    
    // Check every hour
    checkAndBackup();
    const interval = setInterval(checkAndBackup, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
};
```

**Add Settings UI:**
```jsx
// In Settings component
const [emailBackup, setEmailBackup] = useState({
  enabled: false,
  email: ''
});

const saveEmailBackupSettings = () => {
  localStorage.setItem('email_backup_settings', JSON.stringify({
    ...emailBackup,
    lastBackupTime: null
  }));
};

// UI
<div>
  <h3>Email Backup</h3>
  <label>
    <input 
      type="checkbox" 
      checked={emailBackup.enabled}
      onChange={e => setEmailBackup({...emailBackup, enabled: e.target.checked})}
    />
    Enable Daily Email Backup
  </label>
  <input 
    type="email"
    value={emailBackup.email}
    onChange={e => setEmailBackup({...emailBackup, email: e.target.value})}
    placeholder="your@email.com"
  />
  <button onClick={saveEmailBackupSettings}>Save</button>
</div>
```

---

## 🔒 Security Considerations

1. **Email Privacy**
   - Backup contains sensitive business data
   - Use secure email service (TLS/SSL)
   - Consider encryption

2. **API Key Protection**
   - Store SendGrid API key in backend .env
   - Never expose in frontend

3. **Rate Limiting**
   - Prevent abuse of backup endpoint
   - Limit to 1 backup per user per day

4. **Data Size**
   - Email attachment size limits (typically 25MB)
   - Large databases may need compression

---

## 💰 Cost Estimate

### SendGrid Free Tier:
- 100 emails/day: FREE
- Perfect for personal/small business use
- 1 backup per day = 30 backups/month

### AWS SES:
- $0.10 per 1,000 emails
- 1 backup per day = $0.003/month
- Essentially free

---

## 📊 Current vs Proposed Backup

| Feature | Current (File System) | Proposed (Email) |
|---------|----------------------|------------------|
| **Automatic** | ✅ On data change | ✅ Every 24 hours |
| **Off-site Backup** | ❌ Local only | ✅ Cloud (email) |
| **Android Support** | ❌ Browser only | ✅ Works everywhere |
| **Setup Complexity** | Easy | Medium |
| **Requires Backend** | ❌ No | ✅ Yes |
| **Cost** | Free | Free (SendGrid) |
| **Data Access** | Local folder | Email inbox |

---

## 🎯 Recommendation

**For your Android app, I recommend:**

1. **Short Term (Quick Fix):**
   - Keep current file system backup for web
   - Add Android email intent for manual backup
   - No backend changes needed

2. **Long Term (Best Solution):**
   - Implement backend email service with SendGrid
   - Add 24-hour scheduled backup
   - Works on all platforms
   - Automatic off-site backup

---

## ❓ Summary

**Current Status:**
- ✅ File System Auto-Backup: YES (browser only)
- ❌ Email Backup: NO
- ❌ 24-Hour Schedule: NO (only on data changes)

**To Add Email Backup:**
- Need backend API endpoint
- Need email service (SendGrid recommended)
- Need frontend scheduler (check every hour)
- Need settings UI for user email

**Complexity:** Medium (2-3 hours development)
**Cost:** Free (SendGrid free tier)
**Benefit:** Automatic off-site backup every 24 hours

---

Would you like me to implement the email backup feature for you?
