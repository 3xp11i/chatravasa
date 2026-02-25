# Common Issues & Solutions

Quick reference for common problems when building Android apps with Capacitor.

## Build Issues

### "index.html not found"
**Symptom**: Error when running `npx cap sync android`
```
The web assets directory must contain an index.html file
```

**Solution**:
```bash
# Use generate instead of build
npm run generate

# Check dist folder has index.html
dir dist\index.html
```

---

### Gradle Build Failed
**Symptom**: Android Studio shows Gradle sync errors

**Solutions**:
1. **Clean and rebuild**:
   - Android Studio > Build > Clean Project
   - Build > Rebuild Project

2. **Invalidate caches**:
   - File > Invalidate Caches > Invalidate and Restart

3. **Check Java version**:
   - File > Project Structure > SDK Location
   - Use JDK 17 or higher

4. **Update Gradle** (if needed):
   - android/gradle/wrapper/gradle-wrapper.properties
   - Use latest stable Gradle version

---

### Permission Denied on Windows
**Symptom**: `EPERM: operation not permitted, symlink`

**Solution**: Use the provided batch script or manual copy:
```bash
# Use the quick-start script
android-start.bat

# Or manually:
if exist android\app\src\main\assets\public rmdir /S /Q android\app\src\main\assets\public
powershell -Command "Copy-Item -Path 'dist' -Destination 'android\app\src\main\assets\public' -Recurse -Force"
```

---

## Runtime Issues

### White Screen on App Launch
**Symptom**: App shows white screen, doesn't load

**Solutions**:
1. **Check browser console**:
   - Enable WebView debugging
   - Chrome > chrome://inspect > Find your device
   - Click "Inspect"

2. **Verify assets copied**:
   - Check `android/app/src/main/assets/public/index.html` exists
   - Ensure all files in dist/ were copied

3. **Check capacitor.config.ts**:
   - Verify `webDir: 'dist'`
   - Check app ID matches AndroidManifest.xml

4. **Clear app data**:
   - Settings > Apps > Chatravasa > Storage > Clear Data
   - Uninstall and reinstall app

---

### "App keeps stopping" / Crashes
**Symptom**: App crashes immediately or randomly

**Solutions**:
1. **Check Logcat** in Android Studio:
   - View > Tool Windows > Logcat
   - Filter by your package name
   - Look for red errors

2. **Common causes**:
   - Missing plugin in capacitor.config.ts
   - Incorrect AndroidManifest.xml
   - Native code syntax error
   - Missing dependency

3. **Test with minimal app**:
   - Comment out plugins in app.vue
   - Gradually add back features
   - Identify which causes crash

---

### Back Button Doesn't Work
**Symptom**: Android back button does nothing or closes app

**Solution**: Make sure capacitor.client.ts plugin is loaded:
```typescript
// app/plugins/capacitor.client.ts should exist
App.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    router.back();
  } else {
    App.minimizeApp();
  }
});
```

If issues persist, check:
- Plugin file is in `app/plugins/` folder
- File ends with `.client.ts`
- No TypeScript errors

---

### Status Bar Issues
**Symptom**: Status bar wrong color or overlaps content

**Solutions**:
1. **Check StatusBar config**:
   ```typescript
   // capacitor.config.ts
   StatusBar: {
     style: "dark",
     backgroundColor: "#4CAF50"
   }
   ```

2. **iOS safe area** (if adding iOS later):
   ```css
   /* Add padding for notch */
   padding-top: env(safe-area-inset-top);
   ```

3. **Android viewport**:
   ```html
   <!-- Should have viewport-fit=cover -->
   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
   ```

---

## Push Notification Issues

### No Registration Token
**Symptom**: `[Push Native] Registration token:` never appears in logs

**Solutions**:
1. **Check google-services.json**:
   - Exists at `android/app/google-services.json`
   - Package name matches: `com.chatravasa.management`

2. **Check Firebase dependencies**:
   ```groovy
   // android/app/build.gradle
   apply plugin: 'com.google.gms.google-services'
   implementation 'com.google.firebase:firebase-messaging'
   ```

3. **Check permissions**:
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

4. **Request permission**:
   - Make sure app prompts for notification permission
   - User must grant permission

---

### Notifications Not Appearing
**Symptom**: Token received but notifications don't show

**Solutions**:
1. **Check device notification settings**:
   - Settings > Apps > Chatravasa > Notifications
   - Ensure notifications are enabled

2. **Test with Firebase Console**:
   - Firebase > Cloud Messaging > Send test message
   - Enter your FCM token
   - If this works, problem is in your backend

3. **Check notification payload**:
   ```json
   {
     "notification": {
       "title": "Test",
       "body": "Test message"
     }
   }
   ```

4. **Foreground vs Background**:
   - Test with app in background
   - Foreground notifications need explicit handling

---

## Development Issues

### Changes Not Reflecting
**Symptom**: Made code changes but app unchanged

**Solution**:
```bash
# Always rebuild after changes
npm run android:build

# In Android Studio
# Click Run button again (or Shift+F10)

# For stubborn issues
# 1. Uninstall app from device
# 2. Build > Clean Project
# 3. Build > Rebuild Project
# 4. Run again
```

---

### Slow Build Times
**Solutions**:
1. **Use incremental builds**:
   - Don't clean unless necessary
   - Only sync changed files

2. **Enable Gradle daemon**:
   ```properties
   # android/gradle.properties
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.caching=true
   ```

3. **Increase heap size**:
   ```properties
   # android/gradle.properties
   org.gradle.jvmargs=-Xmx4096m
   ```

4. **Use live reload** (during active development):
   - See ANDROID_BUILD.md for setup

---

### TypeScript Errors
**Symptom**: VS Code shows errors but app works

**Common Issues**:
```typescript
// Cannot find name 'usePlatform'
// Solution: Nuxt auto-imports, ignore in IDE

// Cannot find module '@capacitor/core'
// Solution: npm install again, restart VS Code
```

**To fix IDE recognition**:
1. Close VS Code
2. Delete `.nuxt` folder
3. Run `npm run dev` once
4. Restart VS Code

---

## Android Studio Issues

### "Android Studio won't open"
**Solutions**:
1. Check Android Studio installed correctly
2. Try opening manually:
   - Start Android Studio
   - File > Open
   - Navigate to `android/` folder

3. Check no other instance running
4. Restart computer

---

### Emulator Won't Start
**Solutions**:
1. **Check virtualization enabled** in BIOS
   - Intel: VT-x
   - AMD: AMD-V

2. **Check Windows features**:
   - Disable Hyper-V if using other virtualizers
   - Enable Windows Hypervisor Platform

3. **Try different emulator**:
   - Device Manager > Create new virtual device
   - Select different system image

4. **Use physical device** instead
   - Often faster and more reliable

---

### Gradle Daemon Issues
**Symptom**: Builds hang or timeout

**Solutions**:
```bash
# Kill all Gradle daemons
cd android
gradlew --stop

# Clear Gradle cache
rmdir /S /Q %USERPROFILE%\.gradle\caches

# Rebuild
gradlew clean
gradlew build
```

---

## Testing Issues

### App Not Installing on Device
**Solutions**:
1. **Enable installation**:
   - Settings > Security > Unknown Sources (older Android)
   - Settings > Apps > Special Access > Install unknown apps (newer Android)

2. **Check USB debugging**:
   - Developer Options > USB Debugging enabled
   - Trust computer when prompted

3. **Try wireless debugging** (Android 11+):
   - Developer Options > Wireless debugging
   - Pair device with pairing code

---

### App Signing Issues
**Symptom**: Can't create signed release

**Solutions**:
1. **Check keystore path** in build.gradle
2. **Verify passwords** are correct
3. **Generate new keystore** if lost (warning: can't update existing app!)
4. **Keep backups** of keystore file

---

## Play Store Issues

### Upload Failed
**Common reasons**:
- Version code not incremented
- Package name already exists
- Missing required fields
- Privacy policy URL invalid
- Content rating incomplete

**Solution**: Check error message carefully, update as needed

---

### App Rejected
**Common reasons**:
- Crashes on reviewer's device
- Missing privacy policy
- Insufficient functionality
- Policy violations
- Inappropriate content

**Solution**: 
- Fix issues mentioned
- Test thoroughly on multiple devices
- Ensure compliance with policies
- Resubmit with explanation

---

## Getting Help

### Check Logs
```bash
# Android Logcat
adb logcat | grep -i chatravasa

# Web console (Chrome inspect)
chrome://inspect
```

### Resources
- Capacitor Forum: https://forum.ionicframework.com/c/capacitor
- Stack Overflow: Tag `capacitor`
- GitHub Issues: https://github.com/ionic-team/capacitor/issues
- Android Developer: https://developer.android.com/

### Debug Checklist
1. ✅ Check Logcat for errors
2. ✅ Check Chrome inspect for web errors
3. ✅ Verify all files are in place
4. ✅ Clean and rebuild
5. ✅ Test on different device
6. ✅ Search for similar issues online

---

## Prevention Tips

### Before Building
- [ ] Test on web first (npm run dev)
- [ ] Fix all TypeScript errors
- [ ] Check all dependencies installed
- [ ] Ensure internet connectivity

### Regular Maintenance
- [ ] Keep dependencies updated
- [ ] Update Android SDK periodically
- [ ] Clear caches regularly
- [ ] Backup signing keys
- [ ] Document any custom changes

### Best Practices
- ✅ Commit working code before building
- ✅ Test incrementally
- ✅ Keep Android Studio updated
- ✅ Use version control
- ✅ Document any workarounds

---

**Still stuck?** Check the documentation files:
- ANDROID_BUILD.md - Complete build guide
- FIREBASE_SETUP.md - Push notification setup
- ANDROID_RELEASE_CHECKLIST.md - Release preparation

Or search for your specific error message online - chances are someone else has encountered it!
