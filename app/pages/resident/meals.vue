<!--
  FILE: app/pages/resident/meals.vue
  PURPOSE: Daily meal toggle UI - focused view for toggling today's meals.
  TODO:
    - Large, easy-to-tap toggles for each meal
    - Show cutoff times prominently
    - Indicate if a meal is past cutoff
-->
<template>
  <div class="meals-page">
    <h1 class="text-xl font-bold mb-2">Today's Meals</h1>
    <p class="text-gray-600 mb-6">{{ formattedDate }}</p>
    
    <!-- Meal Cards -->
    <div class="space-y-4">
      <!-- Breakfast -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-3xl">🍳</span>
            <h2 class="text-lg font-semibold mt-2">Breakfast</h2>
            <p class="text-sm text-gray-500">Cutoff: 7:00 AM</p>
          </div>
          <button
            @click="toggleMeal('breakfast')"
            :disabled="isPastCutoff('breakfast')"
            :class="[
              'w-20 h-20 rounded-full text-2xl font-bold transition-all',
              meals.breakfast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600',
              isPastCutoff('breakfast') ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            ]"
          >
            {{ meals.breakfast ? '✓' : '✗' }}
          </button>
        </div>
      </div>
      
      <!-- Lunch -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-3xl">🍛</span>
            <h2 class="text-lg font-semibold mt-2">Lunch</h2>
            <p class="text-sm text-gray-500">Cutoff: 11:00 AM</p>
          </div>
          <button
            @click="toggleMeal('lunch')"
            :disabled="isPastCutoff('lunch')"
            :class="[
              'w-20 h-20 rounded-full text-2xl font-bold transition-all',
              meals.lunch ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600',
              isPastCutoff('lunch') ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            ]"
          >
            {{ meals.lunch ? '✓' : '✗' }}
          </button>
        </div>
      </div>
      
      <!-- Dinner -->
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-3xl">🍽️</span>
            <h2 class="text-lg font-semibold mt-2">Dinner</h2>
            <p class="text-sm text-gray-500">Cutoff: 6:00 PM</p>
          </div>
          <button
            @click="toggleMeal('dinner')"
            :disabled="isPastCutoff('dinner')"
            :class="[
              'w-20 h-20 rounded-full text-2xl font-bold transition-all',
              meals.dinner ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600',
              isPastCutoff('dinner') ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            ]"
          >
            {{ meals.dinner ? '✓' : '✗' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Help text -->
    <p class="text-center text-sm text-gray-500 mt-6">
      Tap the button to toggle meal on/off.<br />
      You cannot change meals after cutoff time.
    </p>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/resident/meals.vue
// PURPOSE: Daily meal toggle page

definePageMeta({
  layout: 'resident',
  middleware: ['role-resident'],
})

// State
const meals = reactive({
  breakfast: true,
  lunch: true,
  dinner: true,
})

// Date
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

// Methods
function toggleMeal(mealType: 'breakfast' | 'lunch' | 'dinner') {
  if (isPastCutoff(mealType)) return
  
  meals[mealType] = !meals[mealType]
  
  // TODO: Call API to update
  console.log(`TODO: Update ${mealType} to ${meals[mealType]}`)
}

function isPastCutoff(mealType: 'breakfast' | 'lunch' | 'dinner'): boolean {
  // TODO: Implement actual cutoff logic using useMeals
  // return useMeals().isPastCutoff(today, mealType)
  
  const now = new Date()
  const hour = now.getHours()
  
  switch (mealType) {
    case 'breakfast': return hour >= 7
    case 'lunch': return hour >= 11
    case 'dinner': return hour >= 18
    default: return false
  }
}
</script>
