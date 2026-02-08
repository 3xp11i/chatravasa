
<template>
  <div>
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

const closeNotificationPrompt = () => {
  closePrompt()
}

// Initialize notification prompt on mount
onMounted(() => {
  initialize()
})

console.log(useSupabaseUser().value);


</script>
