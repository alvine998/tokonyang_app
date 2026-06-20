#!/bin/bash

echo "Building Android App Bundle (AAB)..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo "Building release bundle..."
cd android && ./gradlew bundleRelease && cd ..

echo "done"