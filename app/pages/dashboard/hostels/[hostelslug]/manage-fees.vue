<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 items-end">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Manage Fees</h1>
                <p class="text-gray-600">View and manage resident fee payments for the current month.</p>
            </div>
        </div>

        <!-- Filter Buttons -->
        <div class="bg-white rounded-xl shadow p-4 mb-4">
            <div class="flex gap-2 mb-4">
                <button @click="setFilter('all')"
                        :class="['px-4 py-2 rounded-md text-sm font-medium', filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                    All Residents
                </button>
                <button @click="setFilter('paid')"
                        :class="['px-4 py-2 rounded-md text-sm font-medium', filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                    Paid
                </button>
                <button @click="setFilter('not_paid')"
                        :class="['px-4 py-2 rounded-md text-sm font-medium', filter === 'not_paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                    Not Paid
                </button>
            </div>

            <!-- Search Bar -->
            <div class="flex items-center gap-3">
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
                           placeholder="Search by name, phone, or room"
                           class="w-full outline-none text-gray-800" />
                </div>
                <div class="text-sm text-gray-500">
                    {{ searchTerm ? filteredResidents.length : totalResidents }}
                    {{ searchTerm ? 'found' : 'total' }}
                </div>
            </div>
        </div>

        <div v-if="pending"
             class="text-center text-gray-500 py-10">Loading residents...</div>
        <div v-else-if="error"
             class="text-center text-red-600 py-10">Failed to load residents</div>
        <div v-else>
            <div v-if="filteredResidents.length === 0"
                 class="text-center text-gray-500 py-10">
                No residents found.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article v-for="(resident, index) in filteredResidents"
                         :key="resident.id"
                         class="flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition cursor-pointer"
                         @click="openFeeStatusModal(resident)">
                    <div class="flex items-center gap-3">
                        <div class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                            {{ searchTerm ? index + 1 : (currentPage - 1) * pageSize + index + 1 }}
                        </div>
                        <img :src="resident.avatar || placeholderAvatar"
                             class="h-14 w-14 rounded-full object-cover border border-gray-200"
                             alt="Resident avatar" />
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <div class="font-semibold text-gray-900">{{ resident.first_name }} {{ resident.last_name }}</div>
                            <span v-if="resident.has_paid_current_month"
                                  class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Paid</span>
                            <span v-else
                                  class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Not Paid</span>
                        </div>
                        <div class="text-sm text-gray-600">Room {{ resident.room || '—' }}</div>
                        <div class="text-xs text-gray-500">{{ resident.phone_number }}</div>
                    </div>
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
                        {{ page }}
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
import EditFeeStatusModal from '~/components/modals/EditFeeStatusModal.vue'
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
    has_paid_current_month: boolean
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string
const pageSize = 10
const navigationStore = useNavigationStore()
const pageKey = computed(() => route.path)

const searchTerm = ref('')
const currentPage = ref(navigationStore.getLastPage(pageKey.value))
const filter = ref<'all' | 'paid' | 'not_paid'>('all')

// useAsyncData properly caches in SPA mode
const { data: apiResponse, pending, error, refresh } = useAsyncData(
    `fees-${hostelSlug}-page-${currentPage.value}-filter-${filter.value}`,
    () => $fetch('/api/manage-fees/get-fees', {
        query: {
            hostel_slug: hostelSlug,
            limit: pageSize,
            offset: (currentPage.value - 1) * pageSize,
            filter: filter.value === 'all' ? undefined : filter.value
        }
    }),
    {
        watch: [currentPage, filter],
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
            r.phone_number.toLowerCase().includes(term) ||
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

const setFilter = (newFilter: 'all' | 'paid' | 'not_paid') => {
    filter.value = newFilter
    currentPage.value = 1
    navigationStore.saveLastPage(pageKey.value, 1)
}

const openFeeStatusModal = (resident: Resident) => {
    const { open, close } = useModal({
        component: EditFeeStatusModal,
        attrs: {
            resident,
            hostelSlug,
            onClose() {
                close()
            },
            onUpdated() {
                refresh()
            },
        },
    })
    open()
}
</script>

<style></style>