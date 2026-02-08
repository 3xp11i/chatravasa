
<template>
  <div>
    <!-- Initial Loading Screen -->
    <Transition name="fade">
      <div 
        v-if="!isInitialized"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm"
        style="pointer-events: all;"
      >
        <div class="flex flex-col items-center gap-4">
          <Icon 
            name="svg-spinners:180-ring" 
            class="text-6xl text-green-600" 
          />
          <p class="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    </Transition>

    <!-- Loading indicator for page transitions -->
    <NuxtLoadingIndicator color="#16a34a" />
    
    <!-- Accessibility: announces route changes to screen readers -->
    <ClientOnly>
      <NuxtRouteAnnouncer />
    </ClientOnly>
    
    <!-- Pages with their layouts render here -->
    <NuxtLayout />
    <NuxtPage />

    <!-- Notification Permission Prompt -->
    <NotificationPermissionPrompt 
      v-if="showNotificationPrompt" 
      @close="closeNotificationPrompt"
    />

    <!-- PWA Update Prompt -->
    <ClientOnly>
      <UpdatePrompt />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import NotificationPermissionPrompt from '~/components/modals/NotificationPermissionPrompt.vue'

const { showPrompt: showNotificationPrompt, initialize, closePrompt } = useNotificationPrompt()
const { isInitialized, initialize: initializeApp } = useAppInitialization()

const closeNotificationPrompt = () => {
  closePrompt()
}

// Initialize app on mount
onMounted(async () => {
  await initializeApp()
  initialize()
})

console.log(useSupabaseUser().value);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
