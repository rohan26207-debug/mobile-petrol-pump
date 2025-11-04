#!/bin/bash
set -e

echo "🔨 Building Offline Android APK with Latest Web App..."
echo "=========================================="

# 1. Build frontend
echo ""
echo "📦 Step 1/3: Building frontend production build..."
cd /app/frontend
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully"

# 2. Copy to assets
echo ""
echo "📁 Step 2/3: Copying build to Android assets..."
rm -rf /app/android/app/src/main/assets/*
cp -r build/* /app/android/app/src/main/assets/

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy assets!"
    exit 1
fi

# Verify files copied
FILE_COUNT=$(ls -1 /app/android/app/src/main/assets/ | wc -l)
echo "✅ Copied $FILE_COUNT items to assets"

# 3. Build APK
echo ""
echo "🤖 Step 3/3: Building Android APK..."
cd /app/android
./gradlew clean
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo "❌ APK build failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Build Complete!"
echo "=========================================="
echo ""
echo "📱 APK Location:"
echo "   /app/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📊 APK Size:"
ls -lh /app/android/app/build/outputs/apk/release/app-release.apk | awk '{print "   " $5}'
echo ""
echo "🎯 Next Steps:"
echo "   1. Copy APK to your phone"
echo "   2. Uninstall old version"
echo "   3. Install new APK"
echo "   4. Test offline features"
echo "   5. Test Google Drive sync"
echo ""
echo "🚀 Ready to distribute!"
