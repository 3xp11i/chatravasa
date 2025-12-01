<!--
  FILE: app/components/resident/ProfileForm.vue
  PURPOSE: Form for resident to update their profile (name, room number, avatar).
  TODO:
    - Load current profile data from useProfile composable
    - Validate inputs
    - Submit updates to API
    - Handle avatar upload (optional)
    - Show success/error feedback
-->
<template>
  <div class="profile-form">
    <h2 class="text-xl font-semibold mb-4">Edit Profile</h2>
    
    <!-- Avatar (placeholder) -->
    <div class="flex justify-center mb-6">
      <div class="relative">
        <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
          {{ avatarInitial }}
        </div>
        <button class="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full text-xs">
          📷
        </button>
      </div>
    </div>
    
    <!-- Full Name -->
    <div class="mb-4">
      <label for="fullName" class="block text-sm font-medium mb-1">Full Name</label>
      <input
        id="fullName"
        v-model="form.fullName"
        type="text"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Room Number -->
    <div class="mb-4">
      <label for="roomNumber" class="block text-sm font-medium mb-1">Room Number</label>
      <input
        id="roomNumber"
        v-model="form.roomNumber"
        type="text"
        placeholder="e.g., 101, A-12"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Phone (read-only) -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Phone Number</label>
      <input
        :value="form.phone"
        type="tel"
        disabled
        class="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
      />
      <p class="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
    </div>
    
    <!-- Error/Success Messages -->
    <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
    <p v-if="success" class="text-green-500 text-sm mb-4">{{ success }}</p>
    
    <!-- Submit Button -->
    <button
      @click="handleSubmit"
      :disabled="isLoading"
      class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50"
    >
      {{ isLoading ? 'Saving...' : 'Save Changes' }}
    </button>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/resident/ProfileForm.vue
// PURPOSE: Profile editing form

// Form state
const form = reactive({
  fullName: '',
  roomNumber: '',
  phone: '',
  avatarUrl: ''
})

const error = ref('')
const success = ref('')
const isLoading = ref(false)

// Computed
const avatarInitial = computed(() => {
  return form.fullName ? form.fullName.charAt(0).toUpperCase() : '?'
})

// Load profile on mount
onMounted(async () => {
  // TODO: Load profile from useProfile composable
  // const profile = await useProfile().fetchProfile()
  // Object.assign(form, profile)
  
  // Placeholder data
  form.fullName = 'John Doe'
  form.roomNumber = '101'
  form.phone = '+91 98765 43210'
})

// Methods
async function handleSubmit() {
  error.value = ''
  success.value = ''
  isLoading.value = true
  
  try {
    // TODO: Validate and submit to API
    // await useProfile().updateProfile({
    //   fullName: form.fullName,
    //   roomNumber: form.roomNumber
    // })
    
    console.log('TODO: Implement profile update')
    success.value = 'Profile updated successfully!'
    
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.profile-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
