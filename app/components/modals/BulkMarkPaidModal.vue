<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import { ref, computed } from 'vue'
import placeholderAvatar from '~/assets/images/avatar-placeholder.svg'

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
const isMarking = ref(false)
const residents = ref<any[]>([])
const selectedIds = ref<Set<string>>(new Set())
const searchTerm = ref('')
const markingResult = ref<{ success: boolean; message: string } | null>(null)

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

// Load all residents with pending/partial fees
const loadResidents = async () => {
    isLoading.value = true
    try {
        // Get residents who haven't fully paid (unpaid or partial)
        const data = await $fetch('/api/manage-fees/get-residents-with-fees', {
            query: {
                hostel_slug: props.hostelSlug,
                limit: 1000, // Get all residents
                offset: 0,
                status_filter: 'all' // Get all, we'll filter on client
            }
        })
        // Filter to only show residents with a category assigned and not fully paid
        residents.value = (data.residents || []).filter((r: any) => 
            r.fee_category && r.payment_status !== 'paid'
        )
    } catch (error) {
        console.error('Failed to load residents:', error)
    } finally {
        isLoading.value = false
    }
}

// Filtered residents based on search
const filteredResidents = computed(() => {
    if (!searchTerm.value.trim()) return residents.value
    
    const term = searchTerm.value.toLowerCase()
    return residents.value.filter((r: any) => {
        const fullName = `${r.first_name} ${r.last_name}`.toLowerCase()
        const room = (r.room || '').toLowerCase()
        return fullName.includes(term) || room.includes(term)
    })
})

// Selection helpers
const isSelected = (id: string) => selectedIds.value.has(id)

const toggleSelection = (id: string) => {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
    } else {
        selectedIds.value.add(id)
    }
    // Trigger reactivity
    selectedIds.value = new Set(selectedIds.value)
}

const selectAll = () => {
    filteredResidents.value.forEach((r: any) => {
        selectedIds.value.add(r.id)
    })
    selectedIds.value = new Set(selectedIds.value)
}

const deselectAll = () => {
    selectedIds.value.clear()
    selectedIds.value = new Set(selectedIds.value)
}

const allSelected = computed(() => {
    if (filteredResidents.value.length === 0) return false
    return filteredResidents.value.every((r: any) => selectedIds.value.has(r.id))
})

// Mark selected as paid
const markAsPaid = async () => {
    if (selectedIds.value.size === 0) return

    isMarking.value = true
    markingResult.value = null

    try {
        const result = await $fetch('/api/manage-fees/bulk-mark-paid', {
            method: 'POST',
            body: {
                hostel_slug: props.hostelSlug,
                resident_ids: Array.from(selectedIds.value)
            }
        }) as { success: boolean; markedCount: number; skippedCount?: number; message?: string }

        markingResult.value = {
            success: true,
            message: t('bulkMarkSuccess', { count: result.markedCount, skipped: result.skippedCount || 0 })
        }

        selectedIds.value.clear()
        selectedIds.value = new Set(selectedIds.value)
        
        // Reload residents to update the list
        await loadResidents()
        emit('updated')
    } catch (error: any) {
        console.error('Failed to mark as paid:', error)
        markingResult.value = {
            success: false,
            message: error.data?.message || t('failedMarkAsPaid')
        }
    } finally {
        isMarking.value = false
    }
}

onMounted(() => {
    loadResidents()
})
</script>

<template>
    <VueFinalModal class="flex justify-center items-center px-4"
                   content-class="w-full bg-white rounded-xl shadow-xl p-5 max-h-[90vh] max-h-[90dvh] overflow-hidden flex flex-col"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 shrink-0">
            <div>
                <h2 class="text-xl font-bold text-gray-900">{{ t('quickMarkPaid') }}</h2>
                <p class="text-sm text-gray-500">{{ monthNames[currentMonth] }} {{ currentYear }}</p>
            </div>
            <button @click="emit('close')"
                    class="text-gray-400 hover:text-gray-600">
                <Icon name="material-symbols:close" class="text-2xl" />
            </button>
        </div>

        <!-- Search and Selection Controls -->
        <div class="space-y-3 mb-4 shrink-0">
            <!-- Search -->
            <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Icon name="material-symbols:search" class="text-gray-400 text-xl" />
                <input v-model="searchTerm"
                       type="text"
                       :placeholder="t('searchByNameRoom')"
                       class="flex-1 bg-transparent outline-none text-gray-800" />
            </div>

            <!-- Selection controls -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button @click="allSelected ? deselectAll() : selectAll()"
                            class="text-sm text-green-600 hover:text-green-700 font-medium">
                        {{ allSelected ? t('deselectAll') : t('selectAll') }}
                    </button>
                    <span class="text-sm text-gray-500">
                        ({{ localizeNumber(selectedIds.size) }} {{ t('selected') }})
                    </span>
                </div>
                <span class="text-sm text-gray-500">
                    {{ localizeNumber(filteredResidents.length) }} {{ t('pending') }}
                </span>
            </div>
        </div>

        <!-- Result Message -->
        <div v-if="markingResult" 
             :class="[
                 'p-3 rounded-lg text-sm mb-4 shrink-0',
                 markingResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
             ]">
            {{ markingResult.message }}
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center py-10">
            <Icon name="svg-spinners:ring-resize" class="text-3xl text-green-600" />
        </div>

        <!-- Empty State -->
        <div v-else-if="residents.length === 0" class="flex-1 flex flex-col items-center justify-center py-10 text-gray-500">
            <Icon name="material-symbols:check-circle" class="text-5xl text-green-500 mb-2" />
            <p class="font-medium">{{ t('allResidentsPaid') }}</p>
            <p class="text-sm">{{ t('allResidentsPaidDesc') }}</p>
        </div>

        <!-- Residents List -->
        <div v-else class="flex-1 overflow-y-auto -mx-5 px-5">
            <div v-if="filteredResidents.length === 0" class="text-center text-gray-500 py-10">
                {{ t('noMatchingResidents') }}
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="resident in filteredResidents"
                     :key="resident.id"
                     @click="toggleSelection(resident.id)"
                     :class="[
                         'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition',
                         isSelected(resident.id)
                             ? 'border-green-500 bg-green-50'
                             : 'border-gray-200 hover:border-gray-300'
                     ]">
                    <!-- Checkbox -->
                    <div :class="[
                        'w-5 h-5 rounded flex items-center justify-center shrink-0 transition',
                        isSelected(resident.id)
                            ? 'bg-green-500'
                            : 'border-2 border-gray-300'
                    ]">
                        <Icon v-if="isSelected(resident.id)" 
                              name="material-symbols:check" 
                              class="text-white text-sm" />
                    </div>

                    <!-- Avatar -->
                    <img :src="resident.avatar || placeholderAvatar"
                         class="h-10 w-10 rounded-full object-cover shrink-0"
                         alt="" />

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">
                            {{ resident.first_name }} {{ resident.last_name }}
                        </div>
                        <div class="text-xs text-gray-500">
                            {{ t('room') }} {{ resident.room || t('noRoom') }}
                        </div>
                    </div>

                    <!-- Amount -->
                    <div class="text-right shrink-0">
                        <div class="text-sm font-semibold text-gray-900">
                            ₹{{ localizeNumber(resident.remaining_balance) }}
                        </div>
                        <div :class="[
                            'text-xs',
                            resident.payment_status === 'partial' ? 'text-amber-600' : 'text-red-600'
                        ]">
                            {{ resident.payment_status === 'partial' ? t('partial') : t('unpaid') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer with Mark as Paid Button -->
        <div v-if="residents.length > 0" class="mt-4 pt-4 border-t border-gray-200 shrink-0">
            <button @click="markAsPaid"
                    :disabled="selectedIds.size === 0 || isMarking"
                    class="w-full py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Icon v-if="isMarking" name="svg-spinners:ring-resize" class="text-xl" />
                <Icon v-else name="material-symbols:check-circle" class="text-xl" />
                {{ isMarking ? t('marking') : t('markSelectedAsPaid', { count: selectedIds.size }) }}
            </button>
        </div>
    </VueFinalModal>
</template>
