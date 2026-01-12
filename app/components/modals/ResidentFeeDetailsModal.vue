<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { ref, computed } from 'vue'

const props = defineProps<{
    resident: any
    hostelSlug: string
}>()

const emit = defineEmits<{
    close: []
    updated: []
}>()

const { t } = useI18n()
const { localizeNumber } = useNumberLocalization()

const isLoading = ref(false)
const isSaving = ref(false)
const categories = ref<any[]>([])
const paymentHistory = ref<any[]>([])
const allMonthsPayments = ref<any[]>([])
const selectedCategoryId = ref<string | null>(props.resident.fee_category_id)
const discountAmount = ref<string>(props.resident.discount_amount?.toString() || '0')
const newPayment = ref({ 
    amount: '', 
    paid_on: new Date().toISOString().split('T')[0],
    month_index: new Date().getMonth()
})
const selectedViewMonth = ref<number>(new Date().getMonth())

// Current month info
const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

// Load data
const loadData = async () => {
    isLoading.value = true
    try {
        // Load categories
        const categoriesData = await $fetch('/api/manage-fees/get-fee-categories', {
            query: { hostel_slug: props.hostelSlug }
        })
        categories.value = categoriesData.categories || []

        // Load payment history for current month
        const paymentsData = await $fetch('/api/manage-fees/get-payment-history', {
            query: {
                resident_id: props.resident.id,
                month_index: selectedViewMonth.value
            }
        })
        paymentHistory.value = paymentsData.payments || []

        // Load all payments to see which months have payments
        await loadAllMonthsPayments()
    } catch (error) {
        console.error('Failed to load data:', error)
    } finally {
        isLoading.value = false
    }
}

// Load all payments across all months
const loadAllMonthsPayments = async () => {
    try {
        const allPaymentsData = await $fetch('/api/manage-fees/get-all-payments', {
            query: {
                resident_id: props.resident.id
            }
        })
        allMonthsPayments.value = allPaymentsData.payments || []
    } catch (error) {
        console.error('Failed to load all months payments:', error)
    }
}

// Get months that have payments
const monthsWithPayments = computed(() => {
    const months = new Set<number>()
    allMonthsPayments.value.forEach((payment: any) => {
        months.add(payment.month_index)
    })
    return Array.from(months).sort((a, b) => a - b)
})

// Get payment summary for a specific month
const getMonthPaymentSummary = (monthIndex: number) => {
    const monthPayments = allMonthsPayments.value.filter((p: any) => p.month_index === monthIndex)
    const totalPaid = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
    return {
        count: monthPayments.length,
        total: totalPaid
    }
}

// Watch for month change to reload payments
watch(selectedViewMonth, async () => {
    isLoading.value = true
    try {
        const paymentsData = await $fetch('/api/manage-fees/get-payment-history', {
            query: {
                resident_id: props.resident.id,
                month_index: selectedViewMonth.value
            }
        })
        paymentHistory.value = paymentsData.payments || []
    } catch (error) {
        console.error('Failed to load payment history:', error)
    } finally {
        isLoading.value = false
    }
})

// Calculate fee details
const selectedCategory = computed(() => {
    return categories.value.find((c) => c.id === selectedCategoryId.value)
})

const categoryAmount = computed(() => {
    return selectedCategory.value ? parseFloat(selectedCategory.value.amount) : 0
})

const discount = computed(() => {
    return parseFloat(discountAmount.value) || 0
})

const totalFee = computed(() => {
    return categoryAmount.value - discount.value
})

const totalPaid = computed(() => {
    return paymentHistory.value.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
})

const remainingBalance = computed(() => {
    return totalFee.value - totalPaid.value
})

const paymentStatus = computed(() => {
    if (totalPaid.value >= totalFee.value && totalFee.value > 0) return 'paid'
    if (totalPaid.value > 0 && totalPaid.value < totalFee.value) return 'partial'
    return 'unpaid'
})

// Update fee info (category and discount)
const updateFeeInfo = async () => {
    if (!selectedCategoryId.value) {
        alert(t('selectCategory'))
        return
    }

    isSaving.value = true
    try {
        await $fetch('/api/manage-fees/update-resident-fee-info', {
            method: 'PUT',
            body: {
                resident_id: props.resident.id,
                fee_category_id: selectedCategoryId.value,
                discount_amount: discount.value
            }
        })
        emit('updated')
    } catch (error) {
        console.error('Failed to update fee info:', error)
        alert(t('failedUpdateFeeInfo'))
    } finally {
        isSaving.value = false
    }
}

// Record payment
const recordPayment = async () => {
    if (!newPayment.value.amount || parseFloat(newPayment.value.amount) <= 0) {
        alert(t('enterValidAmount'))
        return
    }

    isSaving.value = true
    try {
        await $fetch('/api/manage-fees/record-payment', {
            method: 'POST',
            body: {
                resident_id: props.resident.id,
                amount_paid: parseFloat(newPayment.value.amount),
                paid_on: newPayment.value.paid_on,
                month_index: newPayment.value.month_index,
                total_amount: totalFee.value,
                discount_amount: discount.value
            }
        })
        newPayment.value = { 
            amount: '', 
            paid_on: new Date().toISOString().split('T')[0],
            month_index: currentMonth
        }
        selectedViewMonth.value = newPayment.value.month_index
        await loadData()
        emit('updated')
    } catch (error) {
        console.error('Failed to record payment:', error)
        alert(t('failedRecordPayment'))
    } finally {
        isSaving.value = false
    }
}

// Delete payment
const deletePayment = async (paymentId: string) => {
    if (!confirm(t('confirmDeletePayment'))) return

    try {
        await $fetch('/api/manage-fees/delete-payment', {
            method: 'DELETE',
            body: { payment_id: paymentId }
        })
        await loadData()
        emit('updated')
    } catch (error) {
        console.error('Failed to delete payment:', error)
        alert(t('failedDeletePayment'))
    }
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <VueFinalModal class="flex justify-center items-center px-4"
                   content-class="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 max-h-[90vh] max-h-[90dvh] overflow-y-auto overflow-x-hidden"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ t('feeDetails') }}</h2>
                <p class="text-sm text-gray-600">{{ resident.first_name }} {{ resident.last_name }} - {{ t('room') }} {{ resident.room }}</p>
            </div>
            <button @click="emit('close')"
                    class="text-gray-400 hover:text-gray-600">
                <Icon name="material-symbols:close"
                      class="text-2xl" />
            </button>
        </div>

        <!-- Current Month Display -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-blue-800">
                <Icon name="material-symbols:calendar-month" class="inline mr-1"></Icon>
                {{ t('currentMonth') }}: <strong>{{ monthNames[currentMonth] }} {{ currentYear }}</strong>
            </p>
        </div>

        <!-- Months with Payments -->
        <div v-if="monthsWithPayments.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p class="text-xs font-semibold text-green-800 mb-2">{{ t('monthsWithPayments') }}:</p>
            <div class="flex flex-wrap gap-2">
                <button v-for="monthIdx in monthsWithPayments"
                        :key="monthIdx"
                        @click="selectedViewMonth = monthIdx"
                        :class="[
                            'px-2 py-1 text-xs rounded-md transition',
                            selectedViewMonth === monthIdx
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-green-700 hover:bg-green-100'
                        ]">
                    {{ monthNames[monthIdx] }}
                    <span class="ml-1 text-[10px]">(₹{{ localizeNumber(getMonthPaymentSummary(monthIdx).total) }})</span>
                </button>
            </div>
        </div>

        <div v-if="isLoading"
             class="text-center text-gray-500 py-6">{{ t('loading') }}</div>
        <div v-else class="space-y-6">
            <!-- Fee Configuration -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('feeConfiguration') }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('feeCategory') }}</label>
                        <select v-model="selectedCategoryId"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option :value="null">{{ t('selectCategory') }}</option>
                            <option v-for="category in categories"
                                    :key="category.id"
                                    :value="category.id">
                                {{ category.title }} - ₹{{ localizeNumber(category.amount) }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('discount') }}</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input v-model="discountAmount"
                                   type="number"
                                   min="0"
                                   :placeholder="t('discountPlaceholder')"
                                   class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                    </div>
                    <button @click="updateFeeInfo"
                            :disabled="!selectedCategoryId || isSaving"
                            class="greenBtn w-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon v-if="isSaving" name="svg-spinners:ring-resize" class="mr-1" />
                        {{ isSaving ? t('saving') : t('updateFeeInfo') }}
                    </button>
                </div>
            </div>

            <!-- Fee Summary -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('feeSummary') }}</h3>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">{{ t('categoryAmount') }}</span>
                        <span class="font-medium text-gray-900">₹{{ localizeNumber(categoryAmount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">{{ t('discount') }}</span>
                        <span class="font-medium text-red-600">- ₹{{ localizeNumber(discount) }}</span>
                    </div>
                    <div class="border-t border-gray-200 pt-2"></div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-gray-900">{{ t('totalFee') }}</span>
                        <span class="font-bold text-gray-900">₹{{ localizeNumber(totalFee) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">{{ t('totalPaid') }}</span>
                        <span class="font-medium text-green-600">₹{{ localizeNumber(totalPaid) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-gray-900">{{ t('remainingBalance') }}</span>
                        <span :class="[
                            'font-bold',
                            remainingBalance > 0 ? 'text-red-600' : 'text-green-600'
                        ]">
                            ₹{{ localizeNumber(Math.abs(remainingBalance)) }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span class="text-sm text-gray-600">{{ t('status') }}</span>
                        <span v-if="paymentStatus === 'paid'"
                              class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            {{ t('paid') }}
                        </span>
                        <span v-else-if="paymentStatus === 'partial'"
                              class="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            {{ t('partial') }}
                        </span>
                        <span v-else
                              class="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            {{ t('unpaid') }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Record Payment -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('recordNewPayment') }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('paymentMonth') }}</label>
                        <select v-model="newPayment.month_index"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option v-for="(month, index) in monthNames"
                                    :key="index"
                                    :value="index">
                                {{ month }} {{ currentYear }}
                                <template v-if="index === currentMonth"> ({{ t('current') }})</template>
                                <template v-else-if="index > currentMonth"> ({{ t('advance') }})</template>
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('amount') }}</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <input v-model="newPayment.amount"
                                   type="number"
                                   min="0"
                                   :placeholder="t('amountPlaceholder')"
                                   class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('paymentDate') }}</label>
                        <input v-model="newPayment.paid_on"
                               type="date"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                    <button @click="recordPayment"
                            :disabled="!newPayment.amount || isSaving"
                            class="greenBtn w-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon v-if="isSaving" name="svg-spinners:ring-resize" class="mr-1" />
                        {{ isSaving ? t('recording') : t('recordPayment') }}
                    </button>
                </div>
            </div>

            <!-- Payment History -->
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-gray-900">{{ t('paymentHistory') }}</h3>
                    <div class="text-xs text-gray-600">
                        {{ monthNames[selectedViewMonth] }} {{ currentYear }}
                    </div>
                </div>
                <div v-if="paymentHistory.length === 0"
                     class="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
                    {{ t('noPaymentsForMonth') }}
                </div>
                <div v-else class="space-y-2">
                    <div v-for="payment in paymentHistory"
                         :key="payment.id"
                         class="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">₹{{ localizeNumber(payment.amount_paid) }}</div>
                            <div class="text-xs text-gray-500">
                                {{ new Date(payment.paid_on).toLocaleDateString() }}
                            </div>
                        </div>
                        <button @click="deletePayment(payment.id)"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Icon name="material-symbols:delete" class="text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>
