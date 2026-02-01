<!--
  Settings Page
  
  Allows users to manage app settings including:
  - Push notification preferences
  - Other app-wide settings
  
  Accessible from the sidebar navigation.
-->
<template>
  <div class="text-text px-4 py-8 mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ t('settings') }}</h1>

    <!-- Push Notifications Section -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">{{ t('pushNotifications') }}</h2>
        <Icon 
          name="material-symbols:notifications-active" 
          class="text-2xl text-primary"
        />
      </div>

      <!-- Browser Support Check -->
      <div v-if="!isSupported" class="p-4 bg-yellow-50 rounded-lg mb-4">
        <div class="flex items-start gap-3">
          <Icon name="material-symbols:warning" class="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-yellow-800">{{ t('notSupported') }}</p>
            <p class="text-sm text-yellow-700 mt-1">{{ t('notSupportedDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- iOS PWA Install Prompt -->
      <div v-else-if="isIOS && !isStandalone" class="p-4 bg-blue-50 rounded-lg mb-4">
        <div class="flex items-start gap-3">
          <Icon name="material-symbols:phone-iphone" class="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-blue-800">{{ t('iosInstallRequired') }}</p>
            <ol class="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
              <li>{{ t('iosStep1') }}</li>
              <li>{{ t('iosStep2') }}</li>
              <li>{{ t('iosStep3') }}</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Permission Denied -->
      <div v-else-if="permission === 'denied'" class="p-4 bg-red-50 rounded-lg mb-4">
        <div class="flex items-start gap-3">
          <Icon name="material-symbols:block" class="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-red-800">{{ t('permissionDenied') }}</p>
            <p class="text-sm text-red-700 mt-1">{{ t('permissionDeniedDesc') }}</p>
          </div>
        </div>
      </div>

      <!-- Notification Toggle -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">{{ t('enableNotifications') }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ t('enableNotificationsDesc') }}</p>
          </div>
          <button
            @click="toggleNotifications"
            :disabled="loading"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            :class="isSubscribed ? 'bg-primary' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
              :class="isSubscribed ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" class="p-3 rounded-lg text-sm" :class="statusClass">
          {{ statusMessage }}
        </div>

        <!-- Test Notification Button (only when subscribed) -->
        <button
          v-if="isSubscribed"
          @click="sendTestNotification"
          :disabled="testLoading"
          class="w-full py-3 px-4 rounded-lg font-medium text-primary border-2 border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <span v-if="testLoading">{{ t('sending') }}</span>
          <span v-else>{{ t('sendTestNotification') }}</span>
        </button>
      </div>
    </div>

    <!-- Notification Types Info -->
    <div class="card">
      <h2 class="text-lg font-semibold mb-4">{{ t('notificationTypes') }}</h2>
      <ul class="space-y-3 text-sm text-gray-600">
        <li class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Icon name="material-symbols:report-outline" class="text-red-600" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ t('complaintNotifications') }}</p>
            <p class="text-gray-500">{{ t('complaintNotificationsDesc') }}</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Icon name="material-symbols:payments-outline" class="text-green-600" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ t('feeNotifications') }}</p>
            <p class="text-gray-500">{{ t('feeNotificationsDesc') }}</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon name="material-symbols:campaign-outline" class="text-blue-600" />
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ t('announcementNotifications') }}</p>
            <p class="text-gray-500">{{ t('announcementNotificationsDesc') }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'default',
  name: 'settings',
})

const { t } = useI18n()

// Push notification composable
const {
  isSupported,
  isSubscribed,
  permission,
  loading,
  error,
  requestPermission,
  subscribe,
  unsubscribe,
} = usePushNotifications()

// Local state
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const testLoading = ref(false)

// Computed class for status message
const statusClass = computed(() => {
  return statusType.value === 'success'
    ? 'bg-green-50 text-green-800'
    : 'bg-red-50 text-red-800'
})

// Check for iOS and standalone mode
const isIOS = computed(() => {
  if (!import.meta.client) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
})

const isStandalone = computed(() => {
  if (!import.meta.client) return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true
})

/**
 * Toggle push notification subscription
 */
const toggleNotifications = async () => {
  statusMessage.value = ''

  if (isSubscribed.value) {
    // Unsubscribe
    const success = await unsubscribe()
    if (success) {
      statusMessage.value = t('unsubscribeSuccess')
      statusType.value = 'success'
    } else {
      statusMessage.value = error.value || t('unsubscribeFailed')
      statusType.value = 'error'
    }
  } else {
    // Request permission first if needed
    if (permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        statusMessage.value = t('permissionRequired')
        statusType.value = 'error'
        return
      }
    }

    // Subscribe
    const subscription = await subscribe()
    if (subscription) {
      statusMessage.value = t('subscribeSuccess')
      statusType.value = 'success'
    } else {
      statusMessage.value = error.value || t('subscribeFailed')
      statusType.value = 'error'
    }
  }

  // Clear status after 5 seconds
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}

/**
 * Send a test notification to verify setup
 */
const sendTestNotification = async () => {
  testLoading.value = true
  statusMessage.value = ''

  try {
    await $fetch('/api/push/test', { method: 'POST' })
    statusMessage.value = t('testNotificationSent')
    statusType.value = 'success'
  } catch (err: any) {
    statusMessage.value = t('testNotificationFailed')
    statusType.value = 'error'
  } finally {
    testLoading.value = false
  }

  // Clear status after 5 seconds
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
}
</script>

<style scoped>
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
