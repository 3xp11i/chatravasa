# Android Release Checklist

Use this checklist to ensure your app is ready for Play Store release.

## Pre-Development ✅ (Already Done)

- [x] Capacitor installed and configured
- [x] Android project initialized
- [x] Platform detection implemented
- [x] Push notifications support added
- [x] Build scripts created
- [x] Documentation written

## Development & Testing

### Local Testing
- [ ] Build and run on emulator successfully
- [ ] Test on at least 2 real Android devices
- [ ] Test on different Android versions (if possible)
- [ ] All features work as expected
- [ ] No crashes or critical bugs
- [ ] Performance is acceptable

### Feature Testing
- [ ] User authentication (login/logout)
- [ ] All pages load correctly
- [ ] Navigation works (including back button)
- [ ] Forms validate and submit
- [ ] Images and assets load
- [ ] API calls work correctly
- [ ] Offline functionality (if applicable)
- [ ] Push notifications (after Firebase setup)

### UI/UX Testing
- [ ] App looks good on small screens (5")
- [ ] App looks good on large screens (6.5"+)
- [ ] Status bar color matches theme
- [ ] Splash screen displays properly
- [ ] No text cutoff or overlap
- [ ] Touch targets are appropriately sized
- [ ] Keyboard behavior is correct

## App Assets

### App Icon
- [ ] Design app icon (512x512 PNG)
- [ ] Generate adaptive icons
- [ ] Replace default launcher icons in `android/app/src/main/res/mipmap-*/`
- [ ] Test icon on device

### Splash Screen
- [ ] Design splash screen
- [ ] Update colors in `capacitor.config.ts`
- [ ] Add splash image to res/drawable if needed
- [ ] Test splash screen on device

### Screenshots (for Play Store)
- [ ] Take screenshots of key features (2-8 images)
- [ ] Minimum 320x180 resolution
- [ ] Landscape and portrait if relevant
- [ ] Showcase best features

## Firebase Setup (for Push Notifications)

- [ ] Create Firebase project
- [ ] Add Android app to Firebase
- [ ] Download google-services.json
- [ ] Place in `android/app/`
- [ ] Add Firebase dependencies to build.gradle
- [ ] Sync and test
- [ ] Get FCM server key
- [ ] Update backend to send FCM notifications
- [ ] Test push notifications

## App Configuration

### Version Information
- [ ] Update version in `android/app/build.gradle`
  - `versionCode` - Integer, increment for each release
  - `versionName` - String, user-facing version (e.g., "1.0.0")

### App Details
- [ ] Verify app name in `android/app/src/main/res/values/strings.xml`
- [ ] Verify package name: `com.chatravasa.management`
- [ ] Update app description if needed

### Permissions
- [ ] Review permissions in AndroidManifest.xml
- [ ] Remove any unused permissions
- [ ] Ensure all permissions are necessary

## Build Configuration

### Signing Key
- [ ] Generate release signing key (one-time):
  ```bash
  keytool -genkey -v -keystore chatravasa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chatravasa-key
  ```
- [ ] Store key file securely (you need it for all future updates!)
- [ ] Document key password securely
- [ ] Add signing config to `android/app/build.gradle`

### ProGuard/R8 (Code Obfuscation)
- [ ] Enable minification in release build
- [ ] Test app still works after obfuscation
- [ ] Add ProGuard rules if needed

### Security
- [ ] Remove debug flags from production build
- [ ] Disable WebView debugging in production
- [ ] Review security best practices
- [ ] Ensure HTTPS for all API calls

## Build & Test Release

### Create Release Build
- [ ] Build signed release AAB:
  ```
  Android Studio > Build > Generate Signed Bundle/APK > AAB
  ```
- [ ] Build succeeds without errors
- [ ] AAB file generated in `android/app/release/`

### Test Release Build
- [ ] Install release APK on test devices
- [ ] All features work in release build
- [ ] No crashes or errors
- [ ] Performance is good
- [ ] Test offline scenarios

## Play Store Preparation

### Developer Account
- [ ] Create Google Play Console account ($25 one-time fee)
- [ ] Verify identity/payment
- [ ] Complete developer profile

### App Listing
- [ ] App name (30 characters max)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] App screenshots (2-8 images)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] App category
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Contact email

### Store Listing Content
- [ ] Write compelling app description
- [ ] Highlight key features
- [ ] Include screenshots of main screens
- [ ] Add app icon
- [ ] Choose appropriate category
- [ ] Select content rating
- [ ] Provide privacy policy link

### Privacy & Legal
- [ ] Create privacy policy (required)
- [ ] Host privacy policy on accessible URL
- [ ] Review Play Store policies
- [ ] Add any required legal disclaimers
- [ ] Data safety section completed

### Pricing & Distribution
- [ ] Set pricing (free/paid)
- [ ] Select countries for distribution
- [ ] Configure in-app purchases (if any)
- [ ] Set up app rating requirements

## Pre-Submission

### Testing
- [ ] Internal testing track (if desired)
- [ ] Alpha/Beta testing (recommended)
- [ ] Address any tester feedback
- [ ] Fix all critical issues

### Final Checks
- [ ] All store listing fields completed
- [ ] Privacy policy link working
- [ ] Screenshots look professional
- [ ] App description is complete
- [ ] Content rating is appropriate
- [ ] Countries selected for launch
- [ ] App version is current

## Submission

### Upload & Submit
- [ ] Upload signed AAB to Play Console
- [ ] Review release overview
- [ ] Add release notes
- [ ] Submit for review

### Post-Submission
- [ ] Monitor review status
- [ ] Respond to any Google queries promptly
- [ ] Fixes ready if issues found
- [ ] Plan for marketing/announcement

## After Approval

### Launch
- [ ] App is live on Play Store!
- [ ] Test downloading from Play Store
- [ ] Verify all functionality
- [ ] Share Play Store link

### Monitoring
- [ ] Monitor crash reports
- [ ] Read user reviews
- [ ] Track usage statistics
- [ ] Plan feature updates

### Maintenance
- [ ] Respond to user feedback
- [ ] Fix critical bugs quickly
- [ ] Plan regular updates
- [ ] Keep dependencies updated
- [ ] Monitor Play Console for warnings

## Future Updates

For each update:
- [ ] Increment `versionCode` (e.g., 1 → 2)
- [ ] Update `versionName` (e.g., "1.0.0" → "1.1.0")
- [ ] Test thoroughly
- [ ] Build new signed AAB
- [ ] Upload to Play Console
- [ ] Write release notes
- [ ] Submit for review

---

## Quick Reference

### Version Numbering
- **versionCode**: Integer, must increase with each release
  - 1, 2, 3, 4, ...
- **versionName**: Semantic versioning (major.minor.patch)
  - 1.0.0, 1.0.1, 1.1.0, 2.0.0

### File Locations
- Signing key: Keep secure, backup multiple places
- AAB file: `android/app/release/app-release.aab`
- APK file: `android/app/release/app-release.apk`
- google-services.json: `android/app/google-services.json`

### Important Links
- Play Console: https://play.google.com/console
- Firebase Console: https://console.firebase.google.com/
- Android Developer: https://developer.android.com/
- Capacitor Docs: https://capacitorjs.com/docs

---

**Good luck with your Android app release! 🚀**
