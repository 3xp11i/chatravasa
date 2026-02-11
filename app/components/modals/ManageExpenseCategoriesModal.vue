<template>
    <VueFinalModal class="flex justify-center items-center px-4"
                   content-class="max-w-2xl w-full max-h-[90vh] max-h-[90dvh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-h-[80vh] max-h-[80dvh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">{{ t('manageExpenseCategories') }}</h2>
                <button @click="emit('close')"
                        class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Add New Category Form -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('addNewCategory') }}</h3>
                <form @submit.prevent="addCategory" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                {{ t('categoryTitle') }} *
                            </label>
                            <input v-model="newCategory.title"
                                   type="text"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                   :placeholder="t('categoryTitlePlaceholder')"
                                   required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                {{ t('defaultAmount') }}
                            </label>
                            <input v-model.number="newCategory.default_amount"
                                   type="number"
                                   min="0"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                   :placeholder="t('amountPlaceholder')" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            {{ t('description') }}
                        </label>
                        <input v-model="newCategory.description"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                               :placeholder="t('categoryDescriptionPlaceholder')" />
                    </div>
                    <div class="flex items-center gap-2">
                        <input v-model="newCategory.is_recurring"
                               type="checkbox"
                               id="is_recurring"
                               class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                        <label for="is_recurring" class="text-sm text-gray-700">
                            {{ t('isRecurringExpense') }}
                        </label>
                    </div>
                    <button type="submit"
                            :disabled="isAdding || !newCategory.title"
                            class="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {{ isAdding ? t('adding') : t('addCategory') }}
                    </button>
                </form>
            </div>

            <!-- Existing Categories -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('existingCategories') }}</h3>
                
                <!-- Loading -->
                <div v-if="loading" class="text-center py-4">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>

                <!-- Categories List -->
                <div v-else-if="categories.length > 0" class="space-y-3">
                    <div v-for="category in categories" 
                         :key="category.id"
                         class="border rounded-lg p-4">
                        <!-- View Mode -->
                        <div v-if="editingId !== category.id" class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h4 class="font-semibold text-gray-900">{{ category.title }}</h4>
                                    <span v-if="category.is_recurring" 
                                          class="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        {{ t('recurring') }}
                                    </span>
                                </div>
                                <p v-if="category.description" class="text-sm text-gray-600 mt-1">
                                    {{ category.description }}
                                </p>
                                <p v-if="category.default_amount" class="text-sm text-gray-500 mt-1">
                                    {{ t('defaultAmount') }}: ₹{{ category.default_amount }}
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="startEdit(category)"
                                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Icon name="material-symbols:edit" class="text-lg" />
                                </button>
                                <button @click="confirmDelete(category)"
                                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Icon name="material-symbols:delete" class="text-lg" />
                                </button>
                            </div>
                        </div>

                        <!-- Edit Mode -->
                        <div v-else class="space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input v-model="editForm.title"
                                       type="text"
                                       class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                       :placeholder="t('categoryTitle')" />
                                <input v-model.number="editForm.default_amount"
                                       type="number"
                                       min="0"
                                       class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                       :placeholder="t('defaultAmount')" />
                            </div>
                            <input v-model="editForm.description"
                                   type="text"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                   :placeholder="t('description')" />
                            <div class="flex items-center gap-2">
                                <input v-model="editForm.is_recurring"
                                       type="checkbox"
                                       :id="`edit_recurring_${category.id}`"
                                       class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                                <label :for="`edit_recurring_${category.id}`" class="text-sm text-gray-700">
                                    {{ t('isRecurringExpense') }}
                                </label>
                            </div>
                            <div class="flex gap-2">
                                <button @click="cancelEdit"
                                        class="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    {{ t('cancel') }}
                                </button>
                                <button @click="saveEdit"
                                        :disabled="isSaving || !editForm.title"
                                        class="flex-1 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                    {{ isSaving ? t('saving') : t('save') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- No Categories -->
                <div v-else class="text-center py-6 text-gray-500">
                    <Icon name="material-symbols:category" class="text-4xl mb-2" />
                    <p>{{ t('noCategoriesYet') }}</p>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

const { t } = useI18n()

const props = defineProps<{
    hostelSlug: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated'): void
}>()

// State
const loading = ref(false)
const isAdding = ref(false)
const isSaving = ref(false)
const categories = ref<any[]>([])
const editingId = ref<string | null>(null)

const newCategory = ref({
    title: '',
    description: '',
    default_amount: undefined as number | undefined,
    is_recurring: false
})

const editForm = ref({
    title: '',
    description: '',
    default_amount: undefined as number | undefined,
    is_recurring: false
})

// Load categories
const loadCategories = async () => {
    loading.value = true
    try {
        const data = await $fetch('/api/manage-finances/get-expense-categories', {
            query: { hostel_slug: props.hostelSlug }
        })
        categories.value = data.categories
    } catch (error) {
        console.error('Failed to load categories:', error)
    } finally {
        loading.value = false
    }
}

// Add category
const addCategory = async () => {
    if (!newCategory.value.title) return

    isAdding.value = true
    try {
        await $fetch('/api/manage-finances/add-expense-category', {
            method: 'POST',
            body: {
                hostel_slug: props.hostelSlug,
                title: newCategory.value.title,
                description: newCategory.value.description,
                default_amount: newCategory.value.default_amount,
                is_recurring: newCategory.value.is_recurring
            }
        })
        newCategory.value = { title: '', description: '', default_amount: undefined, is_recurring: false }
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to add category:', error)
        alert(t('failedAddCategory'))
    } finally {
        isAdding.value = false
    }
}

// Start editing
const startEdit = (category: any) => {
    editingId.value = category.id
    editForm.value = {
        title: category.title,
        description: category.description || '',
        default_amount: category.default_amount ? parseFloat(category.default_amount) : undefined,
        is_recurring: category.is_recurring || false
    }
}

// Cancel editing
const cancelEdit = () => {
    editingId.value = null
}

// Save edit
const saveEdit = async () => {
    if (!editForm.value.title || !editingId.value) return

    isSaving.value = true
    try {
        await $fetch('/api/manage-finances/update-expense-category', {
            method: 'POST',
            body: {
                category_id: editingId.value,
                title: editForm.value.title,
                description: editForm.value.description,
                default_amount: editForm.value.default_amount,
                is_recurring: editForm.value.is_recurring
            }
        })
        editingId.value = null
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to update category:', error)
        alert(t('failedUpdateCategory'))
    } finally {
        isSaving.value = false
    }
}

// Delete category
const confirmDelete = async (category: any) => {
    if (!confirm(t('confirmDeleteCategory'))) return

    try {
        await $fetch('/api/manage-finances/delete-expense-category', {
            method: 'POST',
            body: { category_id: category.id }
        })
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to delete category:', error)
        alert(t('failedDeleteCategory'))
    }
}

// Load categories when modal opens
onMounted(() => {
    loadCategories()
})
</script>
