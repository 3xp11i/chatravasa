<template>
    <div
    v-if="offlineReady || needRefresh"
    class="fixed bottom-0 right-0 bg-white border-2 border-green-600 rounded-t-lg shadow-xl p-4 z-50 animate-slide-up"
  >
    <div class="flex items-start gap-3">
      <Icon name="heroicons:arrow-path" class="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 mb-1">
          {{ offlineReady ? 'App ready to work offline' : 'Update Available!' }}
        </h3>
        <p class="text-sm text-gray-600 mb-3">
          {{ offlineReady 
            ? 'You can now use this app offline' 
            : 'A new version is available. Click "Reload Now" to update immediately, or it will update automatically next time you restart the app.' 
          }}
        </p>
        <div class="flex gap-2">
          <button
            v-if="needRefresh"
            @click="updateServiceWorker(true)"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Reload Now
          </button>
          <button
            @click="close"
            class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            {{ needRefresh ? 'On Next Restart' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW()

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
