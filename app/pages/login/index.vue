<template>
  <div class="min-h-screen mt-10 flex items-start justify-center p-4">
    <div class="w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p class="text-gray-600">Select your login type to continue</p>
      </div>

      <div class="space-y-4">
        <!-- Resident Login Card -->
        <NuxtLink to="/login/resident" 
                  class="block bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-200 border border-gray-100 hover:border-primary/30 group">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <h3 class="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">Resident Login</h3>
              <p class="text-sm text-gray-600">Access your hostel dashboard</p>
            </div>
            <svg class="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <!-- Staff Login Card -->
        <NuxtLink to="/login/staff" 
                  class="block bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-200 border border-gray-100 hover:border-primary/30 group">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
              <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Staff Login</h3>
              <p class="text-sm text-gray-600">Access your staff dashboard</p>
            </div>
            <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <!-- Admin Login Card -->
        <NuxtLink to="/login/admin" 
                  class="block bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-200 border border-gray-100 hover:border-primary/30 group">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <h3 class="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Admin Login</h3>
              <p class="text-sm text-gray-600">Manage hostels and residents</p>
            </div>
            <svg class="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>

      <!-- Back to Home Link -->
      <div class="text-center mt-8">
        <NuxtLink to="/" class="text-sm text-gray-600 hover:text-primary transition-colors">
          ← Back to Home
        </NuxtLink>
      </div>

      <!-- Install App Button -->
      <div class="text-center mt-6" v-if="showInstallButton">
        <button 
          @click="installPWA"
          class="inline-flex items-center gap-2 px-6 py-3 bg-warning hover:bg-orange-600 text-white font-medium rounded-lg shadow-md transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Install App
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const showInstallButton = ref(false);
let deferredPrompt: any = null;

const checkIfInstalled = () => {
  // Check if app is running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running as PWA on iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

const handleBeforeInstallPrompt = (e: any) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton.value = true;
  console.log('Install prompt available, showing button');
};

const handleAppInstalled = () => {
  showInstallButton.value = false;
  deferredPrompt = null;
  console.log('App installed successfully');
};

onMounted(async () => {
  // Don't show if already installed
  if (checkIfInstalled()) {
    console.log('App is already installed');
    return;
  }

  // Check if browser supports installation
  if (!window.hasOwnProperty('onbeforeinstallprompt')) {
    console.log('Browser does not support PWA installation');
    return;
  }

  // Set up event listeners
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  // Show a fallback button after a short delay if prompt hasn't fired
  // This helps in cases where the event was consumed earlier
  setTimeout(() => {
    if (!deferredPrompt && !checkIfInstalled()) {
      // Show button even without deferred prompt for manual installation guidance
      showInstallButton.value = true;
      console.log('Showing fallback install button');
    }
  }, 2000);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});

async function installPWA() {
  if (deferredPrompt) {
    // Use the native install prompt if available
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      deferredPrompt = null;
      showInstallButton.value = false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  } else {
    // Fallback: Show manual installation instructions
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    let instructions = 'To install this app:\n\n';
    
    if (isChrome || isEdge) {
      instructions += '1. Click the menu (⋮) in the top-right corner\n';
      instructions += '2. Select "Install app" or "Install Chatravasa"\n';
      instructions += '3. Follow the prompts to install';
    } else if (isSafari) {
      instructions += '1. Tap the Share button\n';
      instructions += '2. Scroll down and tap "Add to Home Screen"\n';
      instructions += '3. Tap "Add" to install';
    } else {
      instructions += '1. Open your browser menu\n';
      instructions += '2. Look for "Install app" or "Add to Home Screen"\n';
      instructions += '3. Follow the prompts to install';
    }
    
    alert(instructions);
  }
}

</script>