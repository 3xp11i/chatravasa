<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Manage Residents</h1>
                <p class="text-gray-600">Search, view, edit, or remove residents of this hostel.</p>
            </div>
            <button class="greenBtn" @click="openAddResidentModal">Add Resident</button>
        </div>

        <div class="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3">
            <div class="flex-1 flex items-center gap-2">
                <span class="text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                    </svg>
                </span>
                <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search by name, phone, or room"
                    class="w-full outline-none text-gray-800"
                />
            </div>
            <div class="text-sm text-gray-500">
                {{ searchTerm ? filteredResidents.length : totalResidents }} 
                {{ searchTerm ? 'found' : 'total' }}
            </div>
        </div>

        <div v-if="pending" class="text-center text-gray-500 py-10">Loading residents...</div>
        <div v-else-if="error" class="text-center text-red-600 py-10">Failed to load residents</div>
        <div v-else>
            <div v-if="filteredResidents.length === 0" class="text-center text-gray-500 py-10">
                No residents found.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article
                    v-for="(resident, index) in filteredResidents"
                    :key="resident.id"
                    class="flex items-center gap-4 bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition cursor-pointer"
                    @click="openResidentDetails(resident)"
                >
                    <div class="flex items-center gap-3">
                        <div class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                            {{ searchTerm ? index + 1 : (currentPage - 1) * pageSize + index + 1 }}
                        </div>
                        <img
                            :src="resident.avatar || placeholderAvatar"
                            class="h-14 w-14 rounded-full object-cover border border-gray-200"
                            alt="Resident avatar"
                        />
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">{{ resident.first_name }} {{ resident.last_name }}</div>
                        <div class="text-sm text-gray-600">Room {{ resident.room || '—' }}</div>
                        <div class="text-xs text-gray-500">{{ resident.phone_number }}</div>
                    </div>
                    <div class="text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </article>
            </div>

            <!-- Pagination -->
            <div v-if="!searchTerm && totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div class="flex gap-1">
                    <button
                        v-for="page in totalPages"
                        :key="page"
                        @click="goToPage(page)"
                        :class="[
                            'px-4 py-2 rounded-md border',
                            page === currentPage
                                ? 'bg-green-600 text-white border-green-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                    >
                        {{ page }}
                    </button>
                </div>

                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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

const route = useRoute()
const hostelSlug = route.params.hostelslug as string

const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 10

const { data: apiResponse, pending, error, refresh } = useAsyncData(
    () => `residents-${hostelSlug}-page-${currentPage.value}-search-${searchTerm.value}`,
    async () => {
        const term = searchTerm.value.trim().toLowerCase()
        
        // If searching, fetch all residents and filter server-side
        if (term) {
            const response = await $fetch('/api/manage-resident/get-residents', { 
                query: { 
                    hostel_slug: hostelSlug,
                    limit: 1000 // Fetch all for search
                } 
            })
            
            const filtered = response.residents.filter((r: Resident) => {
                const fullName = `${r.first_name} ${r.last_name}`.toLowerCase()
                return (
                    fullName.includes(term) ||
                    r.phone_number.toLowerCase().includes(term) ||
                    (r.room || '').toLowerCase().includes(term)
                )
            })
            
            return {
                residents: filtered,
                total: response.total,
                limit: response.limit,
                offset: 0
            }
        }
        
        // Normal pagination
        return $fetch('/api/manage-resident/get-residents', { 
            query: { 
                hostel_slug: hostelSlug,
                limit: pageSize,
                offset: (currentPage.value - 1) * pageSize
            } 
        })
    },
    {
        watch: [currentPage, searchTerm],
        getCachedData: (key) => {
            return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
        }
    }
)

const residents = computed(() => apiResponse.value?.residents || [])
const totalResidents = computed(() => apiResponse.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalResidents.value / pageSize))

const filteredResidents = computed(() => residents.value)

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
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