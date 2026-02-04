<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-6">
        <!-- Header with Tabs -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ t('manageStaff') }}</h1>
                <p class="text-gray-600">{{ t('manageStaffDesc') }}</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-xl shadow mb-4">
            <div class="flex border-b border-gray-200">
                <button @click="activeTab = 'members'"
                        :class="[
                            'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                            activeTab === 'members'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-600 hover:text-gray-800'
                        ]">
                    {{ t('staffMembers') }}
                </button>
                <button @click="activeTab = 'roles'"
                        :class="[
                            'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                            activeTab === 'roles'
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-600 hover:text-gray-800'
                        ]">
                    {{ t('rolesPermissions') }}
                </button>
            </div>
        </div>

        <!-- Staff Members Tab -->
        <div v-show="activeTab === 'members'">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <button class="greenBtn flex items-center justify-center"
                        @click="openAddStaffModal">
                    <Icon name="material-symbols:add"
                          class="text-xl mr-1"></Icon> {{ t('addStaffMember') }}
                </button>
            </div>

            <div class="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3">
                <div class="flex-1 flex items-center gap-2">
                    <span class="text-gray-400">
                        <svg class="w-5 h-5"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input v-model="searchTerm"
                           type="text"
                           :placeholder="t('searchByNamePhone')"
                           class="w-full outline-none text-gray-800" />
                </div>
                <div class="text-sm text-gray-500">
                    {{ searchTerm ? filteredStaffMembers.length : totalStaffMembers }}
                    {{ searchTerm ? t('found') : t('total') }}
                </div>
            </div>

            <div v-if="pendingMembers"
                 class="text-center text-gray-500 py-10">{{ t('loadingStaffMembers') }}</div>
            <div v-else-if="errorMembers"
                 class="text-center text-red-600 py-10">{{ t('failedLoadStaffMembers') }}</div>
            <div v-else>
                <div v-if="filteredStaffMembers.length === 0"
                     class="text-center text-gray-500 py-10">
                    {{ t('noStaffMembersFound') }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <article v-for="staffMember in filteredStaffMembers"
                             :key="staffMember.id"
                             @click="openStaffDetails(staffMember)"
                             class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
                        <div class="flex items-center gap-3">
                            <img :src="staffMember.avatar || placeholderAvatar"
                                 :alt="`${staffMember.first_name} ${staffMember.last_name}`"
                                 class="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-800 truncate">
                                    {{ staffMember.first_name }} {{ staffMember.last_name }}
                                </h3>
                                <p class="text-sm text-gray-600">{{ staffMember.phone }}</p>
                                <span v-if="staffMember.is_invite"
                                      class="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    {{ t('pending') }}
                                </span>
                                <span v-else
                                      class="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {{ staffMember.role_title }}
                                </span>
                            </div>
                        </div>
                    </article>
                </div>

                <!-- Pagination -->
                <div v-if="!searchTerm && totalPages > 1"
                     class="flex justify-center items-center gap-2 mt-6">
                    <button @click="goToPage(currentPage - 1)"
                            :disabled="currentPage === 1"
                            class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ t('previous') }}
                    </button>

                    <div class="flex gap-1">
                        <button v-for="page in visiblePages"
                                :key="page"
                                @click="typeof page === 'number' && goToPage(page)"
                                :disabled="typeof page !== 'number'"
                                :class="[
                                    'px-3 py-2 rounded-lg',
                                    page === currentPage
                                        ? 'bg-green-600 text-white'
                                        : typeof page === 'number'
                                        ? 'bg-white border border-gray-300 hover:bg-gray-50'
                                        : 'bg-white border-0'
                                ]">
                            {{ page }}
                        </button>
                    </div>

                    <button @click="goToPage(currentPage + 1)"
                            :disabled="currentPage === totalPages"
                            class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ t('next') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Roles Tab -->
        <div v-show="activeTab === 'roles'">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <button class="greenBtn flex items-center justify-center"
                        @click="openAddRoleModal">
                    <Icon name="material-symbols:add"
                          class="text-xl mr-1"></Icon> {{ t('createRole') }}
                </button>
            </div>

            <div v-if="pendingRoles"
                 class="text-center text-gray-500 py-10">{{ t('loadingRoles') }}</div>
            <div v-else-if="errorRoles"
                 class="text-center text-red-600 py-10">{{ t('failedLoadRoles') }}</div>
            <div v-else>
                <div v-if="roles.length === 0"
                     class="text-center text-gray-500 py-10">
                    {{ t('noRolesYet') }}
                </div>

                <div class="space-y-4">
                    <article v-for="role in roles"
                             :key="role.id"
                             class="bg-white rounded-xl shadow p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800">{{ role.title }}</h3>
                                <p class="text-sm text-gray-500">{{ t('created') }} {{ formatDate(role.created_at) }}</p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="openEditRoleModal(role)"
                                        class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    {{ t('edit') }}
                                </button>
                                <button @click="deleteRole(role.id)"
                                        class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                    {{ t('delete') }}
                                </button>
                            </div>
                        </div>

                        <!-- Permissions Display -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="border border-gray-200 rounded-lg p-3">
                                <h4 class="font-medium text-gray-700 mb-2">{{ t('residents') }}</h4>
                                <div class="space-y-1 text-sm">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.view_residents ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.view_residents ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.view_residents ? 'text-gray-700' : 'text-gray-400'">{{ t('view') }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.manage_residents ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.manage_residents ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.manage_residents ? 'text-gray-700' : 'text-gray-400'">{{ t('manage') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-3">
                                <h4 class="font-medium text-gray-700 mb-2">{{ t('meals') }}</h4>
                                <div class="space-y-1 text-sm">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.view_meals ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.view_meals ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.view_meals ? 'text-gray-700' : 'text-gray-400'">{{ t('view') }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.manage_meals ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.manage_meals ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.manage_meals ? 'text-gray-700' : 'text-gray-400'">{{ t('manage') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-3">
                                <h4 class="font-medium text-gray-700 mb-2">{{ t('fees') }}</h4>
                                <div class="space-y-1 text-sm">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.view_fees ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.view_fees ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.view_fees ? 'text-gray-700' : 'text-gray-400'">{{ t('view') }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.manage_fees ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.manage_fees ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.manage_fees ? 'text-gray-700' : 'text-gray-400'">{{ t('manage') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-3">
                                <h4 class="font-medium text-gray-700 mb-2">{{ t('complaints') }}</h4>
                                <div class="space-y-1 text-sm">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.view_complaints ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.view_complaints ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.view_complaints ? 'text-gray-700' : 'text-gray-400'">{{ t('view') }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Icon :name="role.manage_complaints ? 'mdi:check-circle' : 'mdi:close-circle'"
                                              :class="role.manage_complaints ? 'text-green-600' : 'text-gray-400'" />
                                        <span :class="role.manage_complaints ? 'text-gray-700' : 'text-gray-400'">{{ t('manage') }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>

        <ModalsContainer />
    </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import AddStaffMemberModal from '~/components/modals/AddStaffMemberModal.vue'
import StaffMemberDetailsModal from '~/components/modals/StaffMemberDetailsModal.vue'
import AddEditRoleModal from '~/components/modals/AddEditRoleModal.vue'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

const { t } = useI18n()

type StaffMember = {
    id: string
    staff_id?: string
    first_name: string
    last_name: string
    phone: string
    avatar: string | null
    role_id: string | null
    role_title: string
    is_invite: boolean
    created_at: string
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string
const pageSize = 10
const navigationStore = useNavigationStore()
const pageKey = computed(() => route.path)

const activeTab = ref<'members' | 'roles'>('members')
const searchTerm = ref('')
const currentPage = ref(navigationStore.getLastPage(pageKey.value))

// useDynamicAsyncData properly caches in SPA mode and clears cache on refresh
const { data: membersResponse, pending: pendingMembers, error: errorMembers, refresh: refreshMembers } = useDynamicAsyncData(
    () => `staff-members-${hostelSlug}-page-${currentPage.value}`,
    () => $fetch<{ staff_members: StaffMember[]; total: number }>('/api/manage-staff/get-staff-members', {
        query: {
            hostel_slug: hostelSlug,
            limit: pageSize,
            offset: (currentPage.value - 1) * pageSize
        }
    }),
    { watch: [currentPage] }
)

const staffMembers = computed(() => membersResponse.value?.staff_members || [])
const totalStaffMembers = computed(() => membersResponse.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalStaffMembers.value / pageSize))

const filteredStaffMembers = computed(() => {
    if (!searchTerm.value.trim()) {
        return staffMembers.value
    }

    const term = searchTerm.value.trim().toLowerCase()
    return staffMembers.value.filter((s: StaffMember) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase()
        return (
            fullName.includes(term) ||
            s.phone.toLowerCase().includes(term)
        )
    })
})

// useCachedAsyncData properly caches in SPA mode and clears cache on refresh
const { data: rolesResponse, pending: pendingRoles, error: errorRoles, refresh: refreshRoles } = useCachedAsyncData(
    `staff-roles-${hostelSlug}`,
    () => $fetch('/api/manage-staff/get-staff-roles', {
        query: { hostel_slug: hostelSlug }
    })
)

const roles = computed(() => rolesResponse.value?.roles || [])

const visiblePages = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i)
            pages.push('...')
            pages.push(total)
        } else if (current >= total - 3) {
            pages.push(1)
            pages.push('...')
            for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
            pages.push(1)
            pages.push('...')
            for (let i = current - 1; i <= current + 1; i++) pages.push(i)
            pages.push('...')
            pages.push(total)
        }
    }

    return pages
})

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        navigationStore.saveLastPage(pageKey.value, page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Staff Member Modals
const openAddStaffModal = () => {
    const { open, close } = useModal({
        component: AddStaffMemberModal,
        attrs: {
            roles: roles.value,
            hostelSlug,
            onClose() {
                close()
            },
            onCreated() {
                currentPage.value = 1
                refreshMembers()
            },
        },
    })
    open()
}

const openStaffDetails = (staffMember: any) => {
    const { open, close } = useModal({
        component: StaffMemberDetailsModal as any,
        attrs: {
            staffMember,
            roles: roles.value,
            hostelSlug,
            onClose() {
                close()
            },
            onUpdated() {
                refreshMembers()
            },
            onDeleted() {
                refreshMembers()
            },
        } as any,
    })
    open()
}

// Role Modals
const openAddRoleModal = () => {
    const { open, close } = useModal({
        component: AddEditRoleModal,
        attrs: {
            hostelSlug,
            onClose() {
                close()
            },
            onCreated() {
                refreshRoles()
            },
        },
    })
    open()
}

const openEditRoleModal = (role: any) => {
    const { open, close } = useModal({
        component: AddEditRoleModal,
        attrs: {
            hostelSlug,
            role,
            roleId: role.id,
            onClose() {
                close()
            },
            onUpdated() {
                refreshRoles()
            },
        },
    })
    open()
}

const deleteRole = async (roleId: string) => {
    if (!confirm(t('confirmDeleteRole'))) {
        return
    }

    try {
        await $fetch('/api/manage-staff/delete-staff-role', {
            method: 'POST',
            body: { 
                role_id: roleId,
                hostel_slug: hostelSlug
            }
        })
        refreshRoles()
    } catch (err: any) {
        alert(err.data?.message || 'Failed to delete role')
    }
}
</script>