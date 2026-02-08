<!--
  NotificationsModal Component
  
  Displays a list of notifications in a modal dropdown.
  Shows unread notifications with visual indicators.
  Allows marking individual or all notifications as read.
  
  @props
  - onClose: Function to close the modal
  
  @example
  <NotificationsModal v-if="showModal" :on-close="() => showModal = false" />
-->
<template>
  <VueFinalModal
    :model-value="true"
    class="flex justify-end items-start pt-16 pr-4"
    content-class="w-80 max-h-[70vh] max-h-[70dvh]"
    overlay-transition="vfm-fade"
    content-transition="vfm-slide-down"
    :click-to-close="true"
    :lock-scroll="false"
    @click-outside="props.onClose"
  >
    <div class="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[70vh] max-h-[70dvh]">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h3 class="font-bold text-gray-900">{{ t('notifications') }}</h3>
        <div class="flex items-center gap-2">
          <!-- Mark all as read button -->
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllRead"
            class="text-xs text-primary hover:text-primary/80 font-medium"
          >
            {{ t('markAllRead') }}
          </button>
          <!-- Close button -->
          <button @click="props.onClose" class="text-gray-400 hover:text-gray-600">
            <Icon name="material-symbols:close" class="text-xl" />
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="loading" class="p-4 text-center text-gray-500">
          <Icon name="material-symbols:refresh" class="text-2xl animate-spin" />
          <p class="text-sm mt-2">{{ t('loading') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <Icon name="material-symbols:notifications-off-outline" class="text-4xl mb-2" />
          <p class="text-sm">{{ t('noNotifications') }}</p>
        </div>

        <!-- Notification Items -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50/50': !notification.is_read }"
          >
            <div class="flex items-start gap-3">
              <!-- Notification Icon based on type -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :class="getNotificationIconClass(notification.type)"
              >
                <Icon :name="getNotificationIcon(notification.type)" class="text-xl" />
              </div>

              <div class="flex-1 min-w-0">
                <!-- Title with unread indicator -->
                <div class="flex items-center gap-2">
                  <p 
                    class="text-sm truncate"
                    :class="notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'"
                  >
                    {{ notification.title }}
                  </p>
                  <!-- Unread dot -->
                  <span
                    v-if="!notification.is_read"
                    class="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  ></span>
                </div>

                <!-- Body -->
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                  {{ notification.body }}
                </p>

                <!-- Time -->
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatTime(notification.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 bg-gray-50">
        <button
          @click="handleClearAll"
          class="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
        >
          {{ t('clearAllNotifications') }}
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import { useI18n } from 'vue-i18n'
import type { Notification } from '~/composables/useNotifications'

const props = defineProps<{
  onClose: () => void
}>()

const { t } = useI18n()
const router = useRouter()

// Get notifications from composable
const { 
  notifications, 
  unreadCount, 
  loading, 
  fetchNotifications,
  markAsRead, 
  markAllAsRead, 
  clearAll 
} = useNotifications()

// Refresh notifications when modal opens
onMounted(() => {
  fetchNotifications()
})

/**
 * Handle clicking on a notification
 * Marks as read and navigates to the URL if present
 */
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Navigate to URL if present
  if (notification.url) {
    props.onClose()
    await navigateTo(notification.url)
  }
}

/**
 * Mark all notifications as read
 */
const handleMarkAllRead = async () => {
  await markAllAsRead()
}

/**
 * Clear all notifications
 */
const handleClearAll = async () => {
  await clearAll()
}

/**
 * Get icon name based on notification type
 */
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'complaint':
      return 'material-symbols:report-outline'
    case 'fee':
      return 'material-symbols:payments-outline'
    case 'meal':
      return 'material-symbols:restaurant-outline'
    case 'announcement':
      return 'material-symbols:campaign-outline'
    case 'system':
      return 'material-symbols:settings-outline'
    default:
      return 'material-symbols:notifications-outline'
  }
}

/**
 * Get icon container class based on notification type
 */
const getNotificationIconClass = (type: string): string => {
  switch (type) {
    case 'complaint':
      return 'bg-red-100 text-red-600'
    case 'fee':
      return 'bg-green-100 text-green-600'
    case 'meal':
      return 'bg-orange-100 text-orange-600'
    case 'announcement':
      return 'bg-blue-100 text-blue-600'
    case 'system':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-primary/10 text-primary'
  }
}

/**
 * Format timestamp to relative time
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('justNow')
  if (diffMins < 60) return t('minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('daysAgo', { count: diffDays })

  return date.toLocaleDateString()
}
</script>

<style scoped>
/* Line clamp for notification body */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
