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

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton.value = true;
    console.log("showInstallButton", showInstallButton.value);
    
  });

  window.addEventListener('appinstalled', () => {
    showInstallButton.value = false;
    deferredPrompt = null;
  });
});

async function installPWA() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  }
  
  deferredPrompt = null;
  showInstallButton.value = false;
}

</script>