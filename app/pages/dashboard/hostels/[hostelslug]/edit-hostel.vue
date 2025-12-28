<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Edit Hostel</h1>
      <p class="text-gray-600">Update hostel information</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow p-8 flex justify-center items-center">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent"></div>
        <p class="text-gray-600">Loading hostel details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-red-800 font-medium mb-4">{{ error }}</p>
      <button
        type="button"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        @click="fetchHostel"
      >
        Retry
      </button>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="submitForm" class="bg-white rounded-xl shadow p-6 space-y-6">
      <div class="form-group">
        <label for="hostelName" class="block text-sm font-medium text-gray-700 mb-2">
          Hostel Name <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="hostelName"
          v-model="formData.hostelName"
          placeholder="Enter hostel name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>

      <div class="form-group">
        <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
          Address <span class="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          v-model="formData.address"
          placeholder="Enter complete address"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="totalRooms" class="block text-sm font-medium text-gray-700 mb-2">
            Total Rooms <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalRooms"
            v-model.number="formData.totalRooms"
            placeholder="0"
            min="1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div class="form-group">
          <label for="availableRooms" class="block text-sm font-medium text-gray-700 mb-2">
            Available Rooms
          </label>
          <input
            type="number"
            id="availableRooms"
            v-model.number="formData.availableRooms"
            placeholder="Same as total"
            min="0"
            :max="formData.totalRooms"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <small class="text-gray-500 text-xs">Leave empty to use total rooms</small>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-green-800 font-medium">✓ {{ successMessage }}</p>
      </div>

      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 font-medium">{{ errorMessage }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="submitting || !hasChanges"
          class="flex-1 bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Saving Changes...' : 'Save Changes' }}
        </button>

        <button
          type="button"
          @click="goBack"
          class="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import type { Database } from '~/types/database.types'

type Hostel = Database['public']['Tables']['hostels']['Row']

const route = useRoute()
const router = useRouter()
const hostelSlug = route.params.hostelslug as string

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const hostel = ref<Hostel | null>(null)

const formData = ref({
  hostelName: '',
  address: '',
  totalRooms: 0,
  availableRooms: null as number | null,
})

const originalFormData = ref({
  hostelName: '',
  address: '',
  totalRooms: 0,
  availableRooms: null as number | null,
})

const hasChanges = computed(() => {
  return (
    formData.value.hostelName !== originalFormData.value.hostelName ||
    formData.value.address !== originalFormData.value.address ||
    formData.value.totalRooms !== originalFormData.value.totalRooms ||
    formData.value.availableRooms !== originalFormData.value.availableRooms
  )
})

const fetchHostel = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/manage-hostel/get-hostel-by-slug', {
      query: { slug: hostelSlug },
    })

    if (response.success && response.hostel) {
      hostel.value = response.hostel
      
      // Populate form
      formData.value = {
        hostelName: response.hostel.hostel_name,
        address: response.hostel.address,
        totalRooms: response.hostel.total_rooms,
        availableRooms: response.hostel.available_rooms,
      }
      
      // Store original values
      originalFormData.value = { ...formData.value }
    }
  } catch (err: any) {
    console.error('Error fetching hostel:', err)
    error.value = err.data?.statusMessage || 'Failed to load hostel details'
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!hasChanges.value || !hostel.value) return

  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const formDataToSend = new FormData()
    formDataToSend.append('hostelName', formData.value.hostelName)
    formDataToSend.append('address', formData.value.address)
    formDataToSend.append('totalRooms', formData.value.totalRooms.toString())
    
    if (formData.value.availableRooms !== null) {
      formDataToSend.append('availableRooms', formData.value.availableRooms.toString())
    }

    const response = await $fetch(`/api/manage-hostel/update-hostel?slug=${hostelSlug}`, {
      method: 'PATCH',
      body: formDataToSend,
    })

    if (response.success) {
      successMessage.value = 'Hostel updated successfully!'
      
      // Update original values
      originalFormData.value = { ...formData.value }
      
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (err: any) {
    console.error('Error updating hostel:', err)
    errorMessage.value = err.data?.statusMessage || 'Failed to update hostel. Please try again.'
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push(`/dashboard/hostels/${hostelSlug}`)
}

onMounted(() => {
  fetchHostel()
})
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
}
</style>