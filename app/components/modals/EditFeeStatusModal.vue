<template>
    <VueFinalModal class="flex justify-center items-center px-4"
                   content-class="max-w-lg w-full max-h-[90vh] max-h-[90dvh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] max-h-[80dvh] overflow-y-auto overflow-x-hidden">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">
                    Update Fee Status
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

            <!-- Resident Info -->
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-4">
                    <img :src="resident.avatar || placeholderAvatar"
                         class="h-16 w-16 rounded-full object-cover border border-gray-200"
                         alt="Resident avatar" />
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">{{ resident.first_name }} {{ resident.last_name }}</h3>
                        <p class="text-sm text-gray-600">Room {{ resident.room || '—' }}</p>
                        <p class="text-xs text-gray-500">{{ resident.phone_number }}</p>
                    </div>
                </div>
            </div>

            <!-- Current Status -->
            <div class="mb-6">
                <div class="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 class="font-medium text-gray-900">Current Month Fee Status</h4>
                        <p class="text-sm text-gray-600">{{ currentMonthName }} {{ currentYear }}</p>
                    </div>
                    <span :class="[
                        'px-3 py-1 text-sm font-medium rounded-full',
                        resident.has_paid_current_month
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    ]">
                        {{ resident.has_paid_current_month ? 'Paid' : 'Not Paid' }}
                    </span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button v-if="!resident.has_paid_current_month"
                        @click="updateStatus(true)"
                        class="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="isSubmitting">
                    {{ isSubmitting ? 'Updating...' : 'Mark as Paid' }}
                </button>
                <button v-if="resident.has_paid_current_month"
                        @click="updateStatus(false)"
                        class="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="isSubmitting">
                    {{ isSubmitting ? 'Updating...' : 'Mark as Not Paid' }}
                </button>
            </div>

            <!-- Status Message -->
            <div v-if="statusMessage"
                 class="mt-4 p-3 rounded-md"
                 :class="statusType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                {{ statusMessage }}
            </div>

            <!-- Close Button -->
            <div class="flex justify-end mt-6">
                <button @click="emit('close')"
                        class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        :disabled="isSubmitting">
                    Close
                </button>
            </div>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

const emit = defineEmits<{
    close: []
    updated: []
}>()

interface Resident {
    id: string
    first_name: string
    last_name: string
    phone_number: string
    room: string
    joining_date: string | null
    father_name: string | null
    family_phone_number: string | null
    avatar: string | null
    has_paid_current_month: boolean
}

const props = defineProps<{
    resident: Resident
    hostelSlug: string
}>()

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const currentMonthName = monthNames[currentMonth]

const updateStatus = async (paid: boolean) => {
    isSubmitting.value = true
    statusMessage.value = ''

    try {
        await $fetch('/api/manage-fees/update-fee-status', {
            method: 'POST',
            body: {
                resident_id: props.resident.id,
                hostel_slug: props.hostelSlug,
                month: currentMonth,
                paid
            }
        })

        statusType.value = 'success'
        statusMessage.value = `Fee status updated to ${paid ? 'Paid' : 'Not Paid'} for ${currentMonthName} ${currentYear}`

        emit('updated')

        // Close modal after 1.5 seconds
        setTimeout(() => {
            emit('close')
        }, 1500)

    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || 'Failed to update fee status. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}
</script>