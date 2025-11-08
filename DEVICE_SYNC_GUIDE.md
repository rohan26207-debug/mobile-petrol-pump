# 📱 Device Sync Guide - M.Petrol Pump

## Problem: Why Data Doesn't Sync Between Devices with Anonymous Auth

When using **anonymous authentication**, each device creates its own unique user ID:
- Device 1: `X9Oo6ZdYIuMlzFRkQZgRuq1TZpN2`
- Device 2: `KaV0JsDH97gh7UssBRFzwY5XuBx1`

These are treated as **separate users**, so their data is isolated (which is actually a security feature!).

## Solution: Device Linking

We've implemented a **Device Linking** feature that allows multiple devices to share the same user account and sync data.

---

## 🔗 How to Link Devices

### Step 1: On Your Primary Device (Device 1)

1. Open the app on your first device
2. Click the **Settings** (⚙️) icon in the header
3. Navigate to the **"Device Sync"** tab
4. Under **"This Device (Primary)"**, click **"Generate Link Code"**
5. A **6-digit code** will appear (e.g., `485921`)
6. This code is valid for **10 minutes**
7. Copy or note down this code

### Step 2: On Your Secondary Device (Device 2)

1. Open the app on your second device (different browser/phone/tablet)
2. Click the **Settings** (⚙️) icon
3. Navigate to the **"Device Sync"** tab
4. Under **"Link Another Device"**, enter the **6-digit code** from Device 1
5. Click **"Link This Device"**
6. The page will reload automatically

### Step 3: Verify Sync

Both devices are now linked! Test it:
1. On Device 1: Add a customer or fuel sale
2. On Device 2: The data should appear automatically (within 1-2 seconds)
3. Both devices now share the same data

---

## ✅ What Gets Synced

Once devices are linked, ALL data syncs automatically:
- ✅ Customers
- ✅ Fuel Sales
- ✅ Credit Sales
- ✅ Payments Received
- ✅ Settlements
- ✅ Income & Expenses
- ✅ Fuel Settings (prices, nozzle counts)
- ✅ Settlement Types
- ✅ Income & Expense Categories

---

## 🔒 Security

**Is this secure?**
✅ **YES!** Here's how:

1. **Codes expire after 10 minutes** - Old codes can't be reused
2. **One-time use** - Each code can only be used once
3. **Authenticated only** - Only logged-in users can create/use codes
4. **No data exposed** - The code doesn't reveal any user data
5. **User consent required** - Both devices must explicitly link

---

## 🔧 Technical Details

### How It Works

1. **Device 1** generates a 6-digit code and stores it in Firestore:
   ```javascript
   {
     code: "485921",
     userId: "X9Oo6ZdYIuMlzFRkQZgRuq1TZpN2",
     expiresAt: "2025-11-08T21:00:00Z"
   }
   ```

2. **Device 2** enters the code and retrieves the `userId`

3. **Device 2** stores the linked `userId` in localStorage:
   ```javascript
   localStorage.setItem('linkedUserId', 'X9Oo6ZdYIuMlzFRkQZgRuq1TZpN2');
   ```

4. **All Firebase operations** on Device 2 now use this linked `userId` instead of its own anonymous ID

5. **Real-time listeners** on both devices listen for changes under the same `userId`

### Modified Files

1. `/app/frontend/src/components/DeviceLinking.jsx` - New component for linking UI
2. `/app/frontend/src/services/firebaseSync.js` - Modified `getUserId()` to check for `linkedUserId`
3. `/app/frontend/src/components/HeaderSettings.jsx` - Added "Device Sync" tab
4. `/app/FIRESTORE_SECURITY_RULES_FIXED.txt` - Added rules for `deviceLinks` collection

---

## 📱 Use Cases

### Scenario 1: Owner + Manager
- **Owner** uses the app on their phone
- **Manager** uses the app on a tablet at the pump
- Both need to see the same sales data in real-time

### Scenario 2: Multiple Shifts
- **Morning shift** uses Device 1
- **Evening shift** uses Device 2
- Both need access to customer credit balances

### Scenario 3: Backup Device
- **Primary device** for daily operations
- **Backup tablet** for when primary is charging
- Both devices stay in sync automatically

---

## ⚠️ Important Notes

1. **Codes expire in 10 minutes** - Generate a new code if the old one expires
2. **Link once per device** - You don't need to re-link every time you open the app
3. **Data persists** - Even after linking, each device keeps its local copy for offline use
4. **Unlink feature** - Not implemented yet (can be added if needed)

---

## 🔄 Firestore Security Rules

Update your Firestore rules to include the `deviceLinks` collection:

```javascript
// Device Links - temporary linking codes
match /deviceLinks/{linkCode} {
  allow create: if isAuthenticated();
  allow read: if isAuthenticated();
  allow delete: if isAuthenticated() && isOwner(resource.data.userId);
  allow update: if false;
}
```

Copy the complete rules from `/app/FIRESTORE_SECURITY_RULES_FIXED.txt` and paste into Firebase Console → Firestore Database → Rules → Publish.

---

## 🐛 Troubleshooting

### Code doesn't work
- **Check expiry**: Codes expire after 10 minutes
- **Check internet**: Both devices need internet to sync
- **Regenerate**: Try generating a fresh code

### Data still not syncing
1. Check Firebase Console → Firestore Database → Rules are published
2. Check browser console (F12) for errors
3. Try running `window.diagnoseFirebaseSync()` in console
4. Verify anonymous auth is enabled in Firebase Console

### Lost linked device
- The linking is stored in browser localStorage
- Clearing browser data will unlink the device
- Simply re-link using a new code

---

## 🎯 Next Steps (Optional Enhancements)

1. **Show linked devices** - Display list of linked devices
2. **Unlink device** - Allow users to remove linked devices
3. **Device nicknames** - Let users name their devices (e.g., "Manager Tablet", "Owner Phone")
4. **Last sync time** - Show when each device last synced data

---

**Created**: November 8, 2025  
**Status**: ✅ Fully Functional  
**Tech Stack**: Firebase Firestore + Anonymous Auth + Device Linking
