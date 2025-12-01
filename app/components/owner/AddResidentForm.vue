<!--
  FILE: app/components/owner/AddResidentForm.vue
  PURPOSE: Form for owner to add a new resident (phone, name, room, role).
  TODO:
    - Input fields for phone, full name, room number
    - Option to set role (resident/cook)
    - Generate access code on backend
    - Display generated access code to owner
    - Validate phone uniqueness
-->
<template>
  <div class="add-resident-form">
    <h2 class="text-xl font-semibold mb-4">Add New Resident</h2>
    
    <!-- Phone Number -->
    <div class="mb-4">
      <label for="phone" class="block text-sm font-medium mb-1">Phone Number *</label>
      <input
        id="phone"
        v-model="form.phone"
        type="tel"
        placeholder="+91 98765 43210"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Full Name -->
    <div class="mb-4">
      <label for="fullName" class="block text-sm font-medium mb-1">Full Name *</label>
      <input
        id="fullName"
        v-model="form.fullName"
        type="text"
        placeholder="Enter resident's name"
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
        placeholder="e.g., 101"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <!-- Role Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Role</label>
      <select
        v-model="form.role"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      >
        <option value="resident">Resident</option>
        <option value="cook">Cook</option>
      </select>
    </div>
    
    <!-- Error Message -->
    <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
    
    <!-- Generated Access Code Display -->
    <div v-if="generatedCode" class="mb-4 p-4 bg-green-50 rounded-lg">
      <p class="text-sm text-gray-600 mb-1">Access Code Generated:</p>
      <p class="text-2xl font-mono font-bold text-green-700">{{ generatedCode }}</p>
      <p class="text-xs text-gray-500 mt-2">Share this code with the resident to complete registration.</p>
    </div>
    
    <!-- Submit Button -->
    <button
      @click="handleSubmit"
      :disabled="isLoading"
      class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50"
    >
      {{ isLoading ? 'Adding...' : 'Add Resident' }}
    </button>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/owner/AddResidentForm.vue
// PURPOSE: Form to add new residents (owner only)

const emit = defineEmits<{
  (e: 'resident-added', data: any): void
}>()

// Form state
const form = reactive({
  phone: '',
  fullName: '',
  roomNumber: '',
  role: 'resident'
})

const error = ref('')
const generatedCode = ref('')
const isLoading = ref(false)

// Methods
async function handleSubmit() {
  error.value = ''
  generatedCode.value = ''
  isLoading.value = true
  
  try {
    // Validate required fields
    if (!form.phone || !form.fullName) {
      throw new Error('Phone and name are required')
    }
    
    // TODO: Call API to add resident
    // const response = await $fetch('/api/owner-add-resident', {
    //   method: 'POST',
    //   body: { ...form }
    // })
    // generatedCode.value = response.accessCode
    
    console.log('TODO: Implement add resident API call')
    
    // Placeholder: generate fake code for demo
    generatedCode.value = Math.random().toString().slice(2, 8)
    
    emit('resident-added', { ...form, accessCode: generatedCode.value })
    
    // Reset form (keep role selection)
    form.phone = ''
    form.fullName = ''
    form.roomNumber = ''
    
  } catch (err: any) {
    error.value = err.message || 'Failed to add resident'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.add-resident-form {
  max-width: 400px;
}
</style>
