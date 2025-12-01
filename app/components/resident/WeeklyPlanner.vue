<!--
  FILE: app/components/resident/WeeklyPlanner.vue
  PURPOSE: Display and manage meal selections for the current week (7 days).
  TODO:
    - Fetch meal plan data for the week from API/composable
    - Display each day with all three meals
    - Allow toggling future meals (respect cutoff times)
    - Show read-only state for past days
    - Highlight today
-->
<template>
  <div class="weekly-planner">
    <h2 class="text-lg font-semibold mb-4">Weekly Meal Plan</h2>
    
    <!-- Week Navigation (optional) -->
    <div class="flex justify-between items-center mb-4">
      <button @click="previousWeek" class="text-primary">← Previous</button>
      <span class="font-medium">{{ weekLabel }}</span>
      <button @click="nextWeek" class="text-primary">Next →</button>
    </div>
    
    <!-- Days Grid -->
    <div class="space-y-4">
      <div
        v-for="day in weekDays"
        :key="day.date"
        :class="[
          'day-card p-4 rounded-lg',
          day.isToday ? 'bg-green-50 border-2 border-green-500' : 'bg-white',
          day.isPast ? 'opacity-60' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium">{{ day.label }}</span>
          <span class="text-sm text-gray-500">{{ day.dateFormatted }}</span>
        </div>
        
        <!-- Meal Toggles for this day -->
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="meal in ['breakfast', 'lunch', 'dinner']"
            :key="meal"
            :class="[
              'meal-chip text-center py-2 px-3 rounded-lg text-sm',
              getMealStatus(day.date, meal) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
            ]"
          >
            {{ meal.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/resident/WeeklyPlanner.vue
// PURPOSE: Weekly meal planning view

interface DayInfo {
  date: string
  label: string
  dateFormatted: string
  isToday: boolean
  isPast: boolean
}

// State
const currentWeekStart = ref(new Date())

// Computed
const weekLabel = computed(() => {
  // TODO: Format week range label
  return 'This Week'
})

const weekDays = computed((): DayInfo[] => {
  // TODO: Generate 7 days starting from currentWeekStart
  const days: DayInfo[] = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    days.push({
      date: date.toISOString().split('T')[0],
      label: dayNames[date.getDay()],
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString()
    })
  }
  
  return days
})

// Methods
function previousWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

function nextWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

function getMealStatus(date: string, mealType: string): boolean {
  // TODO: Get actual meal status from composable/store
  // return useMeals().getMealStatus(date, mealType)
  return true // Placeholder: all meals enabled
}
</script>

<style scoped>
.day-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
