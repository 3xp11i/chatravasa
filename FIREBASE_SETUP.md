# Firebase Setup for Android Push Notifications

This guide explains how to set up Firebase Cloud Messaging (FCM) for push notifications in the Android app.

## Why Firebase?

Android requires Firebase Cloud Messaging (FCM) to send push notifications to native apps. The web version uses Web Push API with VAPID keys, but the Android app needs FCM.

## Setup Steps

### 1. Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **Add project** or select an existing project
3. Enter project name: "Chatravasa" (or any name)
4. Follow the wizard to create the project

### 2. Add Android App to Firebase

1. In Firebase Console, click **Add app** → **Android**
2. Enter your Android package name: `com.chatravasa.management`
3. Enter app nickname: "Chatravasa Android" (optional)
4. Leave SHA-1 blank for now (needed later for Google Sign-In if you add it)
5. Click **Register app**

### 3. Download google-services.json

1. Download the `google-services.json` file
2. Place it in: `android/app/google-services.json`
3. **Important**: This file is gitignored for security

### 4. Add Firebase SDK to Android

Edit `android/app/build.gradle`:

```groovy
// At the top, after other apply statements
apply plugin: 'com.google.gms.google-services'

dependencies {
    // Add Firebase Messaging
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    
    // ... other dependencies
}
```

Edit `android/build.gradle`:

```groovy
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 5. Sync Gradle

In Android Studio:
- Click **File > Sync Project with Gradle Files**
- Wait for sync to complete

### 6. Set Up Service Account (for Backend)

**Important**: Firebase has deprecated the legacy Server Key. You'll now use the modern FCM HTTP v1 API with a service account.

#### Using the Default Firebase Service Account (Recommended)

Firebase automatically creates a default service account with the correct permissions. This is the easiest approach:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Click **Manage Service Accounts** (links to Google Cloud Console)
4. You should see an existing service account like:
   - `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
   - This already has **Firebase Admin SDK Administrator Service Agent** role ✅
5. Click on this service account email
6. Go to **Keys** tab → **Add Key** → **Create new key**
7. Choose **JSON** format
8. Download the JSON file (e.g., `fcm-service-account.json`)
9. **Important**: Store this file securely - DO NOT commit to git!
10. Place it in your server directory (e.g., `server/config/fcm-service-account.json`)
11. Add `fcm-service-account.json` to your `.gitignore`

#### Alternative: Create a New Service Account (Optional)

If you prefer a dedicated service account for FCM only:

1. In Google Cloud Console (from step 3 above), click **Create Service Account**
2. Fill in the details:
   - **Name**: `fcm-push-notifications`
   - **Description**: "Service account for sending FCM push notifications"
   - Click **Create and Continue**
3. Grant permissions:
   - Select role: **Firebase Cloud Messaging Admin**
   - Click **Continue**, then **Done**
4. Follow steps 5-11 from above to create and download the key

**Note**: The default Firebase Admin SDK service account already has all necessary permissions for FCM. You don't need to check or modify permissions.

### 7. Update Your Backend

You'll need to update your push notification backend to send FCM notifications for Android devices using the HTTP v1 API.

**Database Schema Update:**

Make sure your `push_subscriptions` table has:
```sql
-- Add column if not exists
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS native_token TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
```

**Install Firebase Admin SDK:**

```bash
npm install firebase-admin
```

**Initialize Firebase Admin (server-side):**

Create `server/utils/firebase-admin.ts`:

```typescript
import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { join } from 'path'

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(
      join(process.cwd(), 'server/config/fcm-service-account.json'),
      'utf8'
    )
  )

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

export const messaging = admin.messaging()
```

**Backend API Updates:**

When sending notifications, check the platform:
- If `platform = 'web'`: Use Web Push API with VAPID
- If `platform = 'android'`: Use FCM HTTP v1 API

Example implementation:

```typescript
import { messaging } from '~/server/utils/firebase-admin'

// Send notification to Android device
async function sendAndroidNotification(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const message = {
    token: deviceToken,
    notification: {
      title,
      body
    },
    data: data || {},
    android: {
      priority: 'high' as const,
      notification: {
        icon: 'ic_launcher',
        sound: 'default'
      }
    }
  }

  try {
    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return { success: true, messageId: response }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
```

**FCM HTTP v1 API Details:**

- Endpoint: `https://fcm.googleapis.com/v1/projects/{project-id}/messages:send`
- Authentication: OAuth 2.0 access token (handled by Firebase Admin SDK)
- Benefits:
  - More secure token-based authentication
  - Better error messages and delivery reporting
  - Support for advanced features like topics and conditions
  - No deprecation concerns

## Testing Push Notifications

### Test from Firebase Console

1. Go to Firebase Console → **Messaging**
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Enter your FCM token (check Android logs for token)
6. Click **Test**

### Test from Your App

1. Install the app on a device/emulator
2. Grant notification permission when prompted
3. Check logs for registration token:
   ```
   [Push Native] Registration token: <your-token>
   ```
4. This token is saved to your database via `/api/push/subscribe-native`
5. Send a test notification from your backend

## Troubleshooting

### No Token Received
- Check `google-services.json` is in the right location
- Verify Firebase dependencies are added
- Check Android logs for errors
- Ensure notification permission is granted

### Notifications Not Appearing
- Check Android notification settings for the app
- Verify service account has correct permissions
- Check Firebase Console for delivery status
- Test with Firebase Console first before using your backend
- Check that service account JSON is valid and not corrupted

### Build Errors
- Make sure Google Services plugin is applied
- Verify Firebase BOM version is current
- Clean and rebuild project: **Build > Clean Project**

## Environment Variables

For your backend (Nuxt server), ensure the service account JSON path is correct:

```env
# .env (optional - if you want to configure the path)
FCM_SERVICE_ACCOUNT_PATH=./server/config/fcm-service-account.json
```

**Note**: The service account JSON file should be stored securely on your server, not in environment variables. The Firebase Admin SDK reads it directly from the file system.

## Security Notes

- ✅ `google-services.json` is gitignored
- ✅ `fcm-service-account.json` MUST be gitignored
- ✅ Never commit service account keys to version control
- ✅ Use environment-specific service accounts (dev, staging, prod)
- ✅ Service account JSON contains sensitive credentials - treat like passwords
- ⚠️ For production, enable App Check in Firebase for additional security
- ⚠️ Rotate service account keys periodically

## Production Checklist

Before releasing to production:

- [ ] Firebase project set to production mode
- [ ] Production `google-services.json` file in place
- [ ] Separate production service account created with minimal permissions
- [ ] `fcm-service-account.json` added to `.gitignore`
- [ ] Service account JSON stored securely on production server
- [ ] Test notifications on multiple devices
- [ ] Monitor FCM quotas and usage in Firebase Console
- [ ] Enable Firebase App Check for additional security
- [ ] Set up monitoring and error logging for FCM
- [ ] Configure proper error handling for invalid tokens

## Additional Resources

- [FCM HTTP v1 API Documentation](https://firebase.google.com/docs/cloud-messaging/migrate-v1)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)
- [Send Messages to Multiple Devices](https://firebase.google.com/docs/cloud-messaging/send-message)
- [FCM Message Format](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)

---

**Note**: Firebase setup is required only for native push notifications. Web push notifications continue to work with your existing VAPID keys without any changes!
