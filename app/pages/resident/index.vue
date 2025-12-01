<!--
  FILE: app/pages/resident/index.vue
  PURPOSE: Resident main dashboard - quick overview of today's meals and actions.
  TODO:
    - Show today's meal status (breakfast/lunch/dinner)
    - Quick toggles for today's meals
    - Link to weekly planner
    - Show user greeting
-->
<template>
  <div class="resident-dashboard">
    <!-- Greeting -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Good {{ timeOfDay }}, {{ userName }}! 👋</h1>
      <p class="text-gray-600">{{ formattedDate }}</p>
    </div>
    
    <!-- Today's Meals Card -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Today's Meals</h2>
      
      <div class="space-y-3">
        <MealToggle
          meal-type="breakfast"
          :date="today"
          :initial-value="true"
          @toggle="handleToggle('breakfast', $event)"
        />
        <MealToggle
          meal-type="lunch"
          :date="today"
          :initial-value="true"
          @toggle="handleToggle('lunch', $event)"
        />
        <MealToggle
          meal-type="dinner"
          :date="today"
          :initial-value="true"
          @toggle="handleToggle('dinner', $event)"
        />
      </div>
    </div>
    
    <!-- Quick Links -->
    <div class="grid grid-cols-2 gap-4">
      <NuxtLink to="/resident/weekly-plan" class="card text-center py-4 hover:shadow-md transition-shadow">
        <span class="text-2xl mb-2 block">📅</span>
        <span class="text-sm font-medium">Weekly Plan</span>
      </NuxtLink>
      
      <NuxtLink to="/resident/profile" class="card text-center py-4 hover:shadow-md transition-shadow">
        <span class="text-2xl mb-2 block">👤</span>
        <span class="text-sm font-medium">My Profile</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/resident/index.vue
// PURPOSE: Resident dashboard page

definePageMeta({
  layout: 'resident',
  middleware: ['role-resident'],
})

// TODO: Get from useAuth
const userName = ref('Resident')

// Date helpers
const today = computed(() => new Date().toISOString().split('T')[0])

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
})

// Methods
function handleToggle(mealType: string, enabled: boolean) {
  console.log(`TODO: Toggle ${mealType} to ${enabled}`)
  // TODO: Call useMeals().toggleMeal(today.value, mealType, enabled)
}
</script>
