<!--
  FILE: app/components/auth/GoogleLoginButton.vue
  PURPOSE: Button to initiate Google OAuth login via Supabase Auth.
  TODO:
    - Implement Supabase OAuth sign-in with Google provider
    - Handle loading state during redirect
    - Show error if OAuth fails
-->
<template>
  <button
    @click="handleGoogleLogin"
    :disabled="isLoading"
    class="google-login-btn flex items-center justify-center gap-2 w-full py-2 px-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
  >
    <!-- Google Icon (placeholder) -->
    <svg class="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span>{{ isLoading ? 'Redirecting...' : 'Continue with Google' }}</span>
  </button>
</template>

<script setup lang="ts">
// FILE: app/components/auth/GoogleLoginButton.vue
// PURPOSE: Handle Google OAuth login flow

const isLoading = ref(false)

async function handleGoogleLogin() {
  // TODO: Implement Supabase OAuth login
  // 1. Get Supabase client from composable
  // 2. Call supabase.auth.signInWithOAuth({ provider: 'google' })
  // 3. Handle redirect to Google and callback
  
  isLoading.value = true
  
  try {
    // TODO: Replace with actual Supabase auth call
    // const { useSupabaseClient } = await import('#imports')
    // const supabase = useSupabaseClient()
    // await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     redirectTo: `${window.location.origin}/login/google`
    //   }
    // })
    
    console.log('TODO: Implement Google OAuth login')
    
  } catch (err) {
    console.error('Google login failed:', err)
    isLoading.value = false
  }
}
</script>

<style scoped>
.google-login-btn {
  transition: background-color 0.2s;
}
</style>
