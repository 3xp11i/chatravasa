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
const { staffContext, loading: staffLoading, fetchStaffContext } = useStaffContext();

// Check if user has staff assignments (more reliable than isStaff computed)
const hasStaffAssignments = computed(() => {
  return staffContext.value.assignments && staffContext.value.assignments.length > 0;
});

// Auto-redirect authenticated users to their role-specific home
onMounted(async () => {
  const supabase = useSupabaseClient();
  
  // Get session - this is the most reliable way to check auth
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    navigateTo('/login');
    return;
  }
  
  // Ensure we have the profile loaded
  if (!userProfile.value) {
    await fetchUserProfile();
  }
  
  // Check admin status first
  const isAdminUser = userProfile.value?.is_admin ?? false;
  
  if (isAdminUser) {
    await navigateTo("/dashboard", { replace: true });
    return;
  }
  
  // Fetch staff context to determine if user is staff
  // Pass the user ID from session since useSupabaseUser() might not be ready
  await fetchStaffContext(true);
  
  // Wait a tick for state to update
  await nextTick();
  
  // Check if user has staff assignments
  if (staffContext.value.assignments && staffContext.value.assignments.length > 0) {
    await navigateTo("/dashboard", { replace: true });
    return;
  }
  
  // Not admin and not staff - redirect to resident
  await navigateTo("/resident", { replace: true });
});
</script>

<style scoped>

</style>