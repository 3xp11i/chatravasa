<template>
  <div class="min-h-screen bg-background">
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "public"
});

const user = useSupabaseUser();
const { userProfile, fetchUserProfile } = useCurrentUser();

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
  

  if (!user.value || !session?.user) {

    navigateTo('/login')  
  }


});

</script>

<style scoped>

</style>