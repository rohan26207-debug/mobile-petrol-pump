# Admin Approval System - User Guide

## Overview
The application now implements an admin approval workflow to control who can access the system. New users cannot login until their account is approved by an administrator.

## How It Works

### For New Users (Signup Process)

1. **Sign Up:**
   - User visits the application
   - Clicks "Create Account"
   - Enters email and password (minimum 6 characters)
   - Clicks "Create Account"

2. **Account Created:**
   - Firebase Authentication account is created
   - User document is created in Firestore with `approved: false`
   - Notification email is sent to admin (rohan.26207@gmail.com)
   - User is immediately signed out

3. **Pending Approval:**
   - User sees message: "Account Pending Approval"
   - Message explains that admin will review the account
   - User cannot login until approved

4. **After Approval:**
   - Once admin approves the account
   - User can login with their credentials
   - Full access to the application is granted

### For Existing Users (Login Process)

1. **Login Attempt:**
   - User enters email and password
   - Clicks "Sign In"

2. **Approval Check:**
   - System authenticates with Firebase
   - Checks Firestore for approval status
   - If `approved: false`, user is signed out immediately
   - Error message: "Your account is pending approval"

3. **Successful Login:**
   - If `approved: true`, user can access the app
   - Normal application functionality

## Admin Responsibilities

### Email Notifications

When a new user signs up, you (admin) will receive an email at **rohan.26207@gmail.com** with:
- User's email address
- User ID (Firebase UID)
- Signup timestamp
- Link to admin panel (once implemented)

### Approval Process (Current Method)

**Until admin panel is built, approve users via Firebase Console:**

1. **Go to Firebase Console:**
   - URL: https://console.firebase.google.com
   - Project: `manager-petrol-pump-f55db`

2. **Navigate to Firestore:**
   - Click **Firestore Database** in left sidebar
   - Click on **users** collection

3. **Find Pending User:**
   - Look for documents where `approved: false`
   - Check the email address to verify it's legitimate

4. **Approve User:**
   - Click on the user document
   - Find the `approved` field
   - Change value from `false` to `true`
   - Click **Update**
   - Optionally add:
     - `approvedAt`: Current timestamp
     - `approvedBy`: Your admin identifier

5. **Reject User (Optional):**
   - If you want to reject a user
   - Go to Firebase Console → Authentication
   - Find the user by email
   - Click on the user
   - Click **Disable User** button

### Admin Panel (Future Enhancement)

A dedicated admin panel will be created with these features:
- Dashboard showing pending approvals
- One-click approve/reject buttons
- User management interface
- Approval history and logs
- Email notifications on approval/rejection

## Database Structure

### Users Collection (`users`)

Each user document contains:

```javascript
{
  uid: "firebase-user-id",           // Firebase Auth UID
  email: "user@example.com",         // User's email
  approved: false,                   // Approval status (boolean)
  createdAt: "2025-11-09T10:30:00Z", // Signup timestamp
  approvedAt: null,                  // Approval timestamp (null if not approved)
  approvedBy: null                   // Admin who approved (null if not approved)
}
```

### Notifications Collection (`notifications`)

Email notification documents:

```javascript
{
  type: "new_signup",                      // Notification type
  userEmail: "user@example.com",           // New user's email
  userId: "firebase-user-id",              // Firebase UID
  createdAt: "2025-11-09T10:30:00Z",      // Notification timestamp
  adminEmail: "rohan.26207@gmail.com",     // Admin email recipient
  status: "pending",                       // Status: pending/sent/failed
  to: "rohan.26207@gmail.com",            // Email recipient
  message: {                               // Email content
    subject: "New User Signup",
    html: "<h2>New User...</h2>"
  }
}
```

## Security Considerations

### Current Implementation

1. **Firestore Security Rules:**
   - Users can only read their own document
   - Only authenticated users can create user documents (during signup)
   - Approval status cannot be modified by regular users

2. **Authentication Flow:**
   - User is signed out immediately after signup
   - Login attempts check approval status before allowing access
   - Unapproved users cannot bypass the check

### Recommended Enhancements

1. **Email Verification:**
   - Add Firebase email verification before approval
   - Ensures user owns the email address

2. **Admin Authentication:**
   - Create separate admin accounts with special permissions
   - Use custom claims for role-based access

3. **Rate Limiting:**
   - Implement signup rate limiting to prevent abuse
   - Use Firebase App Check or similar service

4. **Audit Logging:**
   - Log all approval/rejection actions
   - Track admin activities

## Firestore Security Rules

Current rules for user approval system:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only allow create during signup (with approved: false)
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.approved == false;
      
      // Users cannot update their own approval status
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.approved == resource.data.approved;
    }
    
    // Notification documents (for email extension)
    match /notifications/{notificationId} {
      allow create: if request.auth != null;
      allow read, write: if true; // Email extension needs access
    }
    
    // Other collections...
  }
}
```

## Testing the Approval System

### Test Scenario 1: New User Signup

1. Open application in incognito/private window
2. Click "Create Account"
3. Enter test email: `test@example.com`
4. Enter password: `test123456`
5. Click "Create Account"
6. **Expected:** See "Account Pending Approval" message
7. Check Firebase Console → Firestore → users collection
8. **Expected:** New document with `approved: false`

### Test Scenario 2: Login Before Approval

1. Try to login with test credentials
2. Enter email: `test@example.com`
3. Enter password: `test123456`
4. Click "Sign In"
5. **Expected:** Error message "Your account is pending approval"
6. **Expected:** User remains on login screen

### Test Scenario 3: Approve and Login

1. Go to Firebase Console → Firestore
2. Find test user document
3. Change `approved: false` to `approved: true`
4. Go back to application
5. Login with test credentials
6. **Expected:** Successful login, access to application

### Test Scenario 4: Email Notification

1. Create new test account
2. Check email at rohan.26207@gmail.com
3. **Expected:** Notification email with user details
4. **Note:** Requires Firebase Email Extension setup

## Troubleshooting

### User Can Still Login Without Approval

**Issue:** Approval check not working
**Solution:**
1. Check `LoginScreen.jsx` implementation
2. Verify Firestore rules are deployed
3. Clear browser cache and try again

### Email Notifications Not Received

**Issue:** No notification emails
**Solution:**
1. Check Firebase Email Extension is installed
2. Verify SMTP configuration
3. Check Firestore `notifications` collection for error messages

### Cannot Approve Users in Firestore

**Issue:** Permission denied when updating documents
**Solution:**
1. Ensure you're logged into Firebase with correct account
2. Verify you have owner/editor role on the project
3. Check Firestore security rules

## Future Enhancements

### Planned Features

1. **Admin Panel Web Interface:**
   - Dedicated admin dashboard
   - List of pending approvals
   - One-click approve/reject
   - User search and filtering

2. **Email to Users:**
   - Approval confirmation email to users
   - Rejection notification with reason
   - Welcome email on first login

3. **Bulk Operations:**
   - Approve multiple users at once
   - Export user lists
   - Import approved user list

4. **Analytics:**
   - Signup trends
   - Approval rate statistics
   - Time to approve metrics

5. **Role Management:**
   - Multiple admin levels
   - Custom user roles
   - Permission management

## Support

For issues with the approval system:
- Check Firebase Console logs
- Review Firestore security rules
- Contact: rohan.26207@gmail.com

---

**Last Updated:** November 2025
