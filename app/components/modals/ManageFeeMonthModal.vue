<template>
    <VueFinalModal class="flex justify-center items-center"
                   content-class="w-full mx-4 max-h-[90vh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-h-[80vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">
                    {{ t('manageFee') }}
                </h2>
                <button @click="emit('close')"
                        class="text-gray-400 hover:text-gray-600">
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
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">{{ resident.first_name }} {{ resident.last_name }}</h3>
                        <p class="text-sm text-gray-600">{{ t('room') }} {{ resident.room || '—' }}</p>
                        <p class="text-xs text-gray-500">{{ localizeNumber(resident.phone_number) }}</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingFeeMonth" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p class="mt-2 text-sm text-gray-600">{{ t('loading') }}...</p>
            </div>

            <!-- Fee Month Details -->
            <div v-else-if="feeMonth" class="space-y-6">
                <!-- Month Info -->
                <div class="p-4 border rounded-lg">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h4 class="font-medium text-gray-900">{{ currentMonthName }} {{ currentYear }}</h4>
                            <p class="text-sm text-gray-600">{{ t('totalAmount') }}: ₹{{ localizeNumber(feeMonth.total_amount) }}</p>
                        </div>
                        <span :class="[
                            'px-3 py-1 text-sm font-medium rounded-full',
                            feeMonth.status === 'paid' ? 'bg-green-100 text-green-700' :
                            feeMonth.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        ]">
                            {{ feeMonth.status === 'paid' ? t('paid') : 
                               feeMonth.status === 'partial' ? t('partialPaid') : 
                               t('unpaid') }}
                        </span>
                    </div>

                    <!-- Payment Progress -->
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">{{ t('amountPaid') }}</span>
                            <span class="font-medium">₹{{ localizeNumber(feeMonth.total_paid) }}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full transition-all"
                                 :style="{ width: `${Math.min(100, (feeMonth.total_paid / feeMonth.total_amount) * 100)}%` }">
                            </div>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">{{ t('remaining') }}</span>
                            <span class="font-medium">₹{{ localizeNumber(Math.max(0, feeMonth.total_amount - feeMonth.total_paid)) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Form -->
                <div v-if="feeMonth.status !== 'paid'" class="p-4 border rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-4">{{ t('recordPayment') }}</h4>
                    <form @submit.prevent="recordPayment" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                {{ t('paymentAmount') }} *
                            </label>
                            <input v-model.number="paymentForm.amount"
                                   type="number"
                                   min="1"
                                   :max="feeMonth.total_amount - feeMonth.total_paid"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                   required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                {{ t('paymentMethod') }}
                            </label>
                            <select v-model="paymentForm.method"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="">{{ t('selectMethod') }}</option>
                                <option value="Cash">{{ t('cash') }}</option>
                                <option value="Online">{{ t('online') }}</option>
                                <option value="Bank Transfer">{{ t('bankTransfer') }}</option>
                                <option value="Cheque">{{ t('cheque') }}</option>
                            </select>
                        </div>
                        <button type="submit"
                                class="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                :disabled="isSubmitting || !paymentForm.amount">
                            {{ isSubmitting ? t('submitting') : t('recordPayment') }}
                        </button>
                    </form>
                </div>

                <!-- Payment History -->
                <div v-if="payments.length > 0" class="p-4 border rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-4">{{ t('paymentHistory') }}</h4>
                    <div class="space-y-3">
                        <div v-for="payment in payments"
                             :key="payment.id"
                             class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">₹{{ localizeNumber(payment.paid_amount) }}</p>
                                <p class="text-xs text-gray-600">
                                    {{ formatDate(payment.paid_at) }}
                                    <span v-if="payment.payment_method"> • {{ payment.payment_method }}</span>
                                </p>
                                <p class="text-xs text-gray-500">{{ t('markedBy') }}: {{ payment.marked_by_name }}</p>
                            </div>
                            <button @click="deletePayment(payment.id)"
                                    class="text-red-600 hover:text-red-800 p-2"
                                    :disabled="isSubmitting"
                                    :title="t('deletePayment')">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Fee Month -->
            <div v-else class="text-center py-8">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-600 mb-4">{{ t('noFeeMonthFound') }}</p>
                
                <!-- Create Fee Form -->
                <form @submit.prevent="createFeeMonth" class="max-w-sm mx-auto space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ t('totalAmount') }} *
                        </label>
                        <input v-model.number="createFeeForm.amount"
                               type="number"
                               min="1"
                               step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                               :placeholder="residentDetails?.monthly_fee_amount || '0'"
                               required />
                        <p v-if="residentDetails?.monthly_fee_amount" class="text-xs text-gray-500 mt-1">
                            {{ t('defaultAmount') }}: ₹{{ localizeNumber(residentDetails.monthly_fee_amount) }}
                        </p>
                    </div>
                    <button type="submit"
                            class="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                            :disabled="isSubmitting || !createFeeForm.amount || createFeeForm.amount <= 0">
                        {{ isSubmitting ? t('creating') : t('createFeeMonth') }}
                    </button>
                </form>
            </div>

            <!-- Status Message -->
            <div v-if="statusMessage"
                 class="mt-4 p-3 rounded-md"
                 :class="statusType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ statusMessage }}
            </div>

            <!-- Close Button -->
            <div class="flex justify-end mt-6">
                <button @click="emit('close')"
                        class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        :disabled="isSubmitting">
                    {{ t('close') }}
                </button>
            </div>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

const { t } = useI18n()
const { localizeNumber } = useNumberLocalization()

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
    avatar: string | null
    monthly_fee_amount?: string | null
}

const props = defineProps<{
    resident: Resident
    hostelSlug: string
}>()

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const loadingFeeMonth = ref(true)

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const currentMonthName = monthNames[currentMonth]

const feeMonth = ref<any>(null)
const payments = ref<any[]>([])
const residentDetails = ref<any>(null)

const paymentForm = ref({
    amount: 0,
    method: ''
})

const createFeeForm = ref({
    amount: 0
})

// Load fee month data
const loadFeeMonth = async () => {
    loadingFeeMonth.value = true
    try {
        // Load resident details to get monthly_fee_amount
        const residentResponse = await $fetch('/api/manage-resident/get-residents', {
            query: {
                hostel_slug: props.hostelSlug
            }
        })
        residentDetails.value = residentResponse.residents.find((r: any) => r.id === props.resident.id)

        const response = await $fetch('/api/manage-fees/get-months', {
            query: {
                hostel_slug: props.hostelSlug,
                resident_id: props.resident.id,
                year: currentYear,
                month: currentMonth,
                limit: 1
            }
        })

        if (response.fee_months && response.fee_months.length > 0) {
            const fm = response.fee_months[0] as any
            // Check if this is a temporary ID (no record exists)
            if (fm && fm.id && typeof fm.id === 'string' && fm.id.startsWith('no-record-')) {
                feeMonth.value = null // No actual fee month exists
                // Set default amount in create form if available
                if (residentDetails.value?.monthly_fee_amount) {
                    createFeeForm.value.amount = parseFloat(residentDetails.value.monthly_fee_amount)
                }
            } else {
                feeMonth.value = fm
                await loadPayments()
            }
        } else {
            // Set default amount in create form if available
            if (residentDetails.value?.monthly_fee_amount) {
                createFeeForm.value.amount = parseFloat(residentDetails.value.monthly_fee_amount)
            }
        }
    } catch (error) {
        console.error('Failed to load fee month:', error)
    } finally {
        loadingFeeMonth.value = false
    }
}

// Load payment history
const loadPayments = async () => {
    if (!feeMonth.value?.id) return

    try {
        const response = await $fetch('/api/manage-fees/get-payments', {
            query: {
                fee_month_id: feeMonth.value.id
            }
        })
        payments.value = response.payments || []
    } catch (error) {
        console.error('Failed to load payments:', error)
    }
}

// Create fee month
const createFeeMonth = async () => {
    isSubmitting.value = true
    statusMessage.value = ''

    try {
        // Use the amount from the form, fallback to resident's monthly_fee_amount, or default to 0
        const feeAmount = createFeeForm.value.amount || 
            (residentDetails.value?.monthly_fee_amount 
                ? parseFloat(residentDetails.value.monthly_fee_amount) 
                : 0)

        if (feeAmount <= 0) {
            statusType.value = 'error'
            statusMessage.value = 'Please enter a valid fee amount'
            isSubmitting.value = false
            return
        }

        await $fetch('/api/manage-fees/create-month', {
            method: 'POST',
            body: {
                hostel_slug: props.hostelSlug,
                resident_id: props.resident.id,
                year: currentYear,
                month: currentMonth,
                total_amount: feeAmount
            }
        })

        statusType.value = 'success'
        statusMessage.value = t('feeMonthCreated')
        
        createFeeForm.value.amount = 0
        await loadFeeMonth()
        emit('updated')
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || t('failedCreateFeeMonth')
    } finally {
        isSubmitting.value = false
    }
}

// Record payment
const recordPayment = async () => {
    if (!feeMonth.value?.id || !paymentForm.value.amount) return

    isSubmitting.value = true
    statusMessage.value = ''

    try {
        await $fetch('/api/manage-fees/create-payment', {
            method: 'POST',
            body: {
                fee_month_id: feeMonth.value.id,
                paid_amount: paymentForm.value.amount,
                payment_method: paymentForm.value.method || null
            }
        })

        statusType.value = 'success'
        statusMessage.value = t('paymentRecorded')
        
        paymentForm.value = { amount: 0, method: '' }
        await loadFeeMonth()
        emit('updated')
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || t('failedRecordPayment')
    } finally {
        isSubmitting.value = false
    }
}

// Delete payment
const deletePayment = async (paymentId: string) => {
    if (!confirm(t('confirmDeletePayment'))) return

    isSubmitting.value = true
    statusMessage.value = ''

    try {
        await $fetch('/api/manage-fees/delete-payment', {
            method: 'POST',
            body: {
                id: paymentId
            }
        })

        statusType.value = 'success'
        statusMessage.value = t('paymentDeleted')
        
        await loadFeeMonth()
        emit('updated')
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || t('failedDeletePayment')
    } finally {
        isSubmitting.value = false
    }
}

// Format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

// Load on mount
onMounted(() => {
    loadFeeMonth()
})
</script>
