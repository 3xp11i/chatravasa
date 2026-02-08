<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 items-start">
            <div class="mb-4">
                <h1 class="text-3xl font-bold text-gray-900">{{ t('manageFees') }}</h1>
                <p class="text-gray-600">{{ t('manageFeesDesc') }}</p>
            </div>
            <!-- Action Buttons -->
            <div v-if="canManageFees" class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <!-- Send Reminder Button -->
                <button 
                    class="flex items-center justify-center px-4 py-2 rounded-lg font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                    @click="showReminderModal = true"
                >
                    <Icon name="material-symbols:notifications-active" class="text-xl mr-1" />
                    {{ t('sendReminder') }}
                </button>
                <!-- Manage Categories Button -->
                <button 
                    class="greenBtn flex items-center justify-center"
                    @click="openFeeCategoriesModal"
                >
                    <Icon name="material-symbols:category" class="text-xl mr-1" />
                    {{ t('manageCategories') }}
                </button>
            </div>
            <!-- Restricted Message -->
            <div v-else class="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p class="text-sm text-yellow-800">{{ t('noPermissionManageFees') }}</p>
            </div>
        </div>

        <!-- Current Month Display -->
        <div class=" bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-blue-800">
                <Icon name="material-symbols:calendar-month" class="inline mr-1"></Icon>
                {{ t('currentMonth') }}: <strong>{{ monthNames[currentMonth] }}</strong>
            </p>
        </div>

        <!-- Filter and Search -->
        <div class="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
            <!-- Search Bar -->
            <div class="flex items-center gap-2">
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
                       class="flex-1 outline-none text-gray-800" />
                <div class="text-sm text-gray-500">
                    {{ localizeNumber(filteredResidents.length) }}
                    {{ t('found') }}
                </div>
            </div>

            <!-- Status Filter -->
            <div class="flex flex-wrap gap-2">
                <button @click="statusFilter = 'all'"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            statusFilter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]">
                    {{ t('all') }} ({{ localizeNumber(totalResidents) }})
                </button>
                <button @click="statusFilter = 'paid'"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            statusFilter === 'paid'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                        ]">
                    {{ t('paid') }} ({{ localizeNumber(paidCount) }})
                </button>
                <button @click="statusFilter = 'partial'"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            statusFilter === 'partial'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        ]">
                    {{ t('partial') }} ({{ localizeNumber(partialCount) }})
                </button>
                <button @click="statusFilter = 'unpaid'"
                        :class="[
                            'px-4 py-2 rounded-lg text-sm font-medium transition',
                            statusFilter === 'unpaid'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                        ]">
                    {{ t('unpaid') }} ({{ localizeNumber(unpaidCount) }})
                </button>
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
                         @click="openResidentFeeDetails(resident)">

                    <div class="flex items-center gap-3">
                        <div
                             class="shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                            {{ localizeNumber((currentPage - 1) * pageSize + index + 1) }}
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
                        
                        <!-- Fee Information -->
                        <div v-if="resident.fee_category" class="mt-1 space-y-1">
                            <div class="text-xs text-gray-600">{{ resident.fee_category }}</div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-medium text-gray-700">
                                    ₹{{ localizeNumber(resident.total_fee_amount) }}
                                </span>
                                <span v-if="resident.payment_status === 'paid'" class="text-xs text-green-600">
                                    • {{ t('paid') }}
                                </span>
                                <span v-else-if="resident.payment_status === 'partial'" class="text-xs text-amber-600">
                                    • ₹{{ localizeNumber(resident.remaining_balance) }} {{ t('pending') }}
                                </span>
                                <span v-else class="text-xs text-red-600">
                                    • {{ t('unpaid') }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="mt-1 text-xs text-gray-500 italic">{{ t('noCategoryAssigned') }}</div>
                    </div>

                    <!-- Payment Status Badge -->
                    <span v-if="resident.payment_status === 'paid'"
                          class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {{ t('paid') }}
                    </span>
                    <span v-else-if="resident.payment_status === 'partial'"
                          class="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        {{ t('partial') }}
                    </span>
                    <span v-else
                          class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {{ t('unpaid') }}
                    </span>

                    <Icon name="material-symbols:chevron-right"
                          class="text-gray-400 text-2xl" />
                </article>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1"
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

        <!-- Fee Reminder Modal -->
        <Teleport to="body">
            <div v-if="showReminderModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-xl w-full p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-900">{{ t('sendFeeReminder') }}</h3>
                        <button @click="showReminderModal = false" class="text-gray-400 hover:text-gray-600">
                            <Icon name="material-symbols:close" class="text-2xl" />
                        </button>
                    </div>

                    <div class="space-y-4">
                        <!-- Target Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('sendTo') }}</label>
                            <div class="space-y-2">
                                <label class="flex! flex-row items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                       :class="reminderTarget === 'pending' ? 'border-green-500 bg-green-50' : 'border-gray-200'">
                                    <input type="radio" v-model="reminderTarget" value="pending" class="text-green-600 w-fit!" />
                                    <div>
                                        <p class="font-medium text-gray-900">{{ t('onlyPendingFees') }}</p>
                                        <p class="text-xs text-gray-500">{{ t('onlyPendingFeesDesc') }}</p>
                                    </div>
                                </label>
                                <label class="flex! flex-row items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                       :class="reminderTarget === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200'">
                                    <input type="radio" v-model="reminderTarget" value="all" class="text-green-600 w-fit!" />
                                    <div>
                                        <p class="font-medium text-gray-900">{{ t('allResidents') }}</p>
                                        <p class="text-xs text-gray-500">{{ t('allResidentsDesc') }}</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Custom Message -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('customMessage') }} ({{ t('optional') }})</label>
                            <textarea v-model="reminderMessage"
                                      :placeholder="t('customMessagePlaceholder')"
                                      rows="3"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"></textarea>
                        </div>

                        <!-- Send Button -->
                        <button @click="sendFeeReminder"
                                :disabled="sendingReminder"
                                class="w-full py-3 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <Icon v-if="sendingReminder" name="svg-spinners:90-ring-with-bg" class="text-xl" />
                            <Icon v-else name="material-symbols:send" class="text-xl" />
                            {{ sendingReminder ? t('sending') : t('sendReminder') }}
                        </button>

                        <!-- Result Message -->
                        <div v-if="reminderResult" 
                             :class="[
                                'p-3 rounded-lg text-sm',
                                reminderResult.success 
                                    ? 'bg-green-50 text-green-800' 
                                    : reminderResult.isRateLimited
                                        ? 'bg-red-50 text-red-800 border border-red-200'
                                        : 'bg-red-50 text-red-800'
                             ]">
                            <div v-if="reminderResult.success">
                                <p class="font-medium">{{ t('reminderSentSuccess') }}</p>
                                <ul class="mt-1 text-xs space-y-1">
                                    <li>• {{ t('totalNotified') }}: {{ reminderResult.totalNotified }}</li>
                                    <li>• {{ t('pushNotificationsSent') }}: {{ reminderResult.pushSent }}</li>
                                    <li>• {{ t('inAppNotificationsStored') }}: {{ reminderResult.inAppStored }}</li>
                                </ul>
                                <!-- Warning about users without push subscriptions -->
                                <div v-if="reminderResult.residentsWithoutPushSubscription?.length" class="mt-2 p-2 bg-amber-100 rounded text-amber-800">
                                    <p class="font-medium text-xs">{{ t('residentsWithoutPush') }}:</p>
                                    <p class="text-xs mt-1">
                                        {{ reminderResult.residentsWithoutPushSubscription.map(r => r.name).join(', ') }}
                                    </p>
                                    <p class="text-xs mt-1 italic">{{ t('residentsWithoutPushNote') }}</p>
                                </div>
                            </div>
                            <div v-else>
                                <div v-if="reminderResult.isRateLimited" class="flex items-start gap-2">
                                    <Icon name="material-symbols:schedule" class="text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p class="font-medium">{{ t('rateLimitExceeded') }}</p>
                                        <p class="text-xs mt-1">{{ reminderResult.message }}</p>
                                    </div>
                                </div>
                                <p v-else>{{ reminderResult.message }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <ModalsContainer />
    </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'
import ManageFeeCategoriesModal from '~/components/modals/ManageFeeCategoriesModal.vue'
import ResidentFeeDetailsModal from '~/components/modals/ResidentFeeDetailsModal.vue'

const { t } = useI18n()
const { localizeNumber } = useNumberLocalization()

// Helper to extract and normalize phone numbers for display
const stripPhonePrefix = (phone: string | null) => {
    if (!phone) return ''
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('+91')) {
        return cleaned.substring(3)
    } else if (cleaned.startsWith('91')) {
        return cleaned.substring(2)
    }
    return cleaned.slice(-10)
}

type ResidentWithFees = {
    id: string
    first_name: string
    last_name: string
    phone_number: string
    room: string
    avatar: string | null
    joining_date: string | null
    guardian_name: string | null
    family_phone_number: string | null
    is_invite: boolean
    fee_category: string | null
    fee_category_id: string | null
    fee_category_amount: number
    discount_amount: number
    total_fee_amount: number
    amount_paid: number
    remaining_balance: number
    payment_status: 'paid' | 'partial' | 'unpaid'
    payment_date: string | null
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string
const pageSize = 10
const navigationStore = useNavigationStore()
const pageKey = computed(() => route.path)

// Staff permissions check
const { canManageForHostel } = useStaffContext()
const { userProfile } = useCurrentUser()

const isAdmin = computed(() => userProfile.value?.is_admin ?? false)
const canManageFees = computed(() => isAdmin.value || canManageForHostel(hostelSlug, 'fees'))

const searchTerm = ref('')
const debouncedSearchTerm = ref('')
const statusFilter = ref<'all' | 'paid' | 'partial' | 'unpaid'>('all')
const currentPage = ref(navigationStore.getLastPage(pageKey.value))

// Debounce search input
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchTerm, (newValue) => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => {
        debouncedSearchTerm.value = newValue
        currentPage.value = 1 // Reset to first page on search
    }, 300)
})

// Reset to first page when status filter changes
watch(statusFilter, () => {
    currentPage.value = 1
})

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const { data: apiResponse, pending, error, refresh } = useDynamicAsyncData(
    () => `fees-${hostelSlug}-page-${currentPage.value}-status-${statusFilter.value}-search-${debouncedSearchTerm.value}`,
    () => $fetch('/api/manage-fees/get-residents-with-fees', {
        query: {
            hostel_slug: hostelSlug,
            limit: pageSize,
            offset: (currentPage.value - 1) * pageSize,
            status_filter: statusFilter.value,
            search: debouncedSearchTerm.value || undefined
        }
    }),
    {
        watch: [currentPage, statusFilter, debouncedSearchTerm],
    }
)

const residents = computed(() => apiResponse.value?.residents || [])
const totalResidents = computed(() => apiResponse.value?.total || 0)
const currentMonth = computed(() => apiResponse.value?.current_month ?? new Date().getMonth())
const totalPages = computed(() => Math.ceil(totalResidents.value / pageSize))

// Status counts - these show counts from current page results
const paidCount = computed(() => residents.value.filter((r: ResidentWithFees) => r.payment_status === 'paid').length)
const partialCount = computed(() => residents.value.filter((r: ResidentWithFees) => r.payment_status === 'partial').length)
const unpaidCount = computed(() => residents.value.filter((r: ResidentWithFees) => r.payment_status === 'unpaid').length)

// Since search and filter are now server-side, filteredResidents just returns the API results
const filteredResidents = computed(() => residents.value)

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        navigationStore.saveLastPage(pageKey.value, page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const openFeeCategoriesModal = () => {
    const { open, close } = useModal({
        component: ManageFeeCategoriesModal,
        attrs: {
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

const openResidentFeeDetails = (resident: ResidentWithFees) => {
    const { open, close } = useModal({
        component: ResidentFeeDetailsModal,
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

// Fee Reminder Modal State
const showReminderModal = ref(false)
const reminderTarget = ref<'pending' | 'all'>('pending')
const reminderMessage = ref('')
const sendingReminder = ref(false)
const reminderResult = ref<{
    success: boolean
    message?: string
    totalNotified?: number
    pushSent?: number
    inAppStored?: number
    residentsWithoutPushSubscription?: { id: string; name: string }[]
    isRateLimited?: boolean
} | null>(null)

// Send fee reminder
const sendFeeReminder = async () => {
    sendingReminder.value = true
    reminderResult.value = null

    try {
        const result = await $fetch('/api/manage-fees/send-reminder', {
            method: 'POST',
            body: {
                hostel_slug: hostelSlug,
                only_pending: reminderTarget.value === 'pending',
                message: reminderMessage.value || undefined,
            }
        })
        
        reminderResult.value = {
            success: true,
            totalNotified: result.totalNotified,
            pushSent: result.pushSent,
            inAppStored: result.inAppStored,
            residentsWithoutPushSubscription: result.residentsWithoutPushSubscription,
        }
    } catch (error: any) {
        console.error('Failed to send reminder:', error)
        
        // Special handling for rate limiting
        const isRateLimited = error.status === 429
        
        reminderResult.value = {
            success: false,
            message: error.data?.message || 'Failed to send reminders',
            isRateLimited,
        }
    } finally {
        sendingReminder.value = false
    }
}
</script>