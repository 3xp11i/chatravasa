/**
 * Push Notifications Composable
 * 
 * Handles all push notification functionality including:
 * - Checking browser support
 * - Requesting notification permission
 * - Subscribing/unsubscribing to push notifications
 * - Syncing subscription with server
 * 
 * @example
 * const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications()
 */

export const usePushNotifications = () => {
  const config = useRuntimeConfig()
  const user = useSupabaseUser()

  // Reactive state for push notification support and status
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const permission = ref<NotificationPermission>('default')
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialize push notification state on mount
   * Checks browser support and current permission status
   */
  const initialize = async () => {
    if (!import.meta.client) return

    // Check if browser supports push notifications
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    permission.value = Notification.permission

    // Check if already subscribed
    if (isSupported.value && permission.value === 'granted') {
      await checkExistingSubscription()
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
   * Shows browser-native permission dialog
   * @returns Boolean indicating if permission was granted
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = 'Push notifications not supported'
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
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
      const registration = await navigator.serviceWorker.ready

      // Check for existing subscription first
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription with VAPID public key
        // Convert base64 public key to Uint8Array for the subscribe call
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true, // Required for Chrome - ensures notifications are always shown
          applicationServerKey: urlBase64ToUint8Array(config.public.vapidPublicKey as string),
        } as PushSubscriptionOptionsInit)
      }

      // Save subscription to server with the userId we already validated
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: {
          subscription: subscription.toJSON(),
          userId,
        },
      })

      isSubscribed.value = true
      error.value = null
      return subscription
    } catch (err: any) {
      console.error('Push subscription failed:', err)
      error.value = err.message || 'Failed to subscribe'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Unsubscribe user from push notifications
   * Removes subscription from browser and server
   * @returns Boolean indicating success
   */
  const unsubscribe = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe()
        // Remove from server
        await removeSubscriptionFromServer(subscription.endpoint)
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
