import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Push Notifications Composable
 * 
 * Handles all push notification functionality including:
 * - Checking browser support
 * - Requesting notification permission
 * - Subscribing/unsubscribing to push notifications
 * - Syncing subscription with server
 * - Native push notifications for Android/iOS via Capacitor
 * 
 * @example
 * const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications()
 */

export const usePushNotifications = () => {
  const config = useRuntimeConfig()
  const user = useSupabaseUser()
  const { isNative, isWeb } = usePlatform()

  // Reactive state for push notification support and status
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const permission = ref<NotificationPermission>('default')
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialize push notification state on mount
   * Checks browser support and current permission status
   * For native apps, initializes Capacitor Push Notifications
   */
  const initialize = async () => {
    if (!import.meta.client) return

    if (isNative) {
      // Native platform - use Capacitor Push Notifications
      isSupported.value = true
      await initializeNativePush()
    } else {
      // Web platform - use Web Push API
      isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
      permission.value = Notification.permission

      // Check if already subscribed
      if (isSupported.value && permission.value === 'granted') {
        await checkExistingSubscription()
      }
    }
  }

  /**
   * Initialize native push notifications for Capacitor
   */
  const initializeNativePush = async () => {
    try {
      // Add listeners for push notifications
      await PushNotifications.addListener('registration', (token) => {
        console.log('[Push Native] Registration token:', token.value)
        // Save token to server
        saveNativeToken(token.value)
      })

      await PushNotifications.addListener('registrationError', (error) => {
        console.error('[Push Native] Registration error:', error)
      })

      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Push Native] Notification received:', notification)
      })

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('[Push Native] Notification action performed:', notification)
      })

      // Check permission status
      const permStatus = await PushNotifications.checkPermissions()
      permission.value = permStatus.receive === 'granted' ? 'granted' : 
                        permStatus.receive === 'denied' ? 'denied' : 'default'
      
      if (permStatus.receive === 'granted') {
        isSubscribed.value = true
      }
    } catch (err) {
      console.error('[Push Native] Initialization error:', err)
    }
  }

  /**
   * Save native push token to server
   */
  const saveNativeToken = async (token: string) => {
    const userId = getUserId()
    if (!userId) return

    try {
      await $fetch('/api/push/subscribe-native', {
        method: 'POST',
        body: {
          token,
          userId,
          platform: Capacitor.getPlatform()
        }
      })
      isSubscribed.value = true
    } catch (err) {
      console.error('[Push Native] Failed to save token:', err)
    }
  }

  /**
   * Check if user already has an active push subscription
   */
  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      isSubscribed.value = !!subscription
    } catch (err) {
      console.error('Error checking subscription:', err)
    }
  }

  /**
   * Request notification permission from user
   * Shows browser-native permission dialog or native permission prompt
   * @returns Boolean indicating if permission was granted
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Push notifications not supported'
      return false
    }

    try {
      if (isNative) {
        // Native platform - use Capacitor
        const permStatus = await PushNotifications.requestPermissions()
        permission.value = permStatus.receive === 'granted' ? 'granted' : 'denied'
        return permStatus.receive === 'granted'
      } else {
        // Web platform - use browser API
        const result = await Notification.requestPermission()
        permission.value = result
        return result === 'granted'
      }
    } catch (err) {
      console.error('Error requesting permission:', err)
      error.value = 'Failed to request permission'
      return false
    }
  }

  /**
   * Get user ID from various possible locations in the user object
   * Supabase user object structure can vary
   */
  const getUserId = (): string | null => {
    if (!user.value) return null
    
    // Try different possible locations for user ID
    const possibleId = 
      (user.value as any).id || 
      (user.value as any).sub || 
      (user.value as any).user?.id ||
      (user.value as any).user?.sub
    
    return possibleId || null
  }

  /**
   * Subscribe user to push notifications
   * Creates a push subscription and saves it to the server
   * Handles both web and native platforms
   * @returns The push subscription object or null on failure
   */
  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!isSupported.value) {
      error.value = 'Push notifications not supported'
      return null
    }

    // Get user ID with fallback checks
    const userId = getUserId()
    
    if (!userId) {
      // Log for debugging
      console.error('User authentication check failed:', {
        userValue: user.value,
        userType: typeof user.value,
      })
      error.value = 'User not authenticated'
      return null
    }

    loading.value = true
    error.value = null

    try {
      if (isNative) {
        // Native platform - register for push notifications
        console.log('[Push Native] Registering for push...')
        await PushNotifications.register()
        // Token will be handled by the 'registration' listener
        isSubscribed.value = true
        return null // Native doesn't return a subscription object
      } else {
        // Web platform - use existing web push logic
        // Check if VAPID key is configured
        const vapidKey = config.public.vapidPublicKey as string
        if (!vapidKey) {
          throw new Error('VAPID public key not configured')
        }

        console.log('[Push] Getting service worker registration...')
        const registration = await navigator.serviceWorker.ready
        console.log('[Push] Service worker ready:', registration)

        // Check for existing subscription first
        let subscription = await registration.pushManager.getSubscription()
        console.log('[Push] Existing subscription:', subscription)

        if (!subscription) {
          console.log('[Push] Creating new subscription with VAPID key:', vapidKey.substring(0, 20) + '...')
          // Create new subscription with VAPID public key
          // Convert base64 public key to Uint8Array for the subscribe call
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // Required for Chrome - ensures notifications are always shown
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          } as PushSubscriptionOptionsInit)
          console.log('[Push] Subscription created:', subscription)
        }

        // Save subscription to server with the userId we already validated
        console.log('[Push] Saving subscription to server for user:', userId)
        await $fetch('/api/push/subscribe', {
          method: 'POST',
          body: {
            subscription: subscription.toJSON(),
            userId,
          },
        })

        isSubscribed.value = true
        error.value = null
        console.log('[Push] Successfully subscribed!')
        return subscription
      }
    } catch (err: any) {
      console.error('[Push] Subscription failed:', err)
      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to subscribe'
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission denied for notifications'
      } else if (err.name === 'AbortError') {
        errorMessage = 'Subscription was aborted'
      } else if (err.message?.includes('push service')) {
        errorMessage = 'Push service error - please try again'
      }
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Unsubscribe user from push notifications
   * Removes subscription from browser and server
   * Handles both web and native platforms
   * @returns Boolean indicating success
   */
  const unsubscribe = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      if (isNative) {
        // Native platform - no direct unsubscribe, just remove from server
        // You would need to store the token somewhere to remove it
        console.log('[Push Native] Unsubscribe not fully implemented for native')
        // TODO: Implement server-side token removal for native
      } else {
        // Web platform
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          // Unsubscribe from browser
          await subscription.unsubscribe()
          // Remove from server
          await removeSubscriptionFromServer(subscription.endpoint)
        }
      }

      isSubscribed.value = false
      error.value = null
      return true
    } catch (err: any) {
      console.error('Unsubscribe failed:', err)
      error.value = err.message || 'Failed to unsubscribe'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove push subscription from server
   * Called when user unsubscribes
   */
  const removeSubscriptionFromServer = async (endpoint: string) => {
    await $fetch('/api/push/unsubscribe', {
      method: 'POST',
      body: { endpoint },
    })
  }

  // Initialize on mount
  onMounted(() => {
    initialize()
  })

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    checkExistingSubscription,
  }
}

/**
 * Convert VAPID public key from base64url to Uint8Array
 * Required format for PushManager.subscribe()
 * 
 * @param base64String - Base64url encoded VAPID public key
 * @returns Uint8Array for applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Add padding if needed
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
