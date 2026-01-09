<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 items-end">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ t('manageResidents') }}</h1>
                <p class="text-gray-600">{{ t('manageResidentsDesc') }}</p>
            </div>
            <!-- Add Resident Button - Only show if user can manage residents -->
            <button v-if="canAddResident"
                    class="greenBtn flex items-center justify-center w-full"
                    @click="openAddResidentModal">
                <Icon name="material-symbols:add"
                      class="text-xl mr-1"></Icon> {{ t('addResident') }}
            </button>
            <!-- Restricted Message -->
            <div v-else class="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p class="text-sm text-yellow-800">{{ t('noPermissionAddResidents') }}</p>
            </div>
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
                              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                    </svg>
                </span>
                <input v-model="searchTerm"
                       type="text"
                       :placeholder="t('searchByNamePhoneRoom')"
                       class="w-full outline-none text-gray-800" />
            </div>
            <div class="text-sm text-gray-500">
                {{ localizeNumber(searchTerm ? filteredResidents.length : totalResidents) }}
                {{ searchTerm ? t('found') : t('total') }}
            </div>
        </div>

        <div v-if="pending"
             class="text-center text-gray-500 py-10">{{ t('loadingResidents') }}</div>
        <div v-else-if="error"
             class="text-center text-red-600 py-10">{{ t('failedLoadResidents') }}</div>
        <div v-else>
            <div v-if="filteredResidents.length === 0"
                 class="text-center text-gray-500 py-10">
                {{ t('noResidentsFound') }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article v-for="(resident, index) in filteredResidents"
                         :key="resident.id"
                         class="flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition cursor-pointer"
                         @click="openResidentDetails(resident)">


                    <div class="flex items-center gap-3">
                        <div
                             class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                            {{ localizeNumber(searchTerm ? index + 1 : (currentPage - 1) * pageSize + index + 1) }}
                        </div>
                        <img :src="resident.avatar || placeholderAvatar"
                             class="h-14 w-14 rounded-full object-cover border border-gray-200"
                             alt="Resident avatar" />
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <div class="font-semibold text-gray-900">{{ resident.first_name }} {{ resident.last_name
                            }}
                            </div>
                        </div>
                        <div class="text-sm text-gray-600">{{ t('room') }} {{ resident.room || t('noRoom') }}</div>
                        <div class="text-xs text-gray-500">{{ localizeNumber(stripPhonePrefix(resident.phone_number)) }}</div>
                        <div v-if="resident.monthly_fee_amount" class="text-xs text-green-600 font-medium">₹{{ localizeNumber(resident.monthly_fee_amount) }}/{{ t('month') }}</div>
                    </div>

                    <span v-if="resident.is_invite"
                          class="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">{{ t('invited') }}</span>

                    <Icon name="material-symbols:chevron-right"
                          class="text-gray-400 text-2xl" />


                </article>
            </div>

            <!-- Pagination -->
            <div v-if="!searchTerm && totalPages > 1"
                 class="flex justify-center items-center gap-2 mt-6">
                <button @click="goToPage(currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div class="flex gap-1">
                    <button v-for="page in totalPages"
                            :key="page"
                            @click="goToPage(page)"
                            :class="[
                                'px-4 py-2 rounded-md border',
                                page === currentPage
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            ]">
                        {{ localizeNumber(page) }}
                    </button>
                </div>

                <button @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>

        <ModalsContainer />
    </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import AddResidentModal from '~/components/modals/AddResidentModal.vue'
import ResidentDetailsModal from '~/components/modals/ResidentDetailsModal.vue'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

const { t } = useI18n()
const { localizeNumber } = useNumberLocalization()

// Helper to extract and normalize phone numbers for display (always returns 10 digits)
const stripPhonePrefix = (phone: string | null) => {
    if (!phone) return ''
    // Remove all non-digit characters except the leading +
    const cleaned = phone.replace(/[^\d+]/g, '')
    // Remove the country code if present (+91 or 91)
    if (cleaned.startsWith('+91')) {
        return cleaned.substring(3)
    } else if (cleaned.startsWith('91')) {
        return cleaned.substring(2)
    }
    // Return last 10 digits as fallback (handles cases where format is mixed)
    return cleaned.slice(-10)
}

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
    is_invite: boolean
    monthly_fee_amount: string | null
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string
const pageSize = 10
const navigationStore = useNavigationStore()
const pageKey = computed(() => route.path)

// Staff permissions check (per-hostel)
const { canManageForHostel } = useStaffContext()
const { userProfile } = useCurrentUser()

const isAdmin = computed(() => userProfile.value?.is_admin ?? false)
const canAddResident = computed(() => isAdmin.value || canManageForHostel(hostelSlug, 'residents'))

const searchTerm = ref('')
const currentPage = ref(navigationStore.getLastPage(pageKey.value))

// useAsyncData properly caches in SPA mode

const { data: apiResponse, pending, error, refresh } = useAsyncData(
    () => `residents-${hostelSlug}-page-${currentPage.value}`,
    () => $fetch('/api/manage-resident/get-residents', {
        query: {
            hostel_slug: hostelSlug,
            limit: pageSize,
            offset: (currentPage.value - 1) * pageSize
        }
    }),
    {
        watch: [currentPage],
        getCachedData: (key) => useNuxtApp().payload.data[key] || useNuxtApp().static.data[key],
    }
)


const residents = computed(() => apiResponse.value?.residents || [])
const totalResidents = computed(() => apiResponse.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalResidents.value / pageSize))

const filteredResidents = computed(() => {
    if (!searchTerm.value.trim()) {
        return residents.value
    }

    const term = searchTerm.value.trim().toLowerCase()
    return residents.value.filter((r: Resident) => {
        const fullName = `${r.first_name} ${r.last_name}`.toLowerCase()
        return (
            fullName.includes(term) ||
            stripPhonePrefix(r.phone_number).toLowerCase().includes(term) ||
            (r.room || '').toLowerCase().includes(term)
        )
    })
})

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        navigationStore.saveLastPage(pageKey.value, page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const openAddResidentModal = () => {
    const { open, close } = useModal({
        component: AddResidentModal,
        attrs: {
            onClose() {
                close()
            },
            onCreated() {
                currentPage.value = 1
                refresh()
            },
        },
    })
    open()
}

const openResidentDetails = (resident: Resident) => {
    const { open, close } = useModal({
        component: ResidentDetailsModal as any,
        attrs: {
            resident,
            hostelSlug,
            onClose() {
                close()
            },
            onUpdated() {
                refresh()
            },
            onDeleted() {
                refresh()
            },
        } as any,
    })
    open()
}
</script>