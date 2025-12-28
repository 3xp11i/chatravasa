<template>
    <VueFinalModal class="flex justify-center items-center"
                    content-class="w-full mx-4 max-h-[90vh]"
                    overlay-transition="vfm-fade"
                    content-transition="vfm-fade">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Staff Member Details</h1>

            <div class="space-y-4">
            <!-- Avatar and Basic Info -->
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img :src="staffMember.avatar || placeholderAvatar"
                     :alt="`${staffMember.first_name} ${staffMember.last_name}`"
                     class="w-20 h-20 rounded-full object-cover border-2 border-gray-300" />
                <div class="flex-1">
                    <h2 class="text-xl font-semibold text-gray-800">
                        {{ staffMember.first_name }} {{ staffMember.last_name }}
                    </h2>
                    <p class="text-gray-600">{{ staffMember.phone }}</p>
                    <span v-if="staffMember.is_invite"
                          class="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pending Invitation
                    </span>
                    <span v-else
                          class="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {{ staffMember.role_title }}
                    </span>
                </div>
            </div>

            <!-- Role Selection (for confirmed staff only) -->
            <div v-if="!staffMember.is_invite && !editingRole"
                 class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-medium text-gray-700">Current Role</h3>
                        <p class="text-gray-600">{{ staffMember.role_title }}</p>
                    </div>
                    <button @click="editingRole = true"
                            class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Change Role
                    </button>
                </div>
            </div>

            <!-- Edit Role Form -->
            <div v-if="!staffMember.is_invite && editingRole"
                 class="p-4 border border-gray-200 rounded-lg space-y-3">
                <h3 class="font-medium text-gray-700">Change Role</h3>
                <select v-model="newRoleId"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select a role</option>
                    <option v-for="role in roles"
                            :key="role.id"
                            :value="role.id">
                        {{ role.title }}
                    </option>
                </select>
                <div class="flex gap-2">
                    <button @click="updateRole"
                            :disabled="!newRoleId || updating"
                            class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50">
                        {{ updating ? 'Saving...' : 'Save' }}
                    </button>
                    <button @click="cancelEdit"
                            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Cancel
                    </button>
                </div>
            </div>

            <!-- Delete Confirmation -->
            <div v-if="confirmDelete"
                 class="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <p class="text-red-800 font-medium">
                    Are you sure you want to remove this staff member?
                </p>
                <p class="text-red-700 text-sm">
                    {{ staffMember.is_invite ? 'The invitation will be cancelled.' : 'They will lose access to the hostel management system.' }}
                </p>
                <div class="flex gap-2">
                    <button @click="deleteStaffMember"
                            :disabled="deleting"
                            class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        {{ deleting ? 'Removing...' : 'Yes, Remove' }}
                    </button>
                    <button @click="confirmDelete = false"
                            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Cancel
                    </button>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 justify-between pt-4 border-t">
                <button v-if="!confirmDelete"
                        @click="confirmDelete = true"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Remove Staff Member
                </button>
                <button @click="emit('close')"
                        class="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Close
                </button>
                </div>
            </div>

            <div v-if="error"
                 class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ error }}
            </div>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

interface Props {
    staffMember: any
    roles: any[]
    hostelSlug: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    updated: []
    deleted: []
}>()

const editingRole = ref(false)
const newRoleId = ref(props.staffMember.role_id || '')
const updating = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)
const error = ref('')

const cancelEdit = () => {
    editingRole.value = false
    newRoleId.value = props.staffMember.role_id || ''
    error.value = ''
}

const updateRole = async () => {
    updating.value = true
    error.value = ''

    try {
        await $fetch('/api/manage-staff/update-staff-member', {
            method: 'POST',
            body: {
                staff_id: props.staffMember.id,
                role_id: newRoleId.value,
                hostel_slug: props.hostelSlug
            }
        })
        emit('updated')
        editingRole.value = false
    } catch (err: any) {
        error.value = err.data?.message || 'Failed to update role'
    } finally {
        updating.value = false
    }
}

const deleteStaffMember = async () => {
    deleting.value = true
    error.value = ''

    try {
        await $fetch('/api/manage-staff/delete-staff-member', {
            method: 'POST',
            body: {
                staff_id: props.staffMember.id,
                is_invite: props.staffMember.is_invite,
                hostel_slug: props.hostelSlug
            }
        })
        emit('deleted')
        emit('close')
    } catch (err: any) {
        error.value = err.data?.message || 'Failed to remove staff member'
    } finally {
        deleting.value = false
    }
}
</script>
