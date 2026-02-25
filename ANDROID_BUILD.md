# Android Build Guide for Chatravasa

This guide explains how to build and test the Android version of the Chatravasa app.

## Prerequisites

1. **Node.js** (already installed)
2. **Android Studio** - Download from https://developer.android.com/studio
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (for emulator)

## Project Structure

```
app/
├── dist/                    # Generated static files (from nuxt generate)
├── android/                 # Native Android project (Capacitor)
│   ├── app/
│   │   └── src/main/
│   │       ├── assets/public/   # Your web app files
│   │       ├── java/            # Native code
│   │       └── res/             # Android resources
├── capacitor.config.ts      # Capacitor configuration
└── package.json             # Build scripts
```

## Build Commands

### For Web PWA (existing workflow - unchanged)
```bash
npm run build       # Build for production
npm run dev         # Development server
npm run generate    # Generate static site
```

### For Android App (new workflow)
```bash
# Build and sync to Android
npm run android:build    # Generates static site and syncs to android/

# Open in Android Studio
npm run android:open     # Opens Android Studio

# Build and run on device/emulator (if configured)
npm run android:run
```

## First Time Setup

### 1. Generate Web Assets
```bash
npm run generate
```

### 2. Install Android Studio
- Download and install Android Studio
- Open it and go through the setup wizard
- Install any recommended SDK components

### 3. Open Android Project
```bash
npm run android:open
```
This will open the `android/` folder in Android Studio.

### 4. Wait for Gradle Sync
- First time will take 5-10 minutes
- Android Studio will download dependencies
- Wait for "Gradle sync finished" message

### 5. Create An Emulator (Optional)
If you want to test without a physical device:

1. In Android Studio: **Tools > Device Manager**
2. Click **Create Device**
3. Select a device (e.g., Pixel 6)
4. Download a system image (e.g., Android 13 / API 33)
5. Click **Finish**

### 6. Run the App

**Option A: Using Physical Device**
1. Enable Developer Options on your Android phone:
   - Settings > About Phone > Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging
3. Connect phone via USB
4. Click the green "Run" button in Android Studio
5. Select your device

**Option B: Using Emulator**
1. Click the green "Run" button in Android Studio  
2. Select the emulator you created
3. Wait for emulator to start (~30 seconds)
4. App will install and launch

## Development Workflow

### Making Changes to the App

1. **Edit your Vue/Nuxt code** in `app/` folder as usual
2. **Rebuild and sync**:
   ```bash
   npm run android:build
   ```
3. **Re-run in Android Studio**: Click the green "Run" button again

### Faster Development (Live Reload)

You can run the web dev server and point Android to it:

1. Start dev server:
   ```bash
   npm run dev
   ```
2. Note the local IP (e.g., `http://192.168.1.100:3000`)
3. Edit `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.100:3000',
     cleartext: true
   }
   ```
4. Sync and run:
   ```bash
   npm run android:sync
   npm run android:open
   ```

Now changes will reflect immediately without rebuilding!

**Remember to remove the `url` from config before building for production.**

## Platform-Specific Code

The app automatically detects the platform using `usePlatform()` composable:

```typescript
const { isNative, isAndroid, isWeb } = usePlatform()

if (isNative) {
  // Use Capacitor native APIs
  await PushNotifications.register()
} else {
  // Use Web APIs
  await navigator.serviceWorker.register('/sw.js')
}
```

## Push Notifications

- **Web**: Uses Web Push API with VAPID keys
- **Android**: Uses Firebase Cloud Messaging (FCM) via Capacitor Push Notifications
- Both are handled automatically in `usePushNotifications()` composable

## Building for Production

### Debug APK (for testing)
1. In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for build to complete
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install on any Android device for testing

### Release APK/AAB (for Play Store)
1. Generate signing key (one-time):
   ```bash
   keytool -genkey -v -keystore chatravasa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chatravasa-key
   ```
2. Configure signing in `android/app/build.gradle`
3. Build signed release:
   - Android Studio: **Build > Generate Signed Bundle / APK**
   - Choose AAB (App Bundle) for Play Store
   - Select your keystore
   - Build will be at: `android/app/release/app-release.aab`

### Upload to Play Store
1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing details
4. Upload the AAB file
5. Complete all required sections
6. Submit for review

## Key Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration (app ID, plugins) |
| `android/app/build.gradle` | Android build config (version, SDK) |
| `android/app/src/main/AndroidManifest.xml` | App permissions and components |
| `android/app/src/main/res/` | Android resources (icons, strings, colors) |
| `app/composables/usePlatform.ts` | Platform detection |
| `app/composables/usePushNotifications.ts` | Push notifications (web + native) |
| `app/plugins/capacitor.client.ts` | Capacitor initialization |

## Troubleshooting

### Gradle Build Failed
- Check Java version: Android Studio uses bundled JDK
- Try: **File > Invalidate Caches > Invalidate and Restart**
- Clean build: **Build > Clean Project**

### App Shows White Screen
- Check browser console in app (enable WebView debugging)
- Verify `dist/` folder has `index.html`
- Check `capacitor.config.ts` webDir is correct

### Push Notifications Not Working
- Verify permissions in AndroidManifest.xml
- Check FCM configuration (needs Firebase project setup)
- Test on physical device (emulator may not support notifications fully)

### Changes Not Reflecting
- Make sure you ran `npm run android:build` after making changes
- Try: **Build > Rebuild Project** in Android Studio
- Uninstall app from device/emulator and reinstall

## App Info

- **App ID**: `com.chatravasa.management`
- **App Name**: Chatravasa
- **Version**: 1.0 (version code: 1)
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: Latest

## Next Steps

1. ✅ Setup complete - app is ready for Android
2. 📱 Test on device/emulator
3. 🔔 Configure Firebase for push notifications (optional)
4. 🎨 Customize app icon and splash screen
5. 📦 Build release version
6. 🚀 Submit to Play Store

---

For more information:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer Guide: https://developer.android.com/guide
- Nuxt Docs: https://nuxt.com/docs
