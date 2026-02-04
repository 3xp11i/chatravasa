<!--
  Notification Permission Prompt Modal
  
  Shown automatically on first PWA launch or after login to request
  notification permission in a friendly, non-intrusive way.
-->
<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div class="bg-white rounded-t-3xl sm:rounded-2xl w-full shadow-2xl animate-slide-up overflow-hidden">
        <!-- Icon -->
        <div class="flex justify-center pt-8 pb-4">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="material-symbols:notifications-active" class="text-5xl text-primary" />
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            {{ t('stayUpdated') }}
          </h2>
          <p class="text-gray-600 mb-2">
            {{ t('notificationPromptDesc') }}
          </p>
          <ul class="text-sm text-gray-500 space-y-1.5 mt-4 mb-6 text-left">
            <li class="flex items-start gap-2">
              <Icon name="material-symbols:check-circle" class="text-green-500 mt-0.5 shrink-0" />
              <span>{{ t('notificationFeature1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="material-symbols:check-circle" class="text-green-500 mt-0.5 shrink-0" />
              <span>{{ t('notificationFeature2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="material-symbols:check-circle" class="text-green-500 mt-0.5 shrink-0" />
              <span>{{ t('notificationFeature3') }}</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="px-6 pb-6 space-y-3">
          <button
            @click="handleEnable"
            :disabled="loading"
            class="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon v-if="loading" name="svg-spinners:90-ring-with-bg" class="text-xl" />
            <span v-else>{{ t('enableNotifications') }}</span>
          </button>
          <button
            @click="handleMaybeLater"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {{ t('maybeLater') }}
          </button>
        </div>

        <!-- Never show again -->
        <button
          @click="handleNeverShow"
          :disabled="loading"
          class="w-full py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          {{ t('dontShowAgain') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)

const {
  requestPermission,
  subscribe,
  permission,
} = usePushNotifications()

/**
 * Enable notifications
 */
const handleEnable = async () => {
  loading.value = true

  try {
    // Request permission
    const granted = await requestPermission()
    
    if (granted) {
      // Subscribe to push notifications
      await subscribe()
      
      // Mark as prompted and accepted
      if (import.meta.client) {
        localStorage.setItem('notification_prompt_status', 'accepted')
      }
      
      emit('close')
    } else {
      // Permission denied
      if (import.meta.client) {
        localStorage.setItem('notification_prompt_status', 'denied')
      }
      emit('close')
    }
  } catch (error) {
    console.error('Error enabling notifications:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Maybe later - can be prompted again later
 */
const handleMaybeLater = () => {
  if (import.meta.client) {
    // Set a timestamp to prompt again after 7 days
    const nextPrompt = Date.now() + (7 * 24 * 60 * 60 * 1000)
    localStorage.setItem('notification_prompt_next', nextPrompt.toString())
  }
  emit('close')
}

/**
 * Never show again
 */
const handleNeverShow = () => {
  if (import.meta.client) {
    localStorage.setItem('notification_prompt_status', 'dismissed')
  }
  emit('close')
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
