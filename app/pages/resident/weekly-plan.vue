<!--
  FILE: app/pages/resident/weekly-plan.vue
  PURPOSE: Weekly meal planning view - see and edit meals for the week.
  TODO:
    - Display WeeklyPlanner component
    - Allow navigation between weeks
    - Save changes to backend
-->
<template>
  <div class="weekly-plan-page">
    <h1 class="text-xl font-bold mb-4">Weekly Meal Plan</h1>
    
    <WeeklyPlanner />
    
    <!-- Legend -->
    <div class="mt-6 p-4 bg-gray-100 rounded-lg">
      <p class="text-sm font-medium mb-2">Legend:</p>
      <div class="flex gap-4 text-sm">
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-green-100 rounded"></span> Eating
        </span>
        <span class="flex items-center gap-1">
          <span class="w-4 h-4 bg-gray-100 rounded"></span> Skipping
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/resident/weekly-plan.vue
// PURPOSE: Weekly meal planning page

definePageMeta({
  layout: 'resident',
  middleware: ['role-resident'],
})
</script>
