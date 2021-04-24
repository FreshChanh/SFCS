SCFS React Native app

To deploy app:

`npx react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/build/intermediates/assets/debug/index.android.bundle --assets-dest ./android/app/build/intermediates/res/merged/debug`

`npx react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`

`cd android/`

`./gradlew assembleDebug`

Check generated-apk file at:
./android/app/build/outputs/apk/debug
or:
./android/app/build/intermediates