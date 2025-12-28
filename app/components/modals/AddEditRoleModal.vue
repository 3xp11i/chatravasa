<template>
    <VueFinalModal class="flex justify-center items-center"
                    content-class="w-full mx-4 max-h-[90vh]"
                    overlay-transition="vfm-fade"
                    content-transition="vfm-fade">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ roleId ? 'Edit Role' : 'Add New Role' }}</h1>

            <form @submit.prevent="handleSubmit"
                  class="space-y-4">
            <!-- Role Title -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
                <input v-model="formData.title"
                       type="text"
                       placeholder="e.g., Manager, Cleaner, Cook"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                       required />
            </div>

            <!-- Permissions Section -->
            <div class="space-y-3">
                <h3 class="text-lg font-semibold text-gray-800">Permissions</h3>
                
                <!-- Residents Permissions -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 class="font-medium text-gray-700">Residents Management</h4>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.view_residents"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">View Residents</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.manage_residents"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">Manage Residents (Add/Edit/Delete)</span>
                    </label>
                </div>

                <!-- Meals Permissions -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 class="font-medium text-gray-700">Meals Management</h4>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.view_meals"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">View Meals</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.manage_meals"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">Manage Meals (Add/Edit/Delete)</span>
                    </label>
                </div>

                <!-- Fees Permissions -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 class="font-medium text-gray-700">Fees Management</h4>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.view_fees"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">View Fees</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.manage_fees"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">Manage Fees</span>
                    </label>
                </div>

                <!-- Complaints Permissions -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 class="font-medium text-gray-700">Complaints Management</h4>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.view_complaints"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">View Complaints</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="formData.manage_complaints"
                               type="checkbox"
                               class="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                        <span class="text-sm text-gray-700">Manage Complaints (Respond/Resolve)</span>
                    </label>
                </div>
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
                    {{ loading ? 'Saving...' : (roleId ? 'Update Role' : 'Create Role') }}
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
    hostelSlug: string
    role?: any
    roleId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    created: []
    updated: []
}>()

const loading = ref(false)
const error = ref('')

const formData = reactive({
    title: props.role?.title || '',
    view_residents: props.role?.view_residents || false,
    manage_residents: props.role?.manage_residents || false,
    view_meals: props.role?.view_meals || false,
    manage_meals: props.role?.manage_meals || false,
    view_fees: props.role?.view_fees || false,
    manage_fees: props.role?.manage_fees || false,
    view_complaints: props.role?.view_complaints || false,
    manage_complaints: props.role?.manage_complaints || false,
})

const handleSubmit = async () => {
    loading.value = true
    error.value = ''

    try {
        if (props.roleId) {
            // Update existing role
            await $fetch('/api/manage-staff/update-staff-role', {
                method: 'POST',
                body: {
                    role_id: props.roleId,
                    hostel_slug: props.hostelSlug,
                    ...formData
                }
            })
            emit('updated')
        } else {
            // Create new role
            await $fetch('/api/manage-staff/add-staff-role', {
                method: 'POST',
                body: {
                    hostel_slug: props.hostelSlug,
                    ...formData
                }
            })
            emit('created')
        }
        emit('close')
    } catch (err: any) {
        error.value = err.data?.message || 'Failed to save role'
    } finally {
        loading.value = false
    }
}
</script>
