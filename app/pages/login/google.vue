<!--
  FILE: app/pages/login/google.vue
  PURPOSE: Handle Google OAuth callback and link user to profile.
  TODO:
    - Receive OAuth callback from Supabase
    - Call /api/link-user to link auth user to resident profile
    - Redirect to appropriate dashboard based on role
-->
<template>
  <div class="google-callback min-h-screen flex items-center justify-center">
    <div class="text-center">
      <!-- Loading State -->
      <div v-if="isLoading">
        <div class="animate-spin text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Completing sign in...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error">
        <div class="text-4xl mb-4">❌</div>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <NuxtLink to="/login" class="text-primary mt-4 inline-block">
          Try again
        </NuxtLink>
      </div>
      
      <!-- Success (should redirect) -->
      <div v-else>
        <div class="text-4xl mb-4">✅</div>
        <p class="text-green-600">Success! Redirecting...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/login/google.vue
// PURPOSE: Google OAuth callback handler

definePageMeta({
  layout: false,
})

const router = useRouter()

const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // TODO: Handle OAuth callback
    // 1. Supabase should have set the session automatically
    // 2. Get the authenticated user
    // const { user } = useAuth()
    
    // 3. Get the validated phone from session/cookie (set during access code step)
    // const validatedPhone = useCookie('validated_phone').value
    
    // 4. Link the auth user to the resident profile
    // await $fetch('/api/link-user', {
    //   method: 'POST',
    //   body: { phone: validatedPhone }
    // })
    
    // 5. Fetch the profile to get role
    // await useAuth().fetchProfile(user.value.id)
    
    // 6. Redirect based on role
    // const { profile } = useAuth()
    // switch (profile.value?.role) {
    //   case 'resident':
    //     await router.push('/resident')
    //     break
    //   case 'cook':
    //     await router.push('/cook')
    //     break
    //   case 'owner':
    //     await router.push('/owner')
    //     break
    //   default:
    //     await router.push('/')
    // }
    
    console.log('TODO: Handle OAuth callback and user linking')
    
    // Placeholder: redirect after delay
    setTimeout(() => {
      router.push('/resident')
    }, 2000)
    
  } catch (err: any) {
    error.value = err.message || 'Failed to complete sign in'
    isLoading.value = false
  }
})
</script>

<style scoped>
.google-callback {
  background-color: #f9fafb;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
