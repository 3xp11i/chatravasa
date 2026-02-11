<template>
    <VueFinalModal class="flex justify-center items-center px-4"
                   content-class="max-w-lg w-full max-h-[90vh] max-h-[90dvh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-h-[80vh] max-h-[80dvh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">
                    {{ expense ? t('editExpense') : t('addExpense') }}
                </h2>
                <button @click="emit('close')"
                        class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Title -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ t('title') }} *
                    </label>
                    <input v-model="form.title"
                           type="text"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           :placeholder="t('expenseTitlePlaceholder')"
                           required />
                </div>

                <!-- Amount -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ t('amount') }} (₹) *
                    </label>
                    <input v-model.number="form.amount"
                           type="number"
                           min="1"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           :placeholder="t('amountPlaceholder')"
                           required />
                </div>

                <!-- Date -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ t('date') }} *
                    </label>
                    <input v-model="form.expense_date"
                           type="date"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           required />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ t('category') }}
                    </label>
                    <select v-model="form.category_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option :value="null">{{ t('noCategory') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.title }}
                            <template v-if="cat.is_recurring"> ({{ t('recurring') }})</template>
                        </option>
                    </select>
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ t('description') }}
                    </label>
                    <textarea v-model="form.description"
                              rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              :placeholder="t('expenseDescriptionPlaceholder')"></textarea>
                </div>

                <!-- Submit Button -->
                <div class="flex gap-3 pt-4">
                    <button type="button"
                            @click="emit('close')"
                            class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        {{ t('cancel') }}
                    </button>
                    <button type="submit"
                            :disabled="isSubmitting || !form.title || !form.amount || !form.expense_date"
                            class="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {{ isSubmitting ? t('saving') : (expense ? t('saveChanges') : t('addExpense')) }}
                    </button>
                </div>
            </form>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

const { t } = useI18n()

const props = defineProps<{
    expense?: any
    categories: any[]
    hostelSlug: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'saved'): void
}>()

const isSubmitting = ref(false)

const form = ref({
    title: '',
    amount: undefined as number | undefined,
    expense_date: new Date().toISOString().split('T')[0],
    category_id: null as string | null,
    description: ''
})

// Watch for expense changes to populate form
watch(() => props.expense, (newExpense) => {
    if (newExpense) {
        form.value = {
            title: newExpense.title || '',
            amount: parseFloat(newExpense.amount) || undefined,
            expense_date: newExpense.expense_date || new Date().toISOString().split('T')[0],
            category_id: newExpense.category_id || null,
            description: newExpense.description || ''
        }
    } else {
        form.value = {
            title: '',
            amount: undefined,
            expense_date: new Date().toISOString().split('T')[0],
            category_id: null,
            description: ''
        }
    }
}, { immediate: true })

const handleSubmit = async () => {
    if (!form.value.title || !form.value.amount || !form.value.expense_date) return

    isSubmitting.value = true
    try {
        if (props.expense) {
            // Update existing expense
            await $fetch('/api/manage-finances/update-expense', {
                method: 'POST',
                body: {
                    expense_id: props.expense.id,
                    title: form.value.title,
                    amount: form.value.amount,
                    expense_date: form.value.expense_date,
                    category_id: form.value.category_id,
                    description: form.value.description
                }
            })
        } else {
            // Add new expense
            await $fetch('/api/manage-finances/add-expense', {
                method: 'POST',
                body: {
                    hostel_slug: props.hostelSlug,
                    title: form.value.title,
                    amount: form.value.amount,
                    expense_date: form.value.expense_date,
                    category_id: form.value.category_id,
                    description: form.value.description
                }
            })
        }
        emit('saved')
    } catch (error) {
        console.error('Failed to save expense:', error)
        alert(t('failedSaveExpense'))
    } finally {
        isSubmitting.value = false
    }
}
</script>
