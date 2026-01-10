<template>
    <VueFinalModal class="flex justify-center items-center"
                   content-class="w-full mx-4 max-h-[90vh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">
                    Add New Resident
                </h2>
                <button @click="emit('close')"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-6 h-6"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Info Message -->
            <div class="mb-4 p-3 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm">
                The resident will be added to your hostel. They can login using their phone number when ready.
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit">
                <div class="space-y-4">
                    <!-- First & Last Name -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="firstName"
                                   class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                First Name <span class="text-red-500">*</span>
                            </label>
                            <input id="firstName"
                                   v-model="formData.first_name"
                                   type="text"
                                   required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                   placeholder="Enter first name" />
                        </div>
                        <div>
                            <label for="lastName"
                                   class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Last Name <span class="text-red-500">*</span>
                            </label>
                            <input id="lastName"
                                   v-model="formData.last_name"
                                   type="text"
                                   required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                   placeholder="Enter last name" />
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <PhoneInput
                      v-model="formData.phone"
                      label="Phone Number"
                      required
                    />

                    <!-- Room -->
                    <div>
                        <label for="room"
                               class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Room <span class="text-red-500">*</span>
                        </label>
                        <input id="room"
                               v-model="formData.room"
                               type="text"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                               placeholder="Enter room number or name" />
                    </div>

                    <!-- Joining Date -->
                    <div>
                        <label for="joiningDate"
                               class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Joining Date
                        </label>
                        <input id="joiningDate"
                               v-model="formData.joining_date"
                               type="date"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>

                    <!-- Guardian Name -->
                    <div>
                        <label for="guardianName"
                               class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Guardian Name
                        </label>
                        <input id="guardianName"
                               v-model="formData.guardian_name"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                               placeholder="Enter guardian's name" />
                    </div>

                    <!-- Family Phone Number -->
                    <div>
                        <label for="familyPhoneNumber"
                               class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Family Phone Number
                        </label>
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600">
                                +91
                            </span>
                            <input id="familyPhoneNumber"
                                   v-model="formData.family_phone_number"
                                   type="tel"
                                   pattern="[0-9]{10}"
                                   maxlength="10"
                                   placeholder="9876543210"
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>

                </div>

                <!-- Status Message -->
                <div v-if="statusMessage"
                     class="mt-4 p-3 rounded-md"
                     :class="statusType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                    {{ statusMessage }}
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button"
                            @click="emit('close')"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            :disabled="isSubmitting">
                        Cancel
                    </button>
                    <button type="submit"
                            class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="isSubmitting">
                        {{ isSubmitting ? 'Adding...' : 'Add Resident' }}
                    </button>
                </div>
            </form>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

const emit = defineEmits<{
    close: []
    created: []
}>()

const route = useRoute()
const hostelSlug = route.params.hostelslug as string

const formData = ref({
    first_name: '',
    last_name: '',
    phone: '',
    room: '',
    joining_date: '',
    guardian_name: '',
    family_phone_number: ''
})

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const handleSubmit = async () => {
    isSubmitting.value = true
    statusMessage.value = ''

    try {
        // Normalize phone numbers to +91 format
        const normalizedPhone = formData.value.phone.startsWith('+91') ? formData.value.phone : `+91${formData.value.phone}`
        const normalizedFamilyPhone = formData.value.family_phone_number ? (formData.value.family_phone_number.startsWith('+91') ? formData.value.family_phone_number : `+91${formData.value.family_phone_number}`) : null

        const response = await $fetch('/api/manage-resident/add-resident', {
            method: 'POST',
            body: {
                first_name: formData.value.first_name,
                last_name: formData.value.last_name,
                phone: normalizedPhone,
                room: formData.value.room,
                joining_date: formData.value.joining_date || null,
                guardian_name: formData.value.guardian_name || null,
                family_phone_number: normalizedFamilyPhone,
                hostel_slug: hostelSlug
            }
        })

        statusType.value = 'success'
        statusMessage.value = 'Resident added successfully!'

        emit('created')

        // Reset form
        formData.value = {
            first_name: '',
            last_name: '',
            phone: '',
            room: '',
            joining_date: '',
            guardian_name: '',
            family_phone_number: ''
        }

        // Close modal after 1.5 seconds
        setTimeout(() => {
            emit('close')
        }, 1500)

    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || 'Failed to add resident. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}
</script>
