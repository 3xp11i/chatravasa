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

  // Reactive state for notifications
  const notifications = useState<Notification[]>('notifications', () => [])
  const loading = useState<boolean>('notifications-loading', () => false)
  const error = useState<string | null>('notifications-error', () => null)

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
    if (!user.value?.id) return

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Notification[]>('/api/notifications/list', {
        method: 'GET',
      })
      notifications.value = data || []
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
    // Add to beginning of array (newest first)
    notifications.value.unshift(notification)
  }

  // Auto-fetch on user change
  watch(
    () => user.value?.id,
    (userId) => {
      if (userId) {
        fetchNotifications()
      } else {
        notifications.value = []
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
