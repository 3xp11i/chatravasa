<template>
  <div class="p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Meals Management</h1>
      
      <!-- Tab Navigation -->
      <div class="">
        <nav class="border-b border-black-200 flex w-auto" aria-label="Tabs">
          <button
            @click="activeView = 'weekly'"
            :class="[
              activeView === 'weekly'
                ? 'bg-green-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-b-none! rounded-bl-none!'
            ]"
          >
            Weekly Schedule
          </button>
          <button
            @click="activeView = 'manage'"
            :class="[
              activeView === 'manage'
                ? 'bg-green-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-b-none! rounded-br-none!'
            ]"
          >
            Manage Meals
          </button>
        </nav>
      </div>
    </div>

    <!-- Weekly Table View -->
    <div v-if="activeView === 'weekly'">
      <div class="mb-4">
        <p class="text-sm text-gray-600">View the complete weekly meal schedule for your hostel.</p>
      </div>
      <div v-if="loading" class="text-gray-600">Loading meals...</div>
      <div v-else-if="meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <p class="text-gray-600 mb-4">No meals have been created yet.</p>
        <button @click="activeView = 'manage'" class="text-green-600 hover:text-green-700 font-medium">
          Go to Manage Meals to create your first meal →
        </button>
      </div>
      <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekday</th>
              <th v-for="meal in meals" :key="meal.id" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div>{{ meal.name }}</div>
                <div class="text-xs font-normal text-gray-500 normal-case">{{ formatTime(meal.timing) }}</div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="d in days" :key="d.value">
              <td class="px-4 py-3 font-semibold text-gray-900">{{ d.labelLong }}</td>
              <td v-for="meal in meals" :key="meal.id" class="px-4 py-3 text-sm text-gray-700">
                <span v-if="meal.weekdays.includes(d.value)">{{ meal.menu?.[d.value] || '—' }}</span>
                <span v-else class="text-gray-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manage Cards View -->
    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">Create, edit, or delete meals for your hostel.</p>
        <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Meal
        </button>
      </div>
      <div v-if="loading" class="text-gray-600">Loading meals...</div>
      <div v-else-if="meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No meals yet</h3>
        <p class="text-gray-600 mb-4">Get started by creating your first meal.</p>
        <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Create First Meal
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="meal in meals" :key="meal.id" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ meal.name }}</h3>
              <p class="text-sm text-gray-600">{{ formatTime(meal.timing) }} • Deadline {{ meal.status_deadline }}h</p>
            </div>
            <button @click="openEdit(meal)" class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Edit</button>
          </div>
          <div class="mt-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Food by weekday</h4>
            <ul class="space-y-1">
              <li v-for="d in days" :key="d.value" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ d.labelLong }}</span>
                <span class="text-gray-800">{{ meal.weekdays.includes(d.value) ? (meal.menu?.[d.value] || '—') : '—' }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ModalsContainer />
  </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import AddMealModal from '~/components/modals/AddMealModal.vue'
import EditMealModal from '~/components/modals/EditMealModal.vue'
type Meal = {
  id: string
  name: string
  timing: string
  status_deadline: number
  weekdays: number[]
  menu?: Record<number, string>
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string

const days = [
  { label: 'Sun', labelLong: 'Sunday', value: 0 },
  { label: 'Mon', labelLong: 'Monday', value: 1 },
  { label: 'Tue', labelLong: 'Tuesday', value: 2 },
  { label: 'Wed', labelLong: 'Wednesday', value: 3 },
  { label: 'Thu', labelLong: 'Thursday', value: 4 },
  { label: 'Fri', labelLong: 'Friday', value: 5 },
  { label: 'Sat', labelLong: 'Saturday', value: 6 },
]

const activeView = ref<'weekly' | 'manage'>('weekly')
const loading = ref(false)
const meals = ref<Meal[]>([])

const openAddModal = () => {
  const { open, close } = useModal({
    component: AddMealModal,
    attrs: {
      hostelSlug,
      onClose() {
        close()
      },
      onCreated() {
        refresh()
      },
    },
  })
  open()
}

const openEdit = (meal: Meal) => {
  const { open, close } = useModal({
    component: EditMealModal as any,
    attrs: {
      meal,
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

const refresh = async () => {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; meals: Meal[] }>(`/api/manage-meals/list`, {
      query: { hostel_slug: hostelSlug },
    })
    meals.value = (res?.meals || []).map((m) => ({ ...m, menu: m.menu || {} }))
  } catch (e) {
    meals.value = []
  } finally {
    loading.value = false
  }
}

const formatTime = (t: string) => {
  // Expecting HH:mm, convert to 12h display
  if (!t) return ''
  const [hStr, mStr] = t.split(':')
  let h = Number(hStr)
  const m = Number(mStr)
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

onMounted(refresh)
</script>

<style></style>