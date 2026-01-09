<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { ref, computed } from 'vue'

const props = defineProps<{
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
const editingCategory = ref<any>(null)
const newCategory = ref({ title: '', amount: '' })

// Fetch fee categories
const loadCategories = async () => {
    isLoading.value = true
    try {
        const data = await $fetch('/api/manage-fees/get-fee-categories', {
            query: { hostel_slug: props.hostelSlug }
        })
        categories.value = data.categories || []
    } catch (error) {
        console.error('Failed to load categories:', error)
    } finally {
        isLoading.value = false
    }
}

// Add new category
const addCategory = async () => {
    if (!newCategory.value.title || !newCategory.value.amount) return

    isSaving.value = true
    try {
        await $fetch('/api/manage-fees/add-fee-category', {
            method: 'POST',
            body: {
                hostel_slug: props.hostelSlug,
                title: newCategory.value.title,
                amount: newCategory.value.amount
            }
        })
        newCategory.value = { title: '', amount: '' }
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to add category:', error)
    } finally {
        isSaving.value = false
    }
}

// Update category
const updateCategory = async () => {
    if (!editingCategory.value) return

    isSaving.value = true
    try {
        await $fetch('/api/manage-fees/update-fee-category', {
            method: 'PUT',
            body: {
                category_id: editingCategory.value.id,
                title: editingCategory.value.title,
                amount: editingCategory.value.amount
            }
        })
        editingCategory.value = null
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to update category:', error)
    } finally {
        isSaving.value = false
    }
}

// Delete category
const deleteCategory = async (categoryId: string) => {
    if (!confirm(t('confirmDeleteCategory'))) return

    try {
        await $fetch('/api/manage-fees/delete-fee-category', {
            method: 'DELETE',
            body: { category_id: categoryId }
        })
        await loadCategories()
        emit('updated')
    } catch (error) {
        console.error('Failed to delete category:', error)
    }
}

const startEdit = (category: any) => {
    editingCategory.value = { ...category }
}

const cancelEdit = () => {
    editingCategory.value = null
}

onMounted(() => {
    loadCategories()
})
</script>

<template>
    <VueFinalModal class="flex justify-center items-center"
                   content-class="w-full mx-4 bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">{{ t('manageCategories') }}</h2>
            <button @click="emit('close')"
                    class="text-gray-400 hover:text-gray-600">
                <Icon name="material-symbols:close"
                      class="text-2xl" />
            </button>
        </div>

        <!-- Add New Category -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('addNewCategory') }}</h3>
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('categoryTitle') }}</label>
                    <input v-model="newCategory.title"
                           type="text"
                           :placeholder="t('categoryTitlePlaceholder')"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('amount') }}</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <input v-model="newCategory.amount"
                               type="number"
                               :placeholder="t('amountPlaceholder')"
                               class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                </div>
                <button @click="addCategory"
                        :disabled="!newCategory.title || !newCategory.amount || isSaving"
                        class="greenBtn w-full disabled:opacity-50 disabled:cursor-not-allowed">
                    <Icon v-if="isSaving" name="svg-spinners:ring-resize" class="mr-1" />
                    {{ isSaving ? t('adding') : t('addCategory') }}
                </button>
            </div>
        </div>

        <!-- Existing Categories -->
        <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('existingCategories') }}</h3>
            <div v-if="isLoading"
                 class="text-center text-gray-500 py-6">{{ t('loading') }}</div>
            <div v-else-if="categories.length === 0"
                 class="text-center text-gray-500 py-6">{{ t('noCategoriesYet') }}</div>
            <div v-else class="space-y-3">
                <div v-for="category in categories"
                     :key="category.id"
                     class="bg-white border border-gray-200 rounded-lg p-4">
                    <div v-if="editingCategory?.id === category.id"
                         class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('categoryTitle') }}</label>
                            <input v-model="editingCategory.title"
                                   type="text"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('amount') }}</label>
                            <div class="relative">
                                <span class="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input v-model="editingCategory.amount"
                                       type="number"
                                       class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="updateCategory"
                                    :disabled="isSaving"
                                    class="greenBtn flex-1">
                                {{ isSaving ? t('saving') : t('save') }}
                            </button>
                            <button @click="cancelEdit"
                                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                {{ t('cancel') }}
                            </button>
                        </div>
                    </div>
                    <div v-else class="flex items-center justify-between">
                        <div>
                            <div class="font-semibold text-gray-900">{{ category.title }}</div>
                            <div class="text-sm text-gray-600">₹{{ localizeNumber(category.amount) }}</div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="startEdit(category)"
                                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Icon name="material-symbols:edit" class="text-xl" />
                            </button>
                            <button @click="deleteCategory(category.id)"
                                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Icon name="material-symbols:delete" class="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </VueFinalModal>
</template>
