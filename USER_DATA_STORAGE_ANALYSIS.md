# User Data Storage Analysis - Mobile Petrol Pump App

## What is "User Data" in App Info?

**User Data** refers to all the business data stored locally on the device in the browser's localStorage (for web) or Android's WebView storage (for Android app).

---

## Complete List of User Data Stored

### 1. Transaction Data
| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| **Sales Records** | `mpump_sales_data` | Daily fuel sales (nozzle readings, liters, amounts) |
| **Credit Records** | `mpump_credit_data` | Customer credit sales |
| **Income Records** | `mpump_income_data` | Income entries |
| **Expense Records** | `mpump_expense_data` | Expense entries |
| **Payment Records** | `mpump_payments` | Payments received from customers |

### 2. Master Data
| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| **Customers** | `mpump_customers` | Customer database (names, addresses, contact) |
| **Fuel Settings** | `mpump_fuel_settings` | Fuel types, rates, nozzle counts |

### 3. Inventory Data
| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| **Stock Data** | `petrolStockData`, `dieselStockData`, etc. | Date-wise inventory for each fuel type |
| **Rate History** | `mpump_rates_history` | Date-specific fuel rates |

### 4. Configuration Data
| Data Type | Storage Key | Description |
|-----------|-------------|-------------|
| **Contact Info** | `mpump_contact_info` | Pump name, dealer, address, email |
| **Notes** | `mpp_notes` | Personal notes |
| **Online URL** | `mpump_online_url` | Saved webpage URL |
| **Auto-Backup Settings** | `mpump_auto_backup_settings` | Backup preferences |
| **App Preferences** | `appTextSize`, `appTheme` | UI preferences |

---

## Storage Size Estimation

### Sample Data Sizes (JSON format)

#### Single Record Sizes:
```
Sales Record:       ~150 bytes
Credit Record:      ~200 bytes
Income Record:      ~100 bytes
Expense Record:     ~100 bytes
Payment Record:     ~120 bytes
Customer Record:    ~150 bytes
Stock Entry:        ~180 bytes (per fuel per day)
```

---

## One Year Storage Estimation

### Assumptions:
- **Business Days:** 365 days/year
- **Daily Operations:**
  - 10 sales records/day (nozzle readings)
  - 5 credit sales/day
  - 3 income entries/day
  - 3 expense entries/day
  - 5 payments/day
  - 3 fuel types with stock updates
  - 50 total customers added over the year

### Calculation:

#### 1. Sales Data (365 days × 10 records × 150 bytes)
```
365 × 10 × 150 = 547,500 bytes = 535 KB
```

#### 2. Credit Data (365 days × 5 records × 200 bytes)
```
365 × 5 × 200 = 365,000 bytes = 356 KB
```

#### 3. Income Data (365 days × 3 records × 100 bytes)
```
365 × 3 × 100 = 109,500 bytes = 107 KB
```

#### 4. Expense Data (365 days × 3 records × 100 bytes)
```
365 × 3 × 100 = 109,500 bytes = 107 KB
```

#### 5. Payment Data (365 days × 5 records × 120 bytes)
```
365 × 5 × 120 = 219,000 bytes = 214 KB
```

#### 6. Customer Data (50 customers × 150 bytes)
```
50 × 150 = 7,500 bytes = 7.3 KB
```

#### 7. Stock Data (365 days × 3 fuels × 180 bytes)
```
365 × 3 × 180 = 197,100 bytes = 192 KB
```

#### 8. Rate History (365 days × 3 fuels × 100 bytes)
```
365 × 3 × 100 = 109,500 bytes = 107 KB
```

#### 9. Configuration Data (Fixed)
```
Contact Info: 500 bytes
Notes: 2,000 bytes (estimated)
Settings: 1,000 bytes
Total: 3,500 bytes = 3.4 KB
```

---

## Total Storage After 1 Year

### Summary:
```
Sales Data:           535 KB
Credit Data:          356 KB
Income Data:          107 KB
Expense Data:         107 KB
Payment Data:         214 KB
Customer Data:        7.3 KB
Stock Data:           192 KB
Rate History:         107 KB
Configuration:        3.4 KB
─────────────────────────────
TOTAL:             ~1,629 KB
                   ≈ 1.6 MB
```

---

## Storage Scenarios

### Conservative Usage (Small Business)
- 5 sales/day, 2 credits/day, 2 payments/day
- **Estimated:** ~800 KB (0.8 MB) per year

### Moderate Usage (Medium Business)
- 10 sales/day, 5 credits/day, 5 payments/day
- **Estimated:** ~1.6 MB per year ✅ (our calculation)

### Heavy Usage (Large/Busy Station)
- 20 sales/day, 10 credits/day, 10 payments/day
- **Estimated:** ~3.2 MB per year

---

## Multi-Year Projections

| Years | Conservative | Moderate | Heavy |
|-------|-------------|----------|-------|
| **1 year** | 0.8 MB | 1.6 MB | 3.2 MB |
| **2 years** | 1.6 MB | 3.2 MB | 6.4 MB |
| **3 years** | 2.4 MB | 4.8 MB | 9.6 MB |
| **5 years** | 4.0 MB | 8.0 MB | 16 MB |

---

## Storage Limits & Availability

### Browser/Android Storage Limits:
- **LocalStorage:** Typically 5-10 MB per app/domain
- **Android WebView:** 5-10 MB default localStorage
- **Can be increased:** Android apps can request more storage

### Your App's Usage:
✅ **1.6 MB/year is well within limits**
✅ Even after 5 years (8 MB) still safe
✅ No storage concerns for typical usage

---

## Storage Optimization

### Built-in Features:
1. **Export Data Backup:** Remove old data after backing up
2. **JSON Format:** Efficient text-based storage
3. **No Media Files:** Only text data (numbers, names, dates)

### Recommendations:
- **Yearly Backup:** Export data at year-end and archive
- **Old Data Cleanup:** Delete records older than 2-3 years if needed
- **Regular Exports:** Weekly/monthly backups to external storage

---

## Where is Data Stored?

### Web Version:
```
Browser → Developer Tools → Application → Local Storage
Location: Browser's local database
```

### Android Version:
```
Device Storage → App Data → WebView Storage
Path: /data/data/com.mobilepetrolpump/app_webview/Local Storage/
```

### Data Persistence:
- ✅ Survives app restarts
- ✅ Survives phone restarts
- ❌ Lost if app data is cleared
- ❌ Lost if app is uninstalled (unless backed up)

---

## Important Notes

### Data Security:
- Stored locally on device only
- No cloud sync (unless you manually backup)
- Complete privacy - no external servers

### Backup Importance:
- **Critical:** Always maintain external backups
- **Frequency:** Weekly automated backup (app feature)
- **Storage:** Save backup files to:
  - Computer hard drive
  - Cloud storage (Google Drive, Dropbox)
  - USB drive
  - Email to yourself

### Data Loss Scenarios:
- Phone lost/stolen/damaged
- App uninstalled
- Storage cleared
- Phone factory reset

**Solution:** Regular backups! The app's backup file includes ALL data and is portable.

---

## Comparison with Other Apps

| App Type | Typical Storage/Year |
|----------|---------------------|
| **Mobile Petrol Pump** | 1.6 MB |
| WhatsApp (text only) | 50-100 MB |
| Instagram | 500+ MB |
| Notes App | 5-10 MB |
| Banking App | 2-5 MB |

**Your app is very lightweight!** 🎉

---

## Summary

### User Data = All Your Business Records
- Sales, Credit, Income, Expense, Payments
- Customers, Stock, Settings
- Everything needed to run your business

### Storage Size After 1 Year
- **~1.6 MB** (moderate usage)
- Well within device limits
- No performance impact

### Key Takeaways
✅ Very efficient storage usage
✅ No storage concerns even after many years
✅ Always maintain external backups
✅ Data stays private and local
✅ Lightweight compared to other apps

---

**Last Updated:** November 2, 2025
**App Version:** 2.0 (Comprehensive Backup)

