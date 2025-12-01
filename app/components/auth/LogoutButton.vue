<!--
  FILE: app/components/auth/LogoutButton.vue
  PURPOSE: Button to sign out the current user and clear session.
  TODO:
    - Call Supabase auth.signOut()
    - Clear any local state (composables, localStorage)
    - Redirect to login page
-->
<template>
  <button
    @click="handleLogout"
    :disabled="isLoading"
    class="logout-btn text-red-600 hover:text-red-700 disabled:opacity-50"
  >
    {{ isLoading ? 'Signing out...' : 'Sign Out' }}
  </button>
</template>

<script setup lang="ts">
// FILE: app/components/auth/LogoutButton.vue
// PURPOSE: Handle user logout

const router = useRouter()
const isLoading = ref(false)

async function handleLogout() {
  isLoading.value = true
  
  try {
    // TODO: Implement Supabase logout
    // const { useSupabaseClient } = await import('#imports')
    // const supabase = useSupabaseClient()
    // await supabase.auth.signOut()
    
    console.log('TODO: Implement logout')
    
    // Redirect to login page
    await router.push('/login')
    
  } catch (err) {
    console.error('Logout failed:', err)
  } finally {
    isLoading.value = false
  }
}
</script>
