<!--
  FILE: app/pages/index.vue
  PURPOSE: Landing page - redirect based on auth status and role.
  TODO:
    - Check if user is authenticated
    - If authenticated, redirect to role-specific dashboard
    - If not, show welcome message or redirect to login
-->
<template>
  <div class="landing-page flex flex-col items-center justify-center min-h-screen text-center px-4">
    <div class="max-w-md">
      <!-- Logo/Title -->
      <h1 class="text-4xl font-bold text-primary mb-4">🍽️</h1>
      <h2 class="text-2xl font-semibold mb-2">Manav Boys Hostel</h2>
      <p class="text-gray-600 mb-8">Meal Management System</p>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="text-gray-500">
        <p>Loading...</p>
      </div>
      
      <!-- Login Button -->
      <div v-else>
        <NuxtLink
          to="/login"
          class="inline-block bg-primary text-white py-3 px-8 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Get Started
        </NuxtLink>
        
        <p class="text-sm text-gray-500 mt-4">
          Residents, cook, and owner can manage meals
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/index.vue
// PURPOSE: Landing page with role-based redirect

definePageMeta({
  layout: false, // No layout for landing page
})

const router = useRouter()
const isLoading = ref(true)

onMounted(async () => {
  // TODO: Check auth and redirect based on role
  // const { isAuthenticated, profile, initialize } = useAuth()
  // await initialize()
  
  // if (isAuthenticated.value && profile.value) {
  //   switch (profile.value.role) {
  //     case 'resident':
  //       return router.push('/resident')
  //     case 'cook':
  //       return router.push('/cook')
  //     case 'owner':
  //       return router.push('/owner')
  //   }
  // }
  
  isLoading.value = false
})
</script>

<style scoped>
.landing-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}
</style>
