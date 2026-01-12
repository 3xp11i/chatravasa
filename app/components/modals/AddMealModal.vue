<template>
    <VueFinalModal :model-value="true"
                   class="flex justify-center items-center px-4"
                   content-class="max-w-lg w-full max-h-[90vh] max-h-[90dvh]"
                   overlay-transition="vfm-fade"
                   content-transition="vfm-fade"
                   :click-to-close="false"
                   :lock-scroll="true">
        <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] max-h-[80dvh] overflow-y-auto overflow-x-hidden w-full">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Add Meal</h2>
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

            <form @submit.prevent="submit">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                        <input v-model="form.name"
                               type="text"
                               required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                               placeholder="Breakfast, Lunch, Dinner, Snack..." />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                            <input v-model="form.timing"
                                   type="time"
                                   required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status Deadline (hours)</label>
                            <input v-model.number="form.status_deadline"
                                   type="number"
                                   min="0"
                                   step="1"
                                   required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="block text-sm font-medium text-gray-700">Weekdays & Food</label>
                            <button v-if="selectedDays.length > 0"
                                    type="button"
                                    @click="copyFirstToAll"
                                    class="text-xs text-blue-600 hover:text-blue-700 underline">
                                Copy first to all
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mb-3">Select weekdays and enter food for each.</p>
                        <div class="space-y-2">
                            <div v-for="(day, index) in days"
                                 :key="day.value"
                                 class="flex flex-col items-start gap-1 p-2 border rounded-md"
                                 :class="form.weekdays.includes(day.value) ? 'bg-green-50 border-green-200' : 'bg-gray-50'">
                                <div class="flex justify-evenly items-center ">

                                    <input type="checkbox"
                                           :value="day.value"
                                           v-model="form.weekdays"
                                           class="shrink-0" />
                                    <span class="w-20 text-sm font-medium text-gray-700 shrink-0 mx-2">{{ day.labelLong
                                        }}</span>
                                    <button v-if="form.weekdays.includes(day.value) && index > 0"
                                            type="button"
                                            @click="copyFromAbove(index)"
                                            class="flex text-xs text-gray-600 hover:text-gray-800 shrink-0 justify-self-end min-h-auto!"
                                            title="Copy from above">
                                        <svg class="w-4 h-4"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>

                                        Copy from above
                                    </button>
                                </div>


                                <input v-if="form.weekdays.includes(day.value)"
                                       v-model="menuInputs[day.value]"
                                       type="text"
                                       :placeholder="`e.g., Dal Chawal, Poha`"
                                       class="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="statusMessage"
                     class="mt-4 p-3 rounded-md"
                     :class="statusType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ statusMessage }}
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button type="button"
                            @click="emit('close')"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="submit"
                            :disabled="isSubmitting"
                            class="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                        {{ isSubmitting ? 'Adding...' : 'Add Meal' }}
                    </button>
                </div>
            </form>
        </div>
    </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

const props = defineProps<{ hostelSlug: string }>()
const emit = defineEmits<{ close: []; created: [] }>()

const days = [
    { label: 'Sun', labelLong: 'Sunday', value: 0 },
    { label: 'Mon', labelLong: 'Monday', value: 1 },
    { label: 'Tue', labelLong: 'Tuesday', value: 2 },
    { label: 'Wed', labelLong: 'Wednesday', value: 3 },
    { label: 'Thu', labelLong: 'Thursday', value: 4 },
    { label: 'Fri', labelLong: 'Friday', value: 5 },
    { label: 'Sat', labelLong: 'Saturday', value: 6 },
]

const form = reactive({
    name: '',
    timing: '',
    status_deadline: 2,
    weekdays: [] as number[],
})

const menuInputs = reactive<Record<number, string | undefined>>({})
const selectedDays = computed(() => days.filter((d) => form.weekdays.includes(d.value)))

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

watch(
    () => [...form.weekdays],
    (newDays) => {
        // Add inputs for newly selected days
        for (const d of newDays) {
            if (!(d in menuInputs)) menuInputs[d] = ''
        }
        // Remove inputs for unselected days
        for (const key of Object.keys(menuInputs)) {
            const k = Number(key)
            if (!newDays.includes(k)) delete (menuInputs as any)[k]
        }
    }
)

const copyFirstToAll = () => {
    const firstDay = selectedDays.value[0]
    if (!firstDay || !menuInputs[firstDay.value]?.trim()) return
    const firstFood = menuInputs[firstDay.value]
    for (const day of selectedDays.value) {
        menuInputs[day.value] = firstFood
    }
}

const copyFromAbove = (index: number) => {
    if (index === 0) return
    const currentDay = days[index]
    if (!currentDay) return
    // Find the previous checked day
    for (let i = index - 1; i >= 0; i--) {
        const prevDay = days[i]
        if (prevDay && form.weekdays.includes(prevDay.value) && menuInputs[prevDay.value]) {
            menuInputs[currentDay.value] = menuInputs[prevDay.value]!
            break
        }
    }
}

const submit = async () => {
    statusMessage.value = ''
    if (!form.weekdays.length) {
        statusType.value = 'error'
        statusMessage.value = 'Please select at least one weekday.'
        return
    }
    isSubmitting.value = true
    try {
        const menu = Object.entries(menuInputs)
            .filter(([_, food]) => food && food.trim())
            .map(([day, food]) => ({ weekday: Number(day), food: food.trim() }))

        await $fetch('/api/manage-meals/add-meal', {
            method: 'POST',
            body: {
                hostel_slug: props.hostelSlug,
                name: form.name,
                timing: form.timing,
                status_deadline: form.status_deadline,
                weekdays: form.weekdays,
                menu,
            },
        })
        statusType.value = 'success'
        statusMessage.value = 'Meal added successfully'
        emit('created')
        setTimeout(() => emit('close'), 800)
    } catch (error: any) {
        statusType.value = 'error'
        statusMessage.value = error?.data?.message || 'Failed to add meal'
    } finally {
        isSubmitting.value = false
    }
}
</script>
