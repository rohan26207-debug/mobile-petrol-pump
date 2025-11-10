# Firebase Email Extension Setup Guide

## Overview
This guide explains how to set up the Firebase Trigger Email extension to automatically send notification emails to the admin when new users sign up.

## Prerequisites
- Firebase project: `manager-petrol-pump-f55db`
- Admin email: `rohan.26207@gmail.com`
- Firebase Console access with billing enabled (Blaze plan required for extensions)

## Step-by-Step Setup

### 1. Install Firebase Trigger Email Extension

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `manager-petrol-pump-f55db`
3. Click on **Extensions** in the left sidebar
4. Click **Install Extension**
5. Search for **"Trigger Email from Firestore"**
6. Click **Install** on the extension card

### 2. Configure Extension Settings

During installation, you'll be prompted to configure these settings:

**Email Documents Collection:**
```
notifications
```

**SMTP Connection:**
- **Option 1 - Gmail (Recommended for testing):**
  - SMTP Server: `smtp.gmail.com`
  - SMTP Port: `587`
  - Email: Your Gmail address
  - Password: App-specific password (see Gmail App Password setup below)

- **Option 2 - SendGrid (Recommended for production):**
  - SMTP Server: `smtp.sendgrid.net`
  - SMTP Port: `587`
  - Email: `apikey`
  - Password: Your SendGrid API key

**Default FROM Address:**
```
noreply@manager-petrol-pump-f55db.firebaseapp.com
```

**Default TO Address (leave blank - we'll set per document):**
```
(Leave empty)
```

### 3. Gmail App Password Setup (if using Gmail)

1. Go to Google Account: https://myaccount.google.com
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **Generate** and select:
   - App: Mail
   - Device: Other (Custom name: "Firebase Email Extension")
5. Copy the 16-character password
6. Use this password in the SMTP configuration

### 4. Test Email Configuration

After installation, test the email functionality:

```javascript
// Add this document to Firestore 'notifications' collection
{
  to: "rohan.26207@gmail.com",
  message: {
    subject: "Test Email from Firebase Extension",
    text: "This is a test email to verify the extension is working.",
    html: "<h1>Test Email</h1><p>Extension is working correctly!</p>"
  }
}
```

The extension will automatically send the email and update the document with delivery status.

### 5. Firestore Security Rules

Update your Firestore security rules to allow the extension to read/write notification documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing rules...
    
    // Notification documents for email extension
    match /notifications/{notificationId} {
      // Allow authenticated users to create notifications
      allow create: if request.auth != null;
      // Extension needs read/write access (runs with admin privileges)
      allow read, write: if true;
    }
  }
}
```

## Email Template for New Signups

The application automatically creates notification documents with this structure:

```javascript
{
  to: "rohan.26207@gmail.com",
  message: {
    subject: "New User Signup - M.Petrol Pump",
    html: `
      <h2>New User Signup Notification</h2>
      <p>A new user has signed up and is awaiting approval.</p>
      <ul>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>User ID:</strong> ${userId}</li>
        <li><strong>Signup Date:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>Please login to the admin panel to approve or reject this user.</p>
      <p><a href="https://your-app-url.com/admin">Go to Admin Panel</a></p>
    `
  },
  type: "new_signup",
  userEmail: "user@example.com",
  userId: "firebase-uid",
  createdAt: "timestamp",
  adminEmail: "rohan.26207@gmail.com",
  status: "pending"
}
```

## Customizing Email Template

To customize the email template, update the notification document creation in `LoginScreen.jsx`:

1. Open `/app/frontend/src/components/LoginScreen.jsx`
2. Find the `handleSignUp` function
3. Modify the notification document structure to include email template

Example:
```javascript
await setDoc(doc(db, 'notifications', user.uid), {
  to: 'rohan.26207@gmail.com',
  message: {
    subject: 'New User Signup - M.Petrol Pump',
    html: `
      <h2>New User Signup</h2>
      <p>Email: ${user.email}</p>
      <p>User ID: ${user.uid}</p>
      <p>Time: ${new Date().toLocaleString()}</p>
    `
  },
  type: 'new_signup',
  userEmail: user.email,
  userId: user.uid,
  createdAt: serverTimestamp(),
  status: 'pending'
});
```

## Troubleshooting

### Email Not Sending

1. **Check Extension Status:**
   - Go to Firebase Console → Extensions
   - Verify the extension is installed and enabled

2. **Check Firestore Document:**
   - Go to Firestore → `notifications` collection
   - Check if document has `delivery` field with error details

3. **Check Extension Logs:**
   - Go to Firebase Console → Functions
   - Click on the extension function
   - Check logs for errors

4. **Verify SMTP Credentials:**
   - Test credentials manually using a tool like Postman
   - Ensure app password is correct (for Gmail)

### Common Errors

**Error: "Authentication failed"**
- Solution: Regenerate Gmail app password or verify SendGrid API key

**Error: "Connection timeout"**
- Solution: Check SMTP server and port settings

**Error: "Recipient not allowed"**
- Solution: Verify email address in `to` field is correct

## Cost Considerations

- Firebase Extensions require **Blaze plan** (pay-as-you-go)
- Email Extension pricing:
  - Free tier: 10,000 emails/month
  - Beyond free tier: $0.10 per 1,000 emails
- Outbound emails via SMTP are free if using own SMTP server

## Alternative: Cloud Functions (Advanced)

If you prefer more control, you can create a Cloud Function instead:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize functions: `firebase init functions`
3. Create email function in `functions/index.js`
4. Deploy: `firebase deploy --only functions`

Example function:
```javascript
exports.sendNewUserEmail = functions.firestore
  .document('notifications/{userId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    // Send email using nodemailer or SendGrid SDK
  });
```

## Support

For issues with the Firebase Extension:
- Firebase Extension Documentation: https://firebase.google.com/products/extensions
- Firebase Support: https://firebase.google.com/support
- Community Forums: https://stackoverflow.com/questions/tagged/firebase

---

**Last Updated:** November 2025
