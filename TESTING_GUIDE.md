# Testing Guide for Capacitor Authentication Fixes

## Root Cause

The issue was that **Authorization headers were not being automatically added to API requests in Capacitor**. Here's why:

1. On web, `@nuxtjs/supabase` uses **cookies** to maintain sessions
2. In Capacitor, we configured it to use **localStorage** (cookies don't work in native apps)
3. With localStorage, the Authorization header must be **manually added** to every API request
4. The module doesn't automatically do this, causing `serverSupabaseUser(event)` to return null on the server

## What Was Fixed

### 1. Updated Supabase Client Configuration ([nuxt.config.ts](nuxt.config.ts#L137-L156))
   - Added `detectSessionInUrl: true` - Detects auth sessions from redirect URLs
   - Added `autoRefreshToken: true` - Automatically refresh tokens before expiry
   - Added `flowType: 'pkce'` - Enhanced security for native apps
   - Configured `storage` to use localStorage for both web and Capacitor

### 2. Created Fetch Interceptor ([app/plugins/auth-headers.client.ts](app/plugins/auth-headers.client.ts))
   - **Intercepts ALL `$fetch()` calls to `/api/*` endpoints**
   - **Automatically adds `Authorization: Bearer <token>` header**
   - Logs all requests for debugging
   - This is the KEY fix that makes authentication work in Capacitor

### 3. Enhanced Deep Link Handling ([app/plugins/capacitor.client.ts](app/plugins/capacitor.client.ts))
   - Handles auth callbacks from OAuth and magic links
   - Automatically processes auth tokens from redirect URLs
   - Navigates to appropriate pages after authentication

### 4. Updated AndroidManifest.xml ([android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml))
   - Added intent filters for deep linking
   - Supports both `https://chatravasa.com` and `com.chatravasa.management://` schemes

### 5. Improved API Error Handling ([server/api/auth/check-resident.ts](server/api/auth/check-resident.ts))
   - Added comprehensive logging for debugging
   - Better error handling for phone number verification
   - Tries multiple phone format variations

## How to Test

### Step 1: Rebuild the Android App

The changes require a fresh build:

```bash
npm run android:run
```

Or manually:
```bash
npm run android:build
npx cap run android
```

### Step 2: Test Resident Login

1. Open the app on your Android device
2. Navigate to **Resident Login**
3. Enter a valid resident phone number (e.g., `9170147764`)
4. Click "Send OTP"
5. **Check console logs in Chrome DevTools** - You should see:
   ```
   [Auth] ✅ Authorization header added to: /api/auth/check-resident
   [Auth] ✅ Authorization header added to: /api/resident/me
   ```
6. Enter the OTP received via SMS
7. Click "Verify OTP"
8. **Expected**: Should redirect to resident dashboard with your name and room displayed

**If it fails**: 
- Check console for `⚠️  No session token available` warnings
- Verify you received the OTP
- Check server logs for phone number format issues

### Step 3: Test Admin Login

1. Open the app
2. Navigate to **Admin Login**
3. Enter a valid admin phone number
4. Click "Send OTP"
5. **Check console logs** - Should see Authorization headers being added:
   ```
   [Auth] ✅ Authorization header added to: /api/manage-hostel/get-hostels
   ```
6. Enter the OTP received
7. Click "Verify OTP"
8. **Expected**: Should redirect to admin dashboard with hostels list populated

**If hostels list is empty**:
- Check console for `[Auth] ⚠️  No session token available`
- Verify admin has hostels in the database
- Check network tab for Authorization header in `/api/manage-hostel/get-hostels` request

### Step 4: Verify Session Persistence

1. Log in successfully (resident or admin)
2. Close the app completely (swipe away from recent apps)
3. Reopen the app
4. **Expected**: Should still be logged in and show the dashboard immediately

**If logged out on restart**:
- Check localStorage in DevTools: `localStorage.getItem('supabase.auth.token')`
- Verify `persistSession: true` in nuxt.config.ts

### Step 5: Debug with Chrome DevTools

Connect your Android device and open Chrome DevTools:

```bash
# 1. Enable USB debugging on your device
# 2. Connect via USB
# 3. Open Chrome and go to: chrome://inspect
# 4. Click "inspect" on your device
```

#### Check Console Logs:

Look for these messages:
```
[Auth] Initial session state: { hasSession: true, hasAccessToken: true, userId: '...' }
[Auth] ✅ Authorization header added to: /api/...
[Auth] State changed: SIGNED_IN { hasSession: true, ... }
```

#### Check Network Requests:

1. Go to Network tab
2. Filter by `/api/`
3. Click any request
4. Go to "Headers" tab
5. **Look for**: `Authorization: Bearer eyJhbG...`

#### Check Session in Console:

```javascript
// In the console, run:
const { data: { session } } = await useSupabaseClient().auth.getSession()
console.log('Session:', session)
console.log('Has token:', !!session?.access_token)
console.log('User ID:', session?.user?.id)
```

Expected output:
- `Has token: true`
- `User ID: <uuid>`

## Debugging Common Issues

### Issue 1: "You have not been added to any hostel yet" (Resident)

**What this means**: Authentication worked, but the resident record wasn't found in the database.

**Debug steps**:
1. Check console for Authorization headers:
   ```
   [Auth] ✅ Authorization header added to: /api/resident/me
   ```
2. Open Network tab → Find `/api/resident/me` request
3. Check if Authorization header is present
4. Check the response - does it have `hasResident: false`?

**Solutions**:
- Verify resident exists in database: `SELECT * FROM residents WHERE id = '<user-id>'`
- Check if user_id matches between `auth.users` and `residents` table
- Manually create resident record if missing

### Issue 2: Hostels List Empty (Admin)

**What this means**: Authentication worked, but no hostels were found.

**Debug steps**:
1. Check console logs:
   ```
   [Auth] ✅ Authorization header added to: /api/manage-hostel/get-hostels
   ```
2. Check Network request to `/api/manage-hostel/get-hostels`
3. Verify Authorization header is present
4. Check response data - is `isAdmin: true`?

**Solutions**:
- Verify admin has hostels: `SELECT * FROM hostels WHERE admin_user_id = '<user-id>'`
- Check `admins` table: `SELECT * FROM admins WHERE id = '<user-id>'`
- Verify user_id in Authorization token matches admin_user_id in hostels table

### Issue 3: "Unauthorized" Error on API Calls

**What this means**: Authorization header is missing or invalid.

**Debug steps**:
1. Check console for warnings:
   ```
   [Auth] ⚠️  No session token available for: /api/...
   ```
2. Verify session exists:
   ```javascript
   const { data: { session } } = await useSupabaseClient().auth.getSession()
   console.log('Has session:', !!session)
   ```

**Solutions**:
- Log out and log in again
- Clear app data: Settings → Apps → Chatravasa → Clear Data
- Rebuild the app with latest changes

### Issue 4: Session Lost After App Restart

**Symptoms**: User is logged out when reopening the app

**Debug steps**:
1. Check localStorage before closing app:
   ```javascript
   console.log(localStorage.getItem('supabase.auth.token'))
   ```
2. Reopen app and check again - should still be there

**Solutions**:
- Verify `persistSession: true` in nuxt.config.ts
- Check browser storage isn't being cleared
- Rebuild app after config changes

### Issue 5: Authorization Header Not Being Added

**Symptoms**: Console shows `⚠️  No session token available`

**Debug steps**:
1. Check if fetch interceptor is initialized:
   ```
   [Auth] Fetch interceptor initialized
   ```
2. Verify session state:
   ```
   [Auth] Initial session state: { hasSession: true, ... }
   ```

**Solutions**:
- Ensure auth-headers.client.ts plugin is loading
- Check plugin order in nuxt.config.ts
- Log out and log in again to refresh session

## Success Indicators

When everything is working correctly, you should see:

### Console Logs:
```
[Auth] Fetch interceptor initialized
[Auth] Initial session state: { hasSession: true, hasAccessToken: true, userId: 'abc123...' }
[Auth] ✅ Authorization header added to: /api/resident/me
[Auth] ✅ Authorization header added to: /api/manage-hostel/get-hostels
```

### Network Requests:
- All `/api/*` requests have `Authorization: Bearer <token>` header
- Responses return data instead of 401 errors

### UI Behavior:
- ✅ Resident sees their name and room on dashboard
- ✅ Admin sees their hostels list
- ✅ Session persists after app restart
- ✅ No "Unauthorized" errors in console

## Additional Configuration Required

### Supabase Dashboard Settings

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration

1. **Add Redirect URLs**:
   ```
   com.chatravasa.management://**
   https://chatravasa.com/**
   https://*.chatravasa.com/**
   ```

2. **Set Site URL**:
   ```
   https://chatravasa.com
   ```

3. **Save changes**

## Next Steps If Issues Persist

1. **Check Supabase Auth Logs**: Dashboard → Auth → Logs
2. **Enable Verbose Logging**: Add more console.log in plugins
3. **Test on Web First**: Verify issue is Capacitor-specific
4. **Check Database**: Verify user exists in correct tables
5. **Check RLS Policies**: Ensure policies allow reading data

## Files Changed

- ✅ [nuxt.config.ts](nuxt.config.ts) - Updated Supabase client options
- ✅ [app/plugins/auth-headers.client.ts](app/plugins/auth-headers.client.ts) - **KEY FIX: Fetch interceptor**
- ✅ [app/plugins/capacitor.client.ts](app/plugins/capacitor.client.ts) - Deep link handling
- ✅ [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml) - Intent filters
- ✅ [server/api/auth/check-resident.ts](server/api/auth/check-resident.ts) - Enhanced logging

## Understanding the Fix

**Before**: 
- Client: Has session in localStorage ✅
- Client → Server API: No Authorization header ❌
- Server: `serverSupabaseUser(event)` returns null ❌
- Result: "Not added to hostel" / "No hostels" errors ❌

**After**:
- Client: Has session in localStorage ✅
- Client → Server API: Authorization header added automatically ✅
- Server: `serverSupabaseUser(event)` reads user from token ✅
- Result: Data loads correctly ✅

The fetch interceptor in `auth-headers.client.ts` bridges the gap between localStorage sessions and server-side authentication.
