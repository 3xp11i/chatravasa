/**
 * Notifications Data Composable
 * 
 * Handles fetching, marking as read, and managing notifications
 * This is separate from push notifications - handles the UI/data layer
 * 
 * @example
 * const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications()
 */

import type { Database } from '~/types/database.types'

// Type for notification from the database
export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  url: string | null
  type: string
  is_read: boolean
  created_at: string
  metadata: Record<string, any> | null
}

export const useNotifications = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Reactive state for notifications - shared across all components
  const notifications = useState<Notification[]>('notifications', () => [])
  const loading = useState<boolean>('notifications-loading', () => false)
  const error = useState<string | null>('notifications-error', () => null)
  
  // Track if realtime is already subscribed - shared to prevent duplicates
  const isRealtimeSubscribed = useState<boolean>('notifications-realtime-subscribed', () => false)
  const currentSubscribedUserId = useState<string | null>('notifications-subscribed-user-id', () => null)

  /**
   * Get user ID from various possible locations in the user object
   * Supabase user object structure can vary - ID is often in 'sub' not 'id'
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
   * Computed property for unread notification count
   * Used to display badge on notification icon
   */
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.is_read).length
  })

  /**
   * Fetch all notifications for the current user
   * Ordered by creation date (newest first)
   */
  const fetchNotifications = async () => {
    const userId = getUserId()
    if (!userId) {
      console.log('[Notifications] No user ID found, skipping fetch')
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Notification[]>('/api/notifications/list', {
        method: 'GET',
      })
      notifications.value = data || []
      console.log('[Notifications] Fetched', notifications.value.length, 'notifications')
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err)
      error.value = err.message || 'Failed to load notifications'
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark a single notification as read
   * @param notificationId - ID of the notification to mark as read
   */
  const markAsRead = async (notificationId: string) => {
    try {
      await $fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: { notificationId },
      })

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await $fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: { markAll: true },
      })

      // Update local state
      notifications.value.forEach(n => {
        n.is_read = true
      })
    } catch (err: any) {
      console.error('Failed to mark all as read:', err)
    }
  }

  /**
   * Clear all notifications (delete from database)
   */
  const clearAll = async () => {
    try {
      await $fetch('/api/notifications/clear', {
        method: 'POST',
      })

      notifications.value = []
    } catch (err: any) {
      console.error('Failed to clear notifications:', err)
    }
  }

  /**
   * Add a notification to the local state
   * Used when receiving a push notification while app is open
   */
  const addNotification = (notification: Notification) => {
    // Check if notification already exists to avoid duplicates
    const exists = notifications.value.some(n => n.id === notification.id)
    if (!exists) {
      // Add to beginning of array (newest first)
      notifications.value.unshift(notification)
      console.log('[Notifications] Added new notification, unread count:', unreadCount.value)
    }
  }

  /**
   * Subscribe to realtime notifications for the current user
   */
  const subscribeToRealtime = () => {
    if (!import.meta.client) return
    
    const userId = getUserId()
    if (!userId) return

    // Prevent duplicate subscriptions for the same user
    if (isRealtimeSubscribed.value && currentSubscribedUserId.value === userId) {
      console.log('[Notifications] Realtime already subscribed for user:', userId)
      return
    }

    // If subscribed to a different user, unsubscribe first
    if (isRealtimeSubscribed.value && currentSubscribedUserId.value !== userId) {
      unsubscribeFromRealtime()
    }

    console.log('[Notifications] Setting up realtime subscription for user:', userId)

    const channelName = `notifications-user-${userId}`
    
    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Notifications] Realtime INSERT received:', payload.new)
          addNotification(payload.new as Notification)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Notifications] Realtime UPDATE received:', payload.new)
          // Update existing notification in local state
          const index = notifications.value.findIndex(n => n.id === (payload.new as Notification).id)
          if (index !== -1) {
            notifications.value[index] = payload.new as Notification
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Notifications] Realtime DELETE received:', payload.old)
          // Remove from local state
          notifications.value = notifications.value.filter(n => n.id !== (payload.old as any).id)
        }
      )
      .subscribe((status, err) => {
        console.log('[Notifications] Realtime subscription status:', status, err || '')
        if (status === 'SUBSCRIBED') {
          isRealtimeSubscribed.value = true
          currentSubscribedUserId.value = userId
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Notifications] Realtime subscription failed:', err)
          isRealtimeSubscribed.value = false
        }
      })
  }

  /**
   * Unsubscribe from realtime notifications
   */
  const unsubscribeFromRealtime = () => {
    if (!import.meta.client) return
    
    if (currentSubscribedUserId.value) {
      const channelName = `notifications-user-${currentSubscribedUserId.value}`
      // Find the channel by topic and remove it
      const channels = supabase.getChannels()
      const existingChannel = channels.find((ch: any) => ch.topic === `realtime:${channelName}`)
      if (existingChannel) {
        supabase.removeChannel(existingChannel)
        console.log('[Notifications] Realtime unsubscribed from channel:', channelName)
      }
      isRealtimeSubscribed.value = false
      currentSubscribedUserId.value = null
    }
  }

  // Auto-fetch on user change - watch the whole user object since ID could be in different places
  watch(
    user,
    (newUser) => {
      const userId = getUserId()
      if (userId) {
        fetchNotifications()
        subscribeToRealtime()
      } else {
        notifications.value = []
        unsubscribeFromRealtime()
      }
    },
    { immediate: true }
  )

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
  }
}
