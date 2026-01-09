<template>
    <VueFinalModal class="flex justify-center items-center"
                    content-class="w-full mx-4 max-h-[90vh]"
                    overlay-transition="vfm-fade"
                    content-transition="vfm-fade">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Add Staff Member</h1>

            <form @submit.prevent="handleSubmit"
                  class="space-y-4">
            <!-- First Name -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input v-model="formData.first_name"
                       type="text"
                       placeholder="Enter first name"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                       required />
            </div>

            <!-- Last Name -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input v-model="formData.last_name"
                       type="text"
                       placeholder="Enter last name"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                       required />
            </div>

            <!-- Phone Number -->
            <PhoneInput
              v-model="formData.phone"
              label="Phone Number"
              required
            />

            <!-- Role Selection -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select v-model="formData.role_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required>
                    <option value="">Select a role</option>
                    <option v-for="role in roles"
                            :key="role.id"
                            :value="role.id">
                        {{ role.title }}
                    </option>
                </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 justify-end pt-4">
                <button type="button"
                        @click="emit('close')"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                </button>
                <button type="submit"
                        :disabled="loading"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ loading ? 'Adding...' : 'Add Staff Member' }}
                </button>
            </div>
        </form>

            <div v-if="error"
                 class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ error }}
            </div>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

interface Props {
    roles: any[]
    hostelSlug: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    created: []
}>()

const loading = ref(false)
const error = ref('')

const formData = reactive({
    first_name: '',
    last_name: '',
    phone: '',
    role_id: ''
})

const handleSubmit = async () => {
    loading.value = true
    error.value = ''

    try {
        // Convert phone to full format if it's just digits
        const fullPhone = formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`
        
        await $fetch('/api/manage-staff/add-staff-member', {
            method: 'POST',
            body: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: fullPhone,
                role_id: formData.role_id,
                hostel_slug: props.hostelSlug
            }
        })
        emit('created')
        emit('close')
    } catch (err: any) {
        error.value = err.data?.message || 'Failed to add staff member'
    } finally {
        loading.value = false
    }
}
</script>
