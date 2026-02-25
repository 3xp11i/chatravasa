# Push Notifications Integration Guide

Complete guide for the unified push notification system that works for **both PWA (web) and Android native app**.

---

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [How It Works](#how-it-works)
3. [Architecture](#architecture)
4. [What Gradle Is](#what-gradle-is)
5. [Client-Side Implementation](#client-side-implementation)
6. [Server-Side Implementation](#server-side-implementation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

Your app now has a **unified notification system** that automatically detects the platform and uses the appropriate technology:

| Platform | Technology | Authentication |
|----------|-----------|----------------|
| **PWA (Web)** | Web Push API | VAPID keys |
| **Android App** | Firebase Cloud Messaging (FCM) | Service Account JSON |

### Key Features:
- ✅ Same code sends to both PWA and Android
- ✅ Automatic platform detection
- ✅ Same API for both platforms
- ✅ Same database table for all subscriptions
- ✅ No client-side changes needed!

---

## 🔍 How It Works

### **PWA (Web Browser):**
```
1. User enables notifications
2. Browser gives you a PushSubscription (endpoint + keys)
3. You save: endpoint, p256dh, auth, platform='web'
4. Server sends via Web Push API using VAPID keys
5. Browser shows notification
```

### **Android Native App:**
```
1. User enables notifications  
2. Firebase gives you an FCM token (long string)
3. You save: native_token, platform='android'
4. Server sends via Firebase Admin SDK
5. Android shows notification
```

### **Unified Flow:**
```typescript
// Server-side (automatic!)
sendNotification(event, {
  userIds: ['user-1', 'user-2'],
  title: 'New Message',
  body: 'You have a new message'
})

// The function automatically:
// 1. Looks up subscriptions for those users
// 2. Separates web vs android subscriptions  
// 3. Sends to web using Web Push API
// 4. Sends to android using FCM
// 5. Returns combined success/failure count
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PWA (Web)              │      Android Native App       │
│  ━━━━━━━━━━━━━━━        │      ━━━━━━━━━━━━━━━━         │
│  Service Worker         │      Capacitor Plugin         │
│  Web Push API           │      FCM Token                │
│  VAPID subscription     │      Firebase SDK             │
│                         │                                │
│  usePushNotifications() ←──────────────────────────────┤
│  (Same composable detects platform automatically!)      │
│                                                          │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│                    SERVER SIDE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Subscription APIs:                                     │
│  • /api/push/subscribe         (Web subscriptions)      │
│  • /api/push/subscribe-native  (Android FCM tokens)     │
│  • /api/push/unsubscribe       (Remove subscriptions)   │
│                                                          │
│  Notification Utility:                                  │
│  • server/utils/notifications.ts                        │
│    ┌─────────────────────────────────────────┐         │
│    │  sendNotification()                      │         │
│    │  • Reads push_subscriptions table       │         │
│    │  • Separates by platform field          │         │
│    │  • Web → Web Push (webpush library)     │         │
│    │  • Android → FCM (firebase-admin)       │         │
│    └─────────────────────────────────────────┘         │
│                                                          │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  push_subscriptions table:                              │
│  ┌───────────────────────────────────────────┐         │
│  │ id           │ UUID                       │         │
│  │ user_id      │ UUID (FK to profiles)      │         │
│  │ platform     │ 'web' or 'android'         │         │
│  │ endpoint     │ For web subscriptions      │         │
│  │ p256dh       │ For web subscriptions      │         │
│  │ auth         │ For web subscriptions      │         │
│  │ native_token │ For Android FCM token      │         │
│  │ created_at   │ Timestamp                  │         │
│  │ updated_at   │ Timestamp                  │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ What Gradle Is

**Gradle** is the build system for Android apps (similar to npm/webpack for web apps).

### What it does:
- 📦 Manages dependencies (like `npm install`)
- 🔨 Compiles your code (Java, Kotlin, native code)
- 📱 Builds APK/AAB files for distribution
- 🔧 Configures build settings

### Key Files:
```
android/
├── build.gradle              ← Root build config
├── settings.gradle           ← Project settings
├── gradle.properties         ← Properties/variables
├── gradlew                   ← Gradle wrapper (Unix)
├── gradlew.bat              ← Gradle wrapper (Windows)
└── app/
    └── build.gradle         ← App-level build config (Firebase added here)
```

### Common Gradle Commands:
```bash
# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Install on connected device
./gradlew installDebug
```

**You don't need to use Gradle directly** - Capacitor handles it for you!

---

## 📱 Client-Side Implementation

### **Good News: Already Done! ✅**

Your `usePushNotifications()` composable already handles both platforms:

```typescript
// app/composables/usePushNotifications.ts

export const usePushNotifications = () => {
  const { isNative, isWeb } = usePlatform()

  const initialize = async () => {
    if (isNative) {
      // Uses Capacitor PushNotifications plugin
      // Automatically gets FCM token from Firebase
      await initializeNativePush()
    } else {
      // Uses Web Push API with Service Worker
      // Gets VAPID subscription from browser
      isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    }
  }

  const subscribe = async () => {
    if (isNative) {
      // Registers with FCM, token sent to server
      await PushNotifications.register()
    } else {
      // Creates web push subscription with VAPID key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })
      // Saves to server
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: { subscription: subscription.toJSON(), userId }
      })
    }
  }
}
```

### **How to Use in Your App:**

```vue
<template>
  <button @click="enableNotifications">
    Enable Notifications
  </button>
</template>

<script setup>
const { subscribe, permission } = usePushNotifications()

const enableNotifications = async () => {
  await subscribe()
  // Works automatically for both web and Android!
}
</script>
```

### **No Changes Needed!** 🎉
- Same composable for PWA and Android
- Automatic platform detection
- Same API calls
- Same UI components

---

## 🖥️ Server-Side Implementation

### **1. Notification Utility (Main API)**

```typescript
// server/utils/notifications.ts

import { sendNotification } from '~/server/utils/notifications'

// Send to specific user
await sendNotification(event, {
  userId: 'user-id',
  title: 'New Message',
  body: 'You have a new message'
})

// Send to multiple users (works for both web and Android!)
await sendNotification(event, {
  userIds: ['user-1', 'user-2', 'user-3'],
  title: 'Announcement',
  body: 'System maintenance scheduled'
})

// Send to all hostel residents
await sendNotification(event, {
  hostelId: 'hostel-id',
  title: 'Fee Reminder',
  body: 'Monthly fees are due'
})
```

### **2. How It Works Internally:**

```typescript
// The function automatically:

// Step 1: Get subscriptions from database
const { data: subscriptions } = await supabase
  .from("push_subscriptions")
  .select("*")
  .in("user_id", targetUserIds)

// Step 2: Separate by platform
const webSubs = subscriptions.filter(sub => sub.platform === 'web')
const nativeSubs = subscriptions.filter(sub => sub.platform === 'android')

// Step 3: Send to web using Web Push API
for (const sub of webSubs) {
  await webpush.sendNotification({
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth }
  }, payload)
}

// Step 4: Send to Android using FCM
const { messaging } = await import('./firebase-admin')
for (const sub of nativeSubs) {
  await messaging.send({
    token: sub.native_token,
    notification: { title, body },
    android: {
      priority: 'high',
      notification: { icon: 'ic_launcher', sound: 'default' }
    }
  })
}
```

### **3. Helper Functions:**

```typescript
// Send to hostel admins only
await sendNotificationToHostelAdmins(event, hostelId, {
  title: 'New Complaint',
  body: 'A resident submitted a complaint'
})

// Send to all hostel residents
await sendNotificationToHostelResidents(event, hostelId, {
  title: 'Meal Update',
  body: 'Menu for this week is available'
})
```

### **4. Where It's Used:**

The notification system is already integrated in:

- **Complaint System** - Notifies admins when residents create complaints
- **Fee Reminders** - Sends payment reminders to residents
- **Meal Updates** - Notifies about meal plans
- **Announcements** - General notifications to hostel members

Examples in your codebase:
- `server/api/resident/complaints/create.ts`
- `server/api/manage-fees/send-reminder.post.ts`
- Any file that imports `sendNotification`

---

## 🧪 Testing

### **Test on Web (PWA):**

1. Open app in Chrome/Edge/Firefox
2. Click "Enable Notifications" in Settings
3. Grant permission
4. Send test notification: `/api/push/test`
5. Should see browser notification

### **Test on Android:**

1. Build and install Android app
2. Open app on device/emulator
3. Click "Enable Notifications" in Settings
4. Grant permission
5. Check console logs for FCM token
6. Send test notification from:
   - Your backend
   - Firebase Console

### **Test Both at Once:**

```typescript
// In any server API
await sendNotification(event, {
  userIds: ['user-id'],
  title: 'Test',
  body: 'This should appear on both platforms!'
})
```

If the user is logged in on both web and Android with the same account, they'll get the notification on **both devices**!

### **Check Database:**

```sql
-- View all subscriptions
SELECT 
  user_id,
  platform,
  CASE 
    WHEN platform = 'web' THEN 'Web: ' || substring(endpoint, 1, 50)
    WHEN platform = 'android' THEN 'Android: ' || substring(native_token, 1, 50)
  END as subscription_info,
  created_at
FROM push_subscriptions
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### **Web Push Not Working:**

❌ **Problem:** No notification received on web
✅ **Solutions:**
- Check VAPID keys are set in `.env`
- Verify service worker is registered: `navigator.serviceWorker.ready`
- Check browser console for errors
- Test with notifications permission granted
- Make sure endpoint/p256dh/auth are saved in database

### **Android FCM Not Working:**

❌ **Problem:** No notification received on Android
✅ **Solutions:**
- Verify `google-services.json` is in `android/app/`
- Check FCM token is saved in database (platform='android')
- Verify Firebase Admin SDK initialized: Check `server/utils/firebase-admin.ts`
- Check `fcm-service-account.json` exists in `server/config/`
- Look for FCM errors in server logs
- Test using Firebase Console first

### **Database Issues:**

❌ **Problem:** Subscriptions not saving
✅ **Solutions:**
- Verify `push_subscriptions` table has these columns:
  - `native_token` (TEXT, nullable)
  - `platform` (TEXT, nullable, default 'web')
- Run this SQL if columns missing:
  ```sql
  ALTER TABLE push_subscriptions 
  ADD COLUMN IF NOT EXISTS native_token TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
  ```

### **Mixed Platform Issues:**

❌ **Problem:** Only web or only Android works
✅ **Solutions:**
- Check `notifications.ts` has both Web Push and FCM code
- Verify `firebase-admin.ts` exports `messaging` correctly
- Check imports: `import { messaging } from './firebase-admin'`
- Look for errors in server logs when sending

### **Service Account Issues:**

❌ **Problem:** FCM authentication fails
✅ **Solutions:**
- Verify `fcm-service-account.json` is valid JSON
- Check file path: `server/config/fcm-service-account.json`
- Ensure service account has "Firebase Admin SDK Administrator" role
- Try re-downloading service account key from Firebase Console

### **Debug Logging:**

Add this to see what's happening:

```typescript
// In server/utils/notifications.ts
console.log('Subscriptions found:', subscriptions?.length)
console.log('Web subscriptions:', webSubs.length)
console.log('Native subscriptions:', nativeSubs.length)
console.log('Results - Sent:', sent, 'Failed:', failed)
```

---

## 📝 Summary

### **What Changed:**

1. ✅ **Database**: Added `native_token` and `platform` columns
2. ✅ **Server**: Updated `notifications.ts` to handle both platforms
3. ✅ **Types**: Updated TypeScript types for new columns
4. ✅ **Client**: Already working (no changes needed!)

### **How to Use:**

**Client-side** (already working):
```typescript
const { subscribe } = usePushNotifications()
await subscribe() // Works for both web and Android!
```

**Server-side** (send notifications):
```typescript
await sendNotification(event, {
  userId: 'user-id',
  title: 'Title',
  body: 'Message'
}) // Automatically sends to correct platform!
```

### **What You Need to Deploy:**

1. ✅ `fcm-service-account.json` on server
2. ✅ `google-services.json` in Android app
3. ✅ VAPID keys in environment variables
4. ✅ Database columns created
5. ✅ All code files updated (done!)

### **That's It!** 🎉

Your notification system now works seamlessly across **PWA and Android** with the same codebase!

---

## 📚 Additional Resources

- [Web Push API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Questions?** Check the code comments in:
- `app/composables/usePushNotifications.ts` - Client implementation
- `server/utils/notifications.ts` - Server implementation
- `server/utils/firebase-admin.ts` - Firebase setup
