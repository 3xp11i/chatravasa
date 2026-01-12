<template>
  <VueFinalModal :model-value="true" class="flex justify-center items-center px-4"
                 content-class="max-w-lg w-full max-h-[90vh] max-h-[90dvh]"
                 overlay-transition="vfm-fade"
                 content-transition="vfm-fade"
                 :click-to-close="false"
                 :lock-scroll="true">
    <div class="bg-white rounded-lg shadow-xl p-6 max-h-[80vh] max-h-[80dvh] overflow-y-auto overflow-x-hidden w-full">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Edit Meal</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
            <input v-model="form.name" type="text" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Timing</label>
            <input v-model="form.timing" type="time" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Deadline (hours)</label>
          <input v-model.number="form.status_deadline" type="number" min="0" step="1" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">Weekdays & Food</label>
            <button v-if="selectedDays.length > 0" type="button" @click="copyFirstToAll"
                    class="text-xs text-blue-600 hover:text-blue-700 underline">
              Copy first to all
            </button>
          </div>
          <p class="text-xs text-gray-500 mb-3">Select weekdays and enter food for each.</p>
          <div class="space-y-2">
            <div v-for="(day, index) in days" :key="day.value" 
                 class="flex flex-col items-start gap-1 p-2 border rounded-md"
                 :class="form.weekdays.includes(day.value) ? 'bg-green-50 border-green-200' : 'bg-gray-50'">
              <div class="flex justify-evenly items-center">
                <input type="checkbox" :value="day.value" v-model="form.weekdays"
                       class="shrink-0" />
                <span class="w-20 text-sm font-medium text-gray-700 shrink-0 mx-2">{{ day.labelLong }}</span>
                <button v-if="form.weekdays.includes(day.value) && index > 0" 
                        type="button" 
                        @click="copyFromAbove(index)"
                        class="flex text-xs text-gray-600 hover:text-gray-800 shrink-0 justify-self-end !min-h-auto"
                        title="Copy from above">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy from above
                </button>
              </div>

              <input v-if="form.weekdays.includes(day.value)" 
                     v-model="menuInputs[day.value]" 
                     type="text" 
                     placeholder="Food (e.g., Poha)"
                     class="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        <div v-if="statusMessage" class="p-3 rounded-md"
             :class="statusType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
          {{ statusMessage }}
        </div>

        <div class="flex justify-between items-center mt-4 gap-3 flex-wrap">
          <button @click="onDelete" :disabled="isDeleting"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
            {{ isDeleting ? 'Removing...' : 'Remove Meal' }}
          </button>
          <div class="flex gap-3">
            <button @click="emit('close')" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">Cancel</button>
            <button @click="onSave" :disabled="isSaving"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

type Meal = {
  id: string
  name: string
  timing: string
  status_deadline: number
  weekdays: number[]
  menu?: Record<number, string>
}

const props = defineProps<{ meal: Meal; hostelSlug: string }>()
const emit = defineEmits<{ close: []; updated: []; deleted: [] }>()

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
  name: props.meal.name,
  timing: props.meal.timing,
  status_deadline: props.meal.status_deadline,
  weekdays: [...props.meal.weekdays],
})

// Initialize menuInputs with existing food data
const menuInputs = reactive<Record<number, string>>({})
for (const d of props.meal.weekdays) {
  menuInputs[d] = props.meal.menu?.[d] || ''
}

const selectedDays = computed(() => days.filter((d) => form.weekdays.includes(d.value)))

watch(
  () => [...form.weekdays],
  (newDays) => {
    // ensure inputs exist for newly selected days; cleanup removed days
    for (const d of newDays) if (!(d in menuInputs)) menuInputs[d] = ''
    for (const key of Object.keys(menuInputs)) {
      const k = Number(key)
      if (!newDays.includes(k)) delete (menuInputs as any)[k]
    }
  }
)

const isSaving = ref(false)
const isDeleting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const copyFirstToAll = () => {
  const firstDay = selectedDays.value[0]
  if (!firstDay || !menuInputs[firstDay.value]?.trim()) return
  const firstFood = menuInputs[firstDay.value]
  for (const day of selectedDays.value) {
    menuInputs[day.value] = firstFood
  }
}

const copyFromLeft = (index: number) => {
  if (index === 0) return
  // Find the previous checked day
  for (let i = index - 1; i >= 0; i--) {
    const prevDay = days[i]
    if (form.weekdays.includes(prevDay.value) && menuInputs[prevDay.value]) {
      menuInputs[days[index].value] = menuInputs[prevDay.value]
      break
    }
  }
}

const copyFromAbove = (index: number) => {
  if (index === 0) return
  // Find the previous checked day
  for (let i = index - 1; i >= 0; i--) {
    const prevDay = days[i]
    if (form.weekdays.includes(prevDay.value) && menuInputs[prevDay.value]) {
      menuInputs[days[index].value] = menuInputs[prevDay.value]
      break
    }
  }
}

const onSave = async () => {
  statusMessage.value = ''
  if (!form.name.trim() || !form.timing || !form.weekdays.length) {
    statusType.value = 'error'
    statusMessage.value = 'Please fill required fields and select weekdays.'
    return
  }
  isSaving.value = true
  try {
    const menu = Object.entries(menuInputs)
      .map(([k, v]) => ({ weekday: Number(k), food: (v || '').trim() }))
    await $fetch('/api/manage-meals/update-meal', {
      method: 'PATCH',
      body: {
        hostel_slug: props.hostelSlug,
        meal_id: props.meal.id,
        name: form.name,
        timing: form.timing,
        status_deadline: form.status_deadline,
        weekdays: form.weekdays,
        menu,
      },
    })
    statusType.value = 'success'
    statusMessage.value = 'Meal updated'
    emit('updated')
    setTimeout(() => emit('close'), 800)
  } catch (error: any) {
    statusType.value = 'error'
    statusMessage.value = error?.data?.message || 'Failed to update meal'
  } finally {
    isSaving.value = false
  }
}

const onDelete = async () => {
  if (!confirm('Remove this meal?')) return
  isDeleting.value = true
  statusMessage.value = ''
  try {
    await $fetch('/api/manage-meals/delete-meal', {
      method: 'DELETE',
      body: { hostel_slug: props.hostelSlug, meal_id: props.meal.id },
    })
    statusType.value = 'success'
    statusMessage.value = 'Meal removed'
    emit('deleted')
    emit('close')
  } catch (error: any) {
    statusType.value = 'error'
    statusMessage.value = error?.data?.message || 'Failed to remove meal'
  } finally {
    isDeleting.value = false
  }
}
</script>
