<!--
  FILE: app/pages/cook/index.vue
  PURPOSE: Cook dashboard - display aggregated meal counts for today.
  TODO:
    - Show big numbers for each meal count
    - Auto-refresh or manual refresh
    - Simple, glanceable UI
-->
<template>
  <div class="cook-dashboard">
    <!-- Stats Cards -->
    <div class="space-y-4">
      <MealStatsCard
        meal-type="breakfast"
        :count="stats.breakfast"
        :trend="0"
      />
      
      <MealStatsCard
        meal-type="lunch"
        :count="stats.lunch"
        :trend="2"
      />
      
      <MealStatsCard
        meal-type="dinner"
        :count="stats.dinner"
        :trend="-1"
      />
    </div>
    
    <!-- Refresh Button -->
    <button
      @click="refreshStats"
      :disabled="isLoading"
      class="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
    >
      {{ isLoading ? 'Refreshing...' : '🔄 Refresh Counts' }}
    </button>
    
    <!-- Last Updated -->
    <p class="text-center text-sm text-green-700 mt-4">
      Last updated: {{ lastUpdated }}
    </p>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/cook/index.vue
// PURPOSE: Cook dashboard with meal counts

definePageMeta({
  layout: 'cook',
  middleware: ['role-cook'],
})

// State
const stats = reactive({
  breakfast: 15,
  lunch: 18,
  dinner: 16,
})

const isLoading = ref(false)
const lastUpdated = ref(new Date().toLocaleTimeString())

// Methods
async function refreshStats() {
  isLoading.value = true
  
  try {
    // TODO: Fetch stats from API
    // const data = await useMeals().getStats(today)
    // Object.assign(stats, data)
    
    console.log('TODO: Fetch meal stats from API')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    lastUpdated.value = new Date().toLocaleTimeString()
    
  } catch (err) {
    console.error('Failed to refresh stats:', err)
  } finally {
    isLoading.value = false
  }
}

// Auto-refresh every 5 minutes
onMounted(() => {
  const interval = setInterval(refreshStats, 5 * 60 * 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>
