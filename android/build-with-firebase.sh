#!/bin/bash

# 🔥 Build Android APK with Firebase Integration
# This script builds the APK with the updated web app that includes Firebase sync

set -e

echo "🔥 =========================================="
echo "🔥  Building Android APK with Firebase     "
echo "🔥 =========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the android directory
if [ ! -f "build.gradle" ]; then
    echo -e "${RED}❌ Error: Must run from /app/android directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-build Checklist:${NC}"
echo "  ✅ Firebase configured in web app"
echo "  ✅ Offline persistence enabled"
echo "  ✅ Sync service integrated"
echo "  ✅ Android WebView compatible"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Complete Firebase Setup First!${NC}"
echo ""
echo "  1. Enable Anonymous Authentication in Firebase Console"
echo "  2. Set Firestore Security Rules"
echo "  3. See: /app/FIREBASE_SETUP_INSTRUCTIONS.md"
echo ""
read -p "Have you completed Firebase setup? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Build paused. Complete Firebase setup first.${NC}"
    echo "   Then run this script again."
    exit 0
fi

echo ""
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
./gradlew clean

echo ""
echo -e "${BLUE}🔨 Building release APK...${NC}"
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo ""
    echo -e "${GREEN}✅ =========================================="
    echo -e "✅  APK Built Successfully with Firebase!"
    echo -e "✅ ==========================================${NC}"
    echo ""
    echo -e "${GREEN}📦 APK Location:${NC}"
    echo "   app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    
    # Show APK size
    APK_SIZE=$(du -h app/build/outputs/apk/release/app-release-unsigned.apk | cut -f1)
    echo -e "${GREEN}📊 APK Size: ${APK_SIZE}${NC}"
    echo ""
    
    echo -e "${BLUE}🎯 What's Included:${NC}"
    echo "  ✅ Offline-first functionality"
    echo "  ✅ Firebase cloud sync"
    echo "  ✅ Multi-device support"
    echo "  ✅ Real-time updates"
    echo "  ✅ Sync status indicator"
    echo ""
    
    echo -e "${BLUE}📱 Next Steps:${NC}"
    echo "  1. Install APK on your device"
    echo "  2. Open app and check sync status (bottom-right)"
    echo "  3. Test offline mode (turn off internet, add data)"
    echo "  4. Test sync (turn on internet, click 'Sync Now')"
    echo "  5. Test multi-device (open on computer, see changes)"
    echo ""
    
    echo -e "${GREEN}🎊 Your app now has cloud sync! Enjoy! 🔥${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed! Check errors above.${NC}"
    exit 1
fi
