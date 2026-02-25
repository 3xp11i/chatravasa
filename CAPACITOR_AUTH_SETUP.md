# Capacitor Authentication Setup Guide

## Issue Description
The Android app built with Capacitor has authentication issues:
1. Resident login fails (says number doesn't exist even though it works on web)
2. Admin can login but hostels list doesn't show properly

## Root Cause
**Cookie-based authentication doesn't work in native Capacitor apps** because:
- Native HTTP clients don't share cookies with the WebView
- Server APIs expect sessions from cookies, but mobile apps use localStorage
- Deep linking for authentication callbacks wasn't properly configured

## Fixes Applied

### 1. Updated Supabase Client Configuration (nuxt.config.ts)
```typescript
clientOptions: {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,  // CRITICAL for mobile auth
    storage: window.localStorage, // Use localStorage instead of cookies
    flowType: 'pkce',  // Enhanced security for native apps
  },
}
```

### 2. Added Deep Link Handling (capacitor.client.ts)
- Handles authentication callbacks from OAuth and magic links
- Automatically processes auth tokens from redirect URLs
- Navigates to appropriate pages after authentication

### 3. Updated AndroidManifest.xml
Added intent filters to handle deep links:
- `https://chatravasa.com` - for production URLs
- `com.chatravasa.management` - custom scheme

## Additional Steps Required

### 1. Update Supabase Dashboard Redirect URLs
Go to your Supabase project dashboard → Authentication → URL Configuration and add:

**Redirect URLs:**
```
com.chatravasa.management://**
https://chatravasa.com/**
https://*.chatravasa.com/**
```

**Site URL:**
```
https://chatravasa.com
```

### 2. Ensure Authorization Headers are Sent
The Nuxt Supabase module should automatically include the JWT token in API requests. Verify this is working by checking network requests in the app.

### 3. Test Authentication Flows

#### Resident Login (OTP)
1. Open app
2. Navigate to resident login
3. Enter phone number
4. Receive OTP via SMS
5. Enter OTP
6. Should redirect to resident dashboard

#### Admin Login (OTP)
1. Open app 
2. Navigate to admin login
3. Enter phone number
4. Receive OTP via SMS
5. Enter OTP
6. Should redirect to admin dashboard with visible hostels

### 4. Verify Server API Authorization
Server APIs use `serverSupabaseUser(event)` which extracts the user from:
1. Authorization header (should work in Capacitor)
2. Cookie (doesn't work in Capacitor)

The Nuxt Supabase module should automatically add the Authorization header to all requests when a session exists.

## How It Works Now

### Web App Flow (Before):
1. User logs in → Session stored in cookies
2. API requests include cookies automatically
3. Server reads session from cookie
4. ✅ Works perfectly

### Mobile App Flow (After Fix):
1. User logs in → Session stored in localStorage
2. Session JWT automatically added to Authorization header
3. Server reads session from Authorization header
4. ✅ Should work with these fixes

## Debugging

### Check if Session Exists
```javascript
const supabase = useSupabaseClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

### Check if Authorization Header is Sent
In Chrome DevTools with USB debugging:
1. Connect your Android device
2. Go to `chrome://inspect`
3. Inspect your app
4. Check Network tab for API requests
5. Verify `Authorization: Bearer <token>` header is present

### Common Issues

**Issue**: "User not found" or "Unauthorized" errors
**Solution**: Session not being detected or Authorization header not being sent

**Issue**: Deep links not working
**Solution**: Verify AndroidManifest.xml intent filters and Supabase redirect URLs

**Issue**: Session doesn't persist after app restart
**Solution**: Check that `persistSession: true` is set

## Testing Checklist

- [ ] Resident can request OTP
- [ ] Resident can verify OTP and login
- [ ] Resident sees their dashboard after login
- [ ] Admin can request OTP
- [ ] Admin can verify OTP and login
- [ ] Admin sees hostels list after login
- [ ] Session persists after app restart
- [ ] Deep links work for password reset
- [ ] Authorization header is sent with API requests

## Additional Resources

- [Supabase Native Mobile Deep Linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Supabase Auth for Mobile](https://supabase.com/docs/guides/auth/quickstarts/react-native)
