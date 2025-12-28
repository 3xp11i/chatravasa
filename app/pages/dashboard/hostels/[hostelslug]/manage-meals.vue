<template>
  <div class="p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Meals Management</h1>
      
      <!-- Tab Navigation -->
      <div class="">
        <nav class="border-b border-black-200 flex w-auto" aria-label="Tabs">
          <button
            @click="activeView = 'analytics'"
            :class="[
              activeView === 'analytics'
                ? 'bg-green-600 text-white'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-b-none! rounded-bl-none!'
            ]"
          >
            Analytics & Schedule
          </button>
          <button
            @click="activeView = 'manage'"
            :class="[
              activeView === 'manage'
                ? 'bg-green-600 text-white'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-b-none! rounded-br-none!'
            ]"
          >
            Manage Meals
          </button>
        </nav>
      </div>
    </div>

    <!-- Analytics & Schedule View -->
    <div v-if="activeView === 'analytics'">
      <!-- Today/Tomorrow Summary Cards -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Overview</h2>
        <div v-if="analyticsLoading" class="text-gray-600">Loading analytics...</div>
        <div v-else-if="!analyticsData || analyticsData.meals.length === 0" class="bg-gray-50 rounded-lg p-4 text-center">
          <p class="text-gray-600">No meal data available yet.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Today's Card -->
          <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Today</h3>
              <span class="text-sm text-gray-500">{{ formatDate(analyticsData.today) }} ({{ days[analyticsData.todayWeekday].labelLong }})</span>
            </div>
            <div class="space-y-2">
              <div v-for="meal in todayMeals" :key="meal.meal_id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span class="font-medium text-gray-800">{{ meal.meal_name }}</span>
                  <span class="text-sm text-gray-500 ml-2">{{ formatTime(meal.timing) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-green-600">{{ meal.today_opted_count ?? 0 }}</span>
                  <span class="text-sm text-gray-500">/ {{ analyticsData.totalResidents }}</span>
                </div>
              </div>
              <div v-if="todayMeals.length === 0" class="text-gray-500 text-sm py-2">No meals scheduled for today</div>
            </div>
          </div>

          <!-- Tomorrow's Card -->
          <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Tomorrow</h3>
              <span class="text-sm text-gray-500">{{ formatDate(analyticsData.tomorrow) }} ({{ days[analyticsData.tomorrowWeekday].labelLong }})</span>
            </div>
            <div class="space-y-2">
              <div v-for="meal in tomorrowMeals" :key="meal.meal_id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span class="font-medium text-gray-800">{{ meal.meal_name }}</span>
                  <span class="text-sm text-gray-500 ml-2">{{ formatTime(meal.timing) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-blue-600">{{ meal.tomorrow_opted_count ?? 0 }}</span>
                  <span class="text-sm text-gray-500">/ {{ analyticsData.totalResidents }}</span>
                </div>
              </div>
              <div v-if="tomorrowMeals.length === 0" class="text-gray-500 text-sm py-2">No meals scheduled for tomorrow</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Analytics Table -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Weekly Attendance Forecast</h2>
        <p class="text-sm text-gray-600 mb-4">Expected number of residents opting for each meal based on weekly preferences.</p>
        <div v-if="analyticsLoading" class="text-gray-600">Loading analytics...</div>
        <div v-else-if="!analyticsData || analyticsData.meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
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
                <th v-for="meal in analyticsData.meals" :key="meal.meal_id" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>{{ meal.meal_name }}</div>
                  <div class="text-xs font-normal text-gray-500 normal-case">{{ formatTime(meal.timing) }}</div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="d in days" :key="d.value" :class="{ 'bg-green-50': d.value === analyticsData.todayWeekday, 'bg-blue-50': d.value === analyticsData.tomorrowWeekday }">
                <td class="px-4 py-3 font-semibold text-gray-900">
                  {{ d.labelLong }}
                  <span v-if="d.value === analyticsData.todayWeekday" class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Today</span>
                  <span v-if="d.value === analyticsData.tomorrowWeekday" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Tomorrow</span>
                </td>
                <td v-for="meal in analyticsData.meals" :key="meal.meal_id" class="px-4 py-3 text-sm">
                  <template v-if="meal.weekly[d.value]?.meal_served">
                    <div class="flex items-center gap-1">
                      <span class="font-semibold" :class="getCountColor(meal.weekly[d.value]?.opted_count ?? 0, analyticsData.totalResidents)">
                        {{ meal.weekly[d.value]?.opted_count ?? 0 }}
                      </span>
                      <span class="text-gray-400">/ {{ analyticsData.totalResidents }}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ getPercentage(meal.weekly[d.value]?.opted_count ?? 0, analyticsData.totalResidents) }}%
                    </div>
                  </template>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Weekly Food Schedule Table -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Weekly Food Schedule</h2>
        <p class="text-sm text-gray-600 mb-4">View the complete weekly meal menu for your hostel.</p>
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
    </div>

    <!-- Manage Cards View -->
    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">Create, edit, or delete meals for your hostel.</p>
        <button v-if="canManageMeals" @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
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
            <button v-if="canManageMeals" @click="openEdit(meal)" class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Edit</button>
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

type MealAnalytics = {
  meal_id: string
  meal_name: string
  timing: string
  status_deadline: number
  meal_weekdays: number[]
  weekly: Record<number, { opted_count: number; meal_served: boolean }>
  today_opted_count: number | null
  tomorrow_opted_count: number | null
  today_weekday: number
  tomorrow_weekday: number
  today: string
  tomorrow: string
}

type AnalyticsResponse = {
  success: boolean
  totalResidents: number
  today: string
  tomorrow: string
  todayWeekday: number
  tomorrowWeekday: number
  meals: MealAnalytics[]
}

const route = useRoute()
const hostelSlug = route.params.hostelslug as string
const { isAdmin } = useCurrentUser()
const { canManageForHostel } = useStaffContext()
const canManageMeals = computed(() => isAdmin.value || canManageForHostel(hostelSlug, 'meals'))

const days = [
  { label: 'Sun', labelLong: 'Sunday', value: 0 },
  { label: 'Mon', labelLong: 'Monday', value: 1 },
  { label: 'Tue', labelLong: 'Tuesday', value: 2 },
  { label: 'Wed', labelLong: 'Wednesday', value: 3 },
  { label: 'Thu', labelLong: 'Thursday', value: 4 },
  { label: 'Fri', labelLong: 'Friday', value: 5 },
  { label: 'Sat', labelLong: 'Saturday', value: 6 },
]

const activeView = ref<'analytics' | 'manage'>('analytics')

// useAsyncData properly caches in SPA mode
const { data: mealsData, pending: loading, refresh } = useAsyncData(
  `meals-${hostelSlug}`,
  () => $fetch<{ success: boolean; meals: Meal[] }>(`/api/manage-meals/list`, {
    query: { hostel_slug: hostelSlug }
  })
)

// Fetch analytics data
const { data: analyticsResponse, pending: analyticsLoading, refresh: refreshAnalytics } = useAsyncData(
  `meals-analytics-${hostelSlug}`,
  () => $fetch<AnalyticsResponse>(`/api/manage-meals/analytics`, {
    query: { hostel_slug: hostelSlug }
  })
)

const meals = computed(() => (mealsData.value?.meals || []).map((m) => ({ ...m, menu: m.menu || {} })))

const analyticsData = computed(() => analyticsResponse.value)

// Filter meals that are served today
const todayMeals = computed(() => {
  if (!analyticsData.value) return []
  return analyticsData.value.meals.filter(m => 
    m.meal_weekdays.includes(analyticsData.value!.todayWeekday)
  )
})

// Filter meals that are served tomorrow
const tomorrowMeals = computed(() => {
  if (!analyticsData.value) return []
  return analyticsData.value.meals.filter(m => 
    m.meal_weekdays.includes(analyticsData.value!.tomorrowWeekday)
  )
})

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
        refreshAnalytics()
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
        refreshAnalytics()
      },
      onDeleted() {
        refresh()
        refreshAnalytics()
      },
    } as any,
  })
  open()
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getCountColor = (count: number, total: number) => {
  if (total === 0) return 'text-gray-500'
  const percentage = (count / total) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const getPercentage = (count: number, total: number) => {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}
</script>

<style></style>