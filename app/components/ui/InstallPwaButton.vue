<!--
  FILE: app/components/ui/InstallPwaButton.vue
  PURPOSE: Button to trigger PWA install prompt on supported browsers.
  TODO:
    - Use usePwaInstall composable to check if installable
    - Show button only when install prompt is available
    - Handle install flow and track installation
-->
<template>
  <button
    v-if="canInstall"
    @click="handleInstall"
    class="pwa-install-btn flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg shadow-lg"
  >
    <span>📲</span>
    <span>Install App</span>
  </button>
</template>

<script setup lang="ts">
// FILE: app/components/ui/InstallPwaButton.vue
// PURPOSE: PWA installation prompt button

// TODO: Use usePwaInstall composable
// const { canInstall, promptInstall } = usePwaInstall()

// Placeholder state
const canInstall = ref(false)
const deferredPrompt = ref<any>(null)

// Listen for beforeinstallprompt event
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt.value = e
    canInstall.value = true
  })
  
  // Hide button if app is already installed
  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    deferredPrompt.value = null
  })
})

async function handleInstall() {
  if (!deferredPrompt.value) return
  
  // Show the install prompt
  deferredPrompt.value.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice
  
  console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`)
  
  // Clear the deferred prompt
  deferredPrompt.value = null
  canInstall.value = false
}
</script>

<style scoped>
.pwa-install-btn {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
