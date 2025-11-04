# What Data is Backed Up When You Click "Export Data Backup"

## Overview

When you click "💾 Export Data Backup" in Settings > Contact tab, the app creates a complete backup of all your business data stored in the application.

## Data Included in Backup

The backup file contains the following data in JSON format:

### 1. **Sales Data (Reading Sales)** 📊
All fuel sales records including:
- Date of sale
- Nozzle number (e.g., Nozzle 1, Nozzle 2)
- Fuel type (e.g., Petrol, Diesel, Premium)
- Start reading
- End reading
- Liters sold
- Rate per liter
- Total amount
- Unique ID for each record

**Example:**
```json
{
  "id": "sale_123",
  "date": "2025-01-15",
  "nozzle": "Nozzle 1",
  "fuelType": "Petrol",
  "startReading": 10000,
  "endReading": 10250,
  "liters": 250,
  "rate": 102.50,
  "amount": 25625
}
```

### 2. **Credit Data (Credit Sales)** 💳
All customer credit records including:
- Date of credit
- Customer name
- Fuel type
- Liters
- Rate per liter
- Total amount
- Income entries (if any)
- Expense entries (if any)
- Unique ID for each record

**Example:**
```json
{
  "id": "credit_456",
  "date": "2025-01-15",
  "customerName": "Ramesh Kumar",
  "fuelType": "Diesel",
  "liters": 100,
  "rate": 96.50,
  "amount": 9650,
  "incomeEntries": [],
  "expenseEntries": []
}
```

### 3. **Income Data** 💰
All income records including:
- Date
- Description/source
- Amount
- Category (if applicable)
- Unique ID for each record

**Example:**
```json
{
  "id": "income_789",
  "date": "2025-01-15",
  "description": "Service charge",
  "amount": 500
}
```

### 4. **Expense Data** 💸
All expense records including:
- Date
- Description/purpose
- Amount
- Category (if applicable)
- Unique ID for each record

**Example:**
```json
{
  "id": "expense_101",
  "date": "2025-01-15",
  "description": "Electricity bill",
  "amount": 2500
}
```

### 5. **Fuel Settings** ⛽
Configuration for all fuel types including:
- Fuel type name
- Current price/rate per liter
- Number of nozzles

**Example:**
```json
{
  "Petrol": {
    "price": 102.50,
    "nozzleCount": 2
  },
  "Diesel": {
    "price": 96.50,
    "nozzleCount": 2
  },
  "Premium": {
    "price": 108.90,
    "nozzleCount": 1
  }
}
```

### 6. **Metadata** 📅
Additional information about the backup:
- Export date and time (ISO format)
- Backup version (currently 1.0)

## Data NOT Included in Backup

The following data is **NOT** included in the backup file:

❌ **Customer List** - Stored separately (in Settings > Customer tab)
❌ **Payment Records** - Payment received data
❌ **Stock Data** - Fuel inventory/stock information
❌ **Contact Information** - Pump name, address, phone, GST
❌ **Notes** - Text notes entered via N button
❌ **Auto-backup Settings** - Backup preferences
❌ **App Settings** - Theme, text size, etc.

## Complete Backup File Structure

```json
{
  "salesData": [
    // Array of all Reading Sales records
  ],
  "creditData": [
    // Array of all Credit Sales records
  ],
  "incomeData": [
    // Array of all Income records
  ],
  "expenseData": [
    // Array of all Expense records
  ],
  "fuelSettings": {
    // Object with fuel types and their rates
  },
  "exportDate": "2025-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

## File Format & Details

**File Name:** `mobile-petrol-pump-backup-[YYYY-MM-DD].json`
- Example: `mobile-petrol-pump-backup-2025-01-15.json`

**File Type:** JSON (JavaScript Object Notation)
- Human-readable text format
- Can be opened with any text editor
- Can be imported back into the app

**File Size:** Varies based on data amount
- Small dataset: 5-50 KB
- Medium dataset: 50-500 KB
- Large dataset: 500 KB - 5 MB

## What You Can Do With Backup File

### 1. **Restore Data** 📥
- Import the backup file back into the app
- Restores all sales, credit, income, expense data
- Useful after app reinstall or data loss

### 2. **Transfer to New Device** 📱
- Export backup from old device
- Import backup into app on new device
- All data transfers seamlessly

### 3. **Keep Historical Records** 📚
- Create monthly/yearly backups
- Store on computer or cloud storage
- Maintain business records for accounting/tax purposes

### 4. **Data Analysis** 📊
- Open JSON file in Excel/Google Sheets (after conversion)
- Analyze sales trends
- Create custom reports

### 5. **Safety Backup** 💾
- Protect against phone loss/damage
- Prevent accidental data deletion
- Regular backups ensure business continuity

## How to Import/Restore Backup

1. Open Settings in the app
2. Go to Contact tab
3. Scroll to "Manual Backup" section
4. Click "📁 Import Data Backup"
5. Select your backup JSON file
6. Confirm to restore data

**⚠️ Warning:** Importing will replace all existing data with the backup data.

## Best Practices

### Regular Backups
- **Daily:** For active businesses
- **Weekly:** For moderate use (auto-backup every 7 days available)
- **Monthly:** For record-keeping

### Storage Locations
- ✅ Computer hard drive
- ✅ Cloud storage (Google Drive, Dropbox)
- ✅ USB drive
- ✅ Email to yourself
- ⚠️ Keep multiple copies in different locations

### Naming Convention
The app automatically names files with date:
- `mobile-petrol-pump-backup-2025-01-15.json`
- This helps organize backups chronologically

## Automatic Backup (7 Days)

The app also has an automatic backup feature:
- Enabled by default
- Creates backup every 7 days
- Downloads to your device automatically
- Can be disabled in Settings > Contact tab

## Data Privacy & Security

✅ **Local Storage Only:**
- All data stored on your device
- Backup file created locally
- No cloud upload or external servers

✅ **Your Control:**
- You decide where to save backup files
- You control who has access
- Complete data privacy

✅ **No Internet Required:**
- Backup works offline
- No data transmission
- Complete offline functionality

## Summary

The "Export Data Backup" creates a comprehensive backup containing:
- ✅ All Reading Sales records
- ✅ All Credit Sales records  
- ✅ All Income records
- ✅ All Expense records
- ✅ Fuel settings (rates, nozzles)
- ✅ Export metadata

This backup protects your business data and ensures you never lose important sales and financial records.

---

**💡 Tip:** Make it a habit to export backup weekly or monthly and save it to a safe location outside your phone!

