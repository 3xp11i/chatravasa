<!--
  FILE: app/components/cook/MealStatsCard.vue
  PURPOSE: Display aggregated meal count for a specific meal (breakfast/lunch/dinner).
  TODO:
    - Accept props: mealType, count, date
    - Show big number prominently
    - Optional: show trend compared to yesterday
-->
<template>
  <div class="meal-stats-card card">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-3xl">{{ mealIcon }}</span>
      <h3 class="text-lg font-medium">{{ mealLabel }}</h3>
    </div>
    
    <!-- Big Number -->
    <p class="stat-number text-primary">{{ count }}</p>
    <p class="text-sm text-gray-500">residents eating</p>
    
    <!-- Optional: Trend indicator -->
    <div v-if="trend !== 0" class="mt-2 text-sm">
      <span :class="trend > 0 ? 'text-green-600' : 'text-red-600'">
        {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }} from yesterday
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/cook/MealStatsCard.vue
// PURPOSE: Display meal statistics for cook dashboard

interface Props {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  count: number
  trend?: number // Change from yesterday (positive or negative)
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  trend: 0
})

// Computed
const mealIcon = computed(() => {
  const icons = {
    breakfast: '🍳',
    lunch: '🍛',
    dinner: '🍽️'
  }
  return icons[props.mealType]
})

const mealLabel = computed(() => {
  return props.mealType.charAt(0).toUpperCase() + props.mealType.slice(1)
})
</script>

<style scoped>
.meal-stats-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-number {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  margin: 0.5rem 0;
}
</style>
