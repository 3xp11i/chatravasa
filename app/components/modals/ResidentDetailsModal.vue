<template>
    <VueFinalModal class="flex justify-center items-center"
                   content-class="w-full mx-4 max-h-[90vh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade">
        <div class="bg-white rounded-xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-start gap-4 mb-6">
                <div class="flex items-center gap-4">
                    <img :src="displayAvatar"
                         alt="Resident avatar"
                         class="h-20 w-20 rounded-full object-cover border border-gray-200" />
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ fullName }}</h2>
                        <p class="text-gray-600">Room {{ form.room || 'Not Assigned' }}</p>
                    </div>
                </div>
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

            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm font-medium text-gray-600">First Name</label>
                        <input v-if="isEditing"
                               v-model="form.first_name"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p v-else
                           class="mt-1 text-gray-900">{{ form.first_name }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Last Name</label>
                        <input v-if="isEditing"
                               v-model="form.last_name"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p v-else
                           class="mt-1 text-gray-900">{{ form.last_name }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Phone Number</label>
                        <input v-if="isEditing"
                               v-model="form.phone_number"
                               type="tel"
                               pattern="[0-9]{10}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <a v-else
                           :href="`tel:${form.phone_number}`"
                           class="mt-1 text-gray-900 hover:underline cursor-pointer">{{ form.phone_number }}</a>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Room</label>
                        <input v-if="isEditing"
                               v-model="form.room"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p v-else
                           class="mt-1 text-gray-900">{{ form.room }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Joining Date</label>
                        <input v-if="isEditing"
                               v-model="form.joining_date"
                               type="date"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p v-else
                           class="mt-1 text-gray-900">{{ formattedJoiningDate }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Father's Name</label>
                        <input v-if="isEditing"
                               v-model="form.father_name"
                               type="text"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p v-else
                           class="mt-1 text-gray-900">{{ form.father_name || '—' }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600">Family Phone</label>
                        <input v-if="isEditing"
                               v-model="form.family_phone_number"
                               type="tel"
                               pattern="[0-9]{10}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <a v-else
                           :href="`tel:${form.family_phone_number}`"
                           class="mt-1 text-gray-900 hover:underline cursor-pointer">{{ form.family_phone_number }}</a>
                    </div>
                </div>

                <div v-if="statusMessage"
                     :class="statusClass"
                     class="p-3 rounded text-sm">
                    {{ statusMessage }}
                </div>
            </div>

            <div class="flex justify-between items-center mt-6 gap-3 flex-wrap">
                <div class="flex gap-3">
                    <button v-if="!isEditing"
                            @click="isEditing = true"
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Edit Details
                    </button>
                    <button v-else
                            @click="saveChanges"
                            :disabled="isSaving"
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                        {{ isSaving ? 'Saving...' : 'Save' }}
                    </button>
                    <button v-if="isEditing"
                            @click="resetForm"
                            :disabled="isSaving"
                            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                </div>
                <button @click="confirmDelete"
                        :disabled="isDeleting"
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                    {{ isDeleting ? 'Removing...' : 'Remove Resident' }}
                </button>
            </div>
        </div>
    </VueFinalModal>
</template>

<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

type Resident = {
    id: string
    first_name: string
    last_name: string
    phone_number: string
    room: string
    joining_date: string | null
    father_name: string | null
    family_phone_number: string | null
    avatar: string | null
}

const props = defineProps<{ resident: Resident; hostelSlug: string }>()

const emit = defineEmits<{
    close: []
    updated: []
    deleted: []
}>()

const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const form = reactive({
    first_name: props.resident.first_name,
    last_name: props.resident.last_name,
    phone_number: props.resident.phone_number,
    room: props.resident.room,
    joining_date: props.resident.joining_date || '',
    father_name: props.resident.father_name || '',
    family_phone_number: props.resident.family_phone_number || '',
    avatar: props.resident.avatar || null,
})

const fullName = computed(() => `${form.first_name} ${form.last_name}`.trim())
const displayAvatar = computed(() => form.avatar || placeholderAvatar)
const formattedJoiningDate = computed(() => {
    if (!form.joining_date) return '—'
    return new Date(form.joining_date).toLocaleDateString()
})

const statusClass = computed(() =>
    statusType.value === 'success'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
)

const saveChanges = async () => {
    isSaving.value = true
    statusMessage.value = ''
    try {
        await $fetch('/api/manage-resident/update-resident', {
            method: 'PATCH',
            body: {
                resident_id: props.resident.id,
                hostel_slug: props.hostelSlug,
                first_name: form.first_name,
                last_name: form.last_name,
                phone_number: form.phone_number,
                room: form.room,
                joining_date: form.joining_date || null,
                father_name: form.father_name || null,
                family_phone_number: form.family_phone_number || null,
                avatar: form.avatar || null,
            },
        })
        statusType.value = 'success'
        statusMessage.value = 'Resident updated'
        isEditing.value = false
        emit('updated')
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || 'Failed to update resident'
    } finally {
        isSaving.value = false
    }
}

const confirmDelete = async () => {
    if (!confirm('Remove this resident?')) return
    isDeleting.value = true
    statusMessage.value = ''
    try {
        await $fetch('/api/manage-resident/delete-resident', {
            method: 'DELETE',
            body: {
                resident_id: props.resident.id,
                hostel_slug: props.hostelSlug,
            },
        })
        statusType.value = 'success'
        statusMessage.value = 'Resident removed'
        emit('deleted')
        emit('close')
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error.data?.message || 'Failed to remove resident'
    } finally {
        isDeleting.value = false
    }
}

const resetForm = () => {
    isEditing.value = false
    statusMessage.value = ''
    form.first_name = props.resident.first_name
    form.last_name = props.resident.last_name
    form.phone_number = props.resident.phone_number
    form.room = props.resident.room
    form.joining_date = props.resident.joining_date || ''
    form.father_name = props.resident.father_name || ''
    form.family_phone_number = props.resident.family_phone_number || ''
    form.avatar = props.resident.avatar || null
}
</script>
