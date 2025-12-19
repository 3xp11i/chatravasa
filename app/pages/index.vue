<template>
  <div class="text-center mt-10 pt-5">
    <h1><span class="hindiFont">छात्रावास</span> Management</h1>
    
    <button 
      v-if="showInstallButton"
      @click="installPWA"
      class="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
    >
      Install App
    </button>
  </div>
</template>

<script lang="ts" setup>
const showInstallButton = ref(false);
let deferredPrompt: any = null;

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    showInstallButton.value = true;
  });

  window.addEventListener('appinstalled', () => {
    // Hide the install button after successful installation
    showInstallButton.value = false;
    deferredPrompt = null;
  });
});

async function installPWA() {
  if (!deferredPrompt) {
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }
  
  // Clear the deferred prompt
  deferredPrompt = null;
}
</script>

<style>



</style>