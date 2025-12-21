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
const user = useSupabaseUser();
const { userProfile, fetchUserProfile } = useCurrentUser();

const showInstallButton = ref(false);
let deferredPrompt: any = null;

// Auto-redirect authenticated users to their role-specific home
onMounted(async () => {
  // Check if user is authenticated
  if (user.value) {
    // Ensure we have the profile loaded
    if (!userProfile.value) {
      await fetchUserProfile();
    }
    
    // Check admin status and redirect accordingly
    const isAdminUser = userProfile.value?.is_admin ?? user.value?.user_metadata?.is_admin ?? false;
    
    await navigateTo(isAdminUser ? "/dashboard" : "/resident", { replace: true });
    return;
  }
  
  // If not authenticated, check session explicitly
  const supabase = useSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Fetch profile for session user
    await fetchUserProfile();
    const isAdminUser = userProfile.value?.is_admin ?? session.user?.user_metadata?.is_admin ?? false;
    
    await navigateTo(isAdminUser ? "/dashboard" : "/resident", { replace: true });
    return;
  }
  
  // No authenticated user, show install button and prompt for login
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
  
  // If no session, redirect to login after a short delay
  setTimeout(() => {
    if (!user.value) {
      navigateTo("/login");
    }
  }, 2000);
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