# Mobile Petrol Pump Calculator

A full-featured petrol pump management application for tracking sales, credit, income, and expenses.

## Features

- 📊 **Sales Tracking**: Record daily fuel sales by nozzle
- 💳 **Credit Management**: Track customer credit sales
- 💰 **Income/Expense**: Manage financial transactions
- 📈 **Reports & Analytics**: Generate daily, weekly, monthly reports
- 💾 **Backup & Restore**: Export/import data locally
- 📱 **Android App**: 100% offline capable mobile app
- 🌐 **Web Application**: Browser-based version

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Radix UI Components
- React Router

### Backend
- FastAPI (Python)
- MongoDB
- JWT Authentication

### Android
- Native Android (Java)
- WebView wrapper
- 100% offline operation

## Quick Start

### Web Application

1. **Install Dependencies**
   ```bash
   cd frontend
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn start
   ```

3. **Build for Production**
   ```bash
   yarn build
   ```

### Backend API

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start Server**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```

### Android App

1. **Update Assets**
   ```bash
   cd frontend && yarn build
   rm -rf ../android/app/src/main/assets/*
   cp -r build/* ../android/app/src/main/assets/
   ```

2. **Build APK**
   ```bash
   cd android
   ./gradlew clean assembleRelease
   ```

3. **Output**
   ```
   android/app/build/outputs/apk/release/app-release-unsigned.apk
   ```

## Configuration

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Android
- **Offline Mode**: Loads from `file:///android_asset/index.html`
- **All data stored locally** (localStorage)
- **No internet required**

## Features Overview

### Sales Management
- Record fuel sales by nozzle
- Track opening/closing readings
- Calculate total sales
- Daily reports

### Credit Sales
- Customer credit tracking
- Payment history
- Outstanding balances
- Credit reports

### Financial Tracking
- Income recording
- Expense tracking
- Category management
- Financial reports

### Backup & Restore
- **Manual Backup**: Export data to JSON file
- **Copy Backup**: Copy data to clipboard
- **Import**: Restore from backup file
- **Auto Backup**: Weekly email backup (optional)

## Project Structure

```
mobile-petrol-pump/
├── android/                    # Android app
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/          # MainActivity.java
│   │   │   ├── assets/        # Web app files
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── backend/                    # FastAPI backend
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API services
│   ├── public/
│   └── package.json
└── README.md
```

## Building for Production

### Web Application

```bash
cd frontend
yarn build
# Output: frontend/build/
```

### Android APK

```bash
# 1. Build frontend
cd frontend && yarn build

# 2. Update Android assets
rm -rf ../android/app/src/main/assets/*
cp -r build/* ../android/app/src/main/assets/

# 3. Build APK
cd ../android
./gradlew clean assembleRelease

# 4. Sign APK (production)
jarsigner -verbose -sigalg SHA256withRSA \
  -keystore your-keystore.jks \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  your-alias

# 5. Zipalign
zipalign -v 4 app-release-unsigned.apk mobile-petrol-pump.apk
```

## Android App Details

### Configuration
- **100% Offline**: All files bundled in APK
- **No Cloud Sync**: Data stays on device
- **Local Storage**: Uses localStorage for data
- **Size**: ~2-3 MB APK

### MainActivity.java
Simple WebView wrapper (~70 lines) that loads the web app from local assets.

### Data Storage
All data stored locally:
- Sales: `mpump_sales_data`
- Credit: `mpump_credit_data`
- Income: `mpump_income_data`
- Expenses: `mpump_expense_data`
- Settings: `mpump_fuel_settings`

## Testing

### Test in Browser
```bash
cd frontend
yarn start
# Open http://localhost:3000
```

### Test Android in Airplane Mode
1. Install APK
2. Enable Airplane Mode
3. Open app
4. All features should work

## Troubleshooting

### Export Backup Not Working
- Uses simple download method
- Check Downloads folder
- Alternative: Use "Copy Backup Data" button

### Android App Not Loading
- Verify assets folder has files
- Check index.html exists
- Rebuild APK after updating assets

### Data Not Persisting
- Check localStorage is enabled
- Verify WebView settings
- Ensure app has storage permissions

## Documentation

- **Setup Guide**: See `/app/ANDROID_100_PERCENT_OFFLINE_SETUP.md`
- **Configuration**: See `/app/FINAL_ANDROID_CONFIGURATION.md`

## License

MIT

## Support

For issues and support, please open an issue on GitHub.
