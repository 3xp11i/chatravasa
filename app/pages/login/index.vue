<!--
  FILE: app/pages/login/index.vue
  PURPOSE: Login page with phone + access code form.
  TODO:
    - Display AccessCodeForm component
    - After successful validation, show GoogleLoginButton
    - Handle error states
-->
<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary">🍽️ Manav Meals</h1>
        <p class="text-gray-600 mt-2">Sign in to manage your meals</p>
      </div>
      
      <!-- Card -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <!-- Step 1: Access Code Form -->
        <div v-if="!accessCodeValidated">
          <AccessCodeForm @validated="handleCodeValidated" />
        </div>
        
        <!-- Step 2: Google Login (after code validation) -->
        <div v-else>
          <div class="text-center mb-6">
            <p class="text-green-600 font-medium">✓ Access code verified!</p>
            <p class="text-sm text-gray-500 mt-1">Continue with Google to complete sign in</p>
          </div>
          
          <GoogleLoginButton />
          
          <button
            @click="accessCodeValidated = false"
            class="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Use different phone number
          </button>
        </div>
      </div>
      
      <!-- Help text -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an access code?<br />
        Contact the hostel owner.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/login/index.vue
// PURPOSE: Two-step login: access code validation, then Google OAuth

definePageMeta({
  layout: false, // Custom full-page layout
})

// State
const accessCodeValidated = ref(false)
const validatedPhone = ref('')

// Methods
function handleCodeValidated(data: { phone: string }) {
  validatedPhone.value = data.phone
  accessCodeValidated.value = true
  
  // TODO: Store validated phone in session/cookie for linking after OAuth
  // This phone number will be used to link the Google account to the resident profile
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}
</style>
