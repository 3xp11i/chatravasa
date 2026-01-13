<template>
  <div class="p-4 md:p-6">
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{{ t('mealsManagement') }}</h1>
      
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
            {{ t('analyticsSchedule') }}
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
            {{ t('manageMeals') }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Analytics & Schedule View -->
    <div v-if="activeView === 'analytics'">
      <!-- Today/Tomorrow Summary Cards -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ t('quickOverview') }}</h2>
        <div v-if="analyticsLoading" class="text-gray-600">{{ t('loadingAnalytics') }}</div>
        <div v-else-if="!analyticsData || analyticsData.meals.length === 0" class="bg-gray-50 rounded-lg p-4 text-center">
          <p class="text-gray-600">{{ t('noMealData') }}</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Today's Card -->
          <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ t('today') }}</h3>
              <span class="text-sm text-gray-500">{{ formatDate(analyticsData.today) }} ({{ days[analyticsData.todayWeekday]?.labelLong }})</span>
            </div>
            <div class="space-y-2">
              <div v-for="meal in todayMeals" :key="meal.meal_id" :class="[
                'flex items-center justify-between py-2 px-3 rounded-md border-b border-gray-100 last:border-0 transition',
                currentMealId === meal.meal_id 
                  ? 'bg-green-100 border-l-4 border-l-green-600 font-semibold' 
                  : 'hover:bg-gray-50'
              ]">
                <div>
                  <span class="font-medium text-gray-800">{{ meal.meal_name }}</span>
                  <span class="text-sm text-gray-500 ml-2">{{ formatTime(meal.timing) }}</span>
                  <span v-if="currentMealId === meal.meal_id" class="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">{{ t('currentMeal') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-green-600">{{ localizeNumber(meal.today_opted_count ?? 0) }}</span>
                  <span class="text-sm text-gray-500">/ {{ localizeNumber(analyticsData.totalResidents) }}</span>
                </div>
              </div>
              <div v-if="todayMeals.length === 0" class="text-gray-500 text-sm py-2">{{ t('noMealsToday') }}</div>
            </div>
          </div>

          <!-- Tomorrow's Card -->
          <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ t('tomorrow') }}</h3>
              <span class="text-sm text-gray-500">{{ formatDate(analyticsData?.tomorrow) }} ({{ days[analyticsData?.tomorrowWeekday]?.labelLong }})</span>
            </div>
            <div class="space-y-2">
              <div v-for="meal in tomorrowMeals" :key="meal.meal_id" :class="[
                'flex items-center justify-between py-2 px-3 rounded-md border-b border-gray-100 last:border-0 transition',
                'hover:bg-gray-50'
              ]">
                <div>
                  <span class="font-medium text-gray-800">{{ meal.meal_name }}</span>
                  <span class="text-sm text-gray-500 ml-2">{{ formatTime(meal.timing) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold text-blue-600">{{ localizeNumber(meal.tomorrow_opted_count ?? 0) }}</span>
                  <span class="text-sm text-gray-500">/ {{ localizeNumber(analyticsData.totalResidents) }}</span>
                </div>
              </div>
              <div v-if="tomorrowMeals.length === 0" class="text-gray-500 text-sm py-2">{{ t('noMealsTomorrow') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Analytics Table -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ t('weeklyAttendanceForecast') }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ t('attendanceForecastDesc') }}</p>
        <div v-if="analyticsLoading" class="text-gray-600">{{ t('loadingAnalytics') }}</div>
        <div v-else-if="!analyticsData || analyticsData.meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
          <p class="text-gray-600 mb-4">{{ t('noMealsCreated') }}</p>
          <button @click="activeView = 'manage'" class="text-green-600 hover:text-green-700 font-medium">
            {{ t('goToManageMeals') }}
          </button>
        </div>
        <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('weekday') }}</th>
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
                  <span v-if="d.value === analyticsData.todayWeekday" class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{{ t('today') }}</span>
                  <span v-if="d.value === analyticsData.tomorrowWeekday" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{{ t('tomorrow') }}</span>
                </td>
                <td v-for="meal in analyticsData.meals" :key="meal.meal_id" class="px-4 py-3 text-sm">
                  <template v-if="meal.weekly[d.value]?.meal_served">
                    <div class="flex items-center gap-1">
                      <span class="font-semibold" :class="getCountColor(meal.weekly[d.value]?.opted_count ?? 0, analyticsData.totalResidents)">
                        {{ localizeNumber(meal.weekly[d.value]?.opted_count ?? 0) }}
                      </span>
                      <span class="text-gray-400">/ {{ localizeNumber(analyticsData.totalResidents) }}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ localizeNumber(getPercentage(meal.weekly[d.value]?.opted_count ?? 0, analyticsData.totalResidents)) }}%
                    </div>
                  </template>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Weekly Food Schedule Table (meals as rows, days as columns, improved UI) -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ t('weeklyFoodSchedule') }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ t('foodScheduleDesc') }}</p>
        <div v-if="loading" class="text-gray-600">{{ t('loadingMeals') }}</div>
        <div v-else-if="meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
          <p class="text-gray-600 mb-4">{{ t('noMealsCreated') }}</p>
          <button @click="activeView = 'manage'" class="text-green-600 hover:text-green-700 font-medium">
            {{ t('goToManageMeals') }}
          </button>
        </div>
        <div v-else class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full border-separate" style="border-spacing: 0;">
            <thead class="bg-gray-50 border-b border-gray-400">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 bg-green-50 border-r-2 border-gray-400">{{ t('meal') }}</th>
                <th v-for="d in days" :key="'menu-header-day-' + d.value" class="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r-2 border-gray-400" :class="[analyticsData?.value?.todayWeekday === d.value ? 'bg-green-50' : '']" style="min-width: 120px;">
                  {{ d.labelLong }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="meal in meals" :key="'menu-row-' + meal.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-green-50 z-10 border-r-2 border-gray-400">
                  <div>{{ meal.name }}</div>
                  <div class="text-xs font-normal text-gray-500 normal-case">{{ formatTime(meal.timing) }}</div>
                </td>
                <td v-for="d in days" :key="'menu-cell-' + meal.id + '-' + d.value" :class="['px-4 py-3 text-sm text-gray-700 border-r-2 border-gray-400', analyticsData?.value?.todayWeekday === d.value ? 'bg-green-200' : '']" style="max-width: 220px; min-width: 120px; word-break: break-word; white-space: normal; border-bottom: 2px solid #9ca3af;">
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
        <p class="text-sm text-gray-600">{{ t('manageMealsDesc') }}</p>
        <button v-if="canManageMeals" @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('addNewMeal') }}
        </button>
      </div>
      <div v-if="loading" class="text-gray-600">{{ t('loadingMeals') }}</div>
      <div v-else-if="meals.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('noMealsYet') }}</h3>
        <p class="text-gray-600 mb-4">{{ t('getStartedMeals') }}</p>
        <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          {{ t('createFirstMeal') }}
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="meal in meals" :key="meal.id" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ meal.name }}</h3>
              <p class="text-sm text-gray-600">{{ formatTime(meal.timing) }} • {{ t('deadline') }} {{ localizeNumber(meal.status_deadline) }}{{ t('hours') }}</p>
            </div>
            <button v-if="canManageMeals" @click="openEdit(meal)" class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">{{ t('edit') }}</button>
          </div>
          <div class="mt-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('foodByWeekday') }}</h4>
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

const { t } = useI18n()
const { localizeNumber } = useNumberLocalization()

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

const days = computed(() => [
  { label: 'Sun', labelLong: t('sunday'), value: 0 },
  { label: 'Mon', labelLong: t('monday'), value: 1 },
  { label: 'Tue', labelLong: t('tuesday'), value: 2 },
  { label: 'Wed', labelLong: t('wednesday'), value: 3 },
  { label: 'Thu', labelLong: t('thursday'), value: 4 },
  { label: 'Fri', labelLong: t('friday'), value: 5 },
  { label: 'Sat', labelLong: t('saturday'), value: 6 },
])

const activeView = ref<'analytics' | 'manage'>('analytics')

// useCachedAsyncData provides proper caching for SPA navigation
const { data: mealsData, pending: loading, refresh } = useCachedAsyncData(
  `meals-${hostelSlug}`,
  () => $fetch<{ success: boolean; meals: Meal[] }>(`/api/manage-meals/list`, {
    query: { hostel_slug: hostelSlug }
  })
)

// Fetch analytics data with caching for SPA navigation
const { data: analyticsResponse, pending: analyticsLoading, refresh: refreshAnalytics } = useCachedAsyncData(
  `meals-analytics-${hostelSlug}`,
  () => $fetch<AnalyticsResponse>(`/api/manage-meals/analytics`, {
    query: { hostel_slug: hostelSlug }
  })
)

const meals = computed(() => (mealsData.value?.meals || []).map((m) => ({ ...m, menu: m.menu || {} })))

const analyticsData = computed(() => analyticsResponse.value)

// Convert time string HH:mm to minutes for comparison
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Get current time in minutes
const currentTimeInMinutes = computed(() => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
})

// Check if a meal is the upcoming meal (within 45 minutes after its start time)
const getCurrentOrNextMealId = (): string | null => {
  const now = currentTimeInMinutes.value
  let highlightedMealId: string | null = null
  let minDiff = Infinity

  if (analyticsData.value) {
    for (const meal of analyticsData.value.meals) {
      const mealTime = timeToMinutes(meal.timing)
      const diff = mealTime - now
      
      // Highlight meal if it's upcoming or currently being served (within 45 mins after start)
      if (diff >= -45 && diff < minDiff) {
        minDiff = diff
        highlightedMealId = meal.meal_id
      }
    }
  }
  
  return highlightedMealId
}

// Filter meals that are served today and sort by timing
const todayMeals = computed(() => {
  if (!analyticsData.value) return []
  const filtered = analyticsData.value.meals.filter(m => 
    m.meal_weekdays.includes(analyticsData.value!.todayWeekday)
  )
  return filtered.sort((a, b) => timeToMinutes(a.timing) - timeToMinutes(b.timing))
})

// Filter meals that are served tomorrow and sort by timing
const tomorrowMeals = computed(() => {
  if (!analyticsData.value) return []
  const filtered = analyticsData.value.meals.filter(m => 
    m.meal_weekdays.includes(analyticsData.value!.tomorrowWeekday)
  )
  return filtered.sort((a, b) => timeToMinutes(a.timing) - timeToMinutes(b.timing))
})

// Get the current or next meal ID
const currentMealId = computed(() => getCurrentOrNextMealId())

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
  return `${localizeNumber(h)}:${localizeNumber(m).padStart(2, '0')} ${ampm}`
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