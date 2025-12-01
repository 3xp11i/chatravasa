<!--
  FILE: app/pages/owner/analytics.vue
  PURPOSE: Owner analytics page - meal statistics and reports.
  TODO:
    - Date range selector
    - Meal count charts/graphs
    - Cost estimates (if applicable)
    - Export data options
-->
<template>
  <div class="analytics-page">
    <h1 class="text-2xl font-bold mb-6">Analytics</h1>
    
    <!-- Date Range Selector -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-3">Date Range</h2>
      <div class="flex gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">From</label>
          <input
            v-model="dateRange.from"
            type="date"
            class="px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">To</label>
          <input
            v-model="dateRange.to"
            type="date"
            class="px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          @click="fetchAnalytics"
          class="self-end bg-primary text-white px-4 py-2 rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-500">Total Meals Served</p>
        <p class="text-2xl font-bold">{{ analytics.totalMeals }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">Avg. Daily Breakfast</p>
        <p class="text-2xl font-bold">{{ analytics.avgBreakfast }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">Avg. Daily Lunch</p>
        <p class="text-2xl font-bold">{{ analytics.avgLunch }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">Avg. Daily Dinner</p>
        <p class="text-2xl font-bold">{{ analytics.avgDinner }}</p>
      </div>
    </div>
    
    <!-- Daily Breakdown (placeholder table) -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Daily Breakdown</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Date</th>
              <th class="text-center py-2">Breakfast</th>
              <th class="text-center py-2">Lunch</th>
              <th class="text-center py-2">Dinner</th>
              <th class="text-center py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in dailyData" :key="day.date" class="border-b">
              <td class="py-2">{{ day.date }}</td>
              <td class="text-center">{{ day.breakfast }}</td>
              <td class="text-center">{{ day.lunch }}</td>
              <td class="text-center">{{ day.dinner }}</td>
              <td class="text-center font-medium">{{ day.breakfast + day.lunch + day.dinner }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Export Options -->
    <div class="card">
      <h2 class="text-lg font-semibold mb-3">Export Data</h2>
      <div class="flex gap-4">
        <button class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
          📄 Export CSV
        </button>
        <button class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
          📊 Export PDF
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-2">
        TODO: Implement export functionality
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/owner/analytics.vue
// PURPOSE: Analytics and reporting page

definePageMeta({
  layout: 'owner',
  middleware: ['role-owner'],
})

// Date range
const dateRange = reactive({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
})

// Placeholder analytics
const analytics = reactive({
  totalMeals: 350,
  avgBreakfast: 15,
  avgLunch: 18,
  avgDinner: 17,
})

// Placeholder daily data
const dailyData = ref([
  { date: '2024-12-01', breakfast: 15, lunch: 18, dinner: 16 },
  { date: '2024-11-30', breakfast: 14, lunch: 17, dinner: 15 },
  { date: '2024-11-29', breakfast: 16, lunch: 19, dinner: 18 },
  { date: '2024-11-28', breakfast: 15, lunch: 18, dinner: 17 },
  { date: '2024-11-27', breakfast: 14, lunch: 17, dinner: 16 },
])

// Methods
function fetchAnalytics() {
  console.log('TODO: Fetch analytics for range:', dateRange)
  // TODO: Call API with date range
}
</script>
