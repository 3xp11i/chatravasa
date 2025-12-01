<!--
  FILE: app/components/auth/AccessCodeForm.vue
  PURPOSE: UI for user to input phone number + access code. On submit → call /api/validate-access-code.
  TODO: 
    - Implement form inputs with validation (phone format, 6-digit code)
    - Show loading state during API call
    - Display error messages on validation failure
    - On success, redirect to Google OAuth login
-->
<template>
  <div class="access-code-form">
    <h2 class="text-xl font-semibold mb-4">Enter Access Code</h2>
    
    <!-- Phone Number Input -->
    <div class="mb-4">
      <label for="phone" class="block text-sm font-medium mb-1">Phone Number</label>
      <input
        id="phone"
        v-model="phone"
        type="tel"
        placeholder="Enter your phone number"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Access Code Input -->
    <div class="mb-4">
      <label for="code" class="block text-sm font-medium mb-1">Access Code</label>
      <input
        id="code"
        v-model="accessCode"
        type="text"
        maxlength="6"
        placeholder="6-digit code"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Error Message -->
    <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
    
    <!-- Submit Button -->
    <button
      @click="handleSubmit"
      :disabled="isLoading"
      class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50"
    >
      {{ isLoading ? 'Verifying...' : 'Continue' }}
    </button>
    
    <p class="text-sm text-gray-500 mt-4 text-center">
      Contact the hostel owner if you don't have an access code.
    </p>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/auth/AccessCodeForm.vue
// PURPOSE: Handle access code form submission and validation

const phone = ref('')
const accessCode = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  // TODO: Implement validation and API call
  // 1. Validate phone format and code length
  // 2. Call /api/validate-access-code with phone + code
  // 3. On success, store temp token and redirect to Google OAuth
  // 4. On failure, show error message
  
  error.value = ''
  isLoading.value = true
  
  try {
    // TODO: Replace with actual API call
    // const response = await $fetch('/api/validate-access-code', {
    //   method: 'POST',
    //   body: { phone: phone.value, code: accessCode.value }
    // })
    
    console.log('TODO: Implement access code validation')
    
  } catch (err: any) {
    error.value = err.message || 'Validation failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Component-specific styles if needed */
.access-code-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
