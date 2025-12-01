<!--
  FILE: app/pages/owner/index.vue
  PURPOSE: Owner dashboard - overview of hostel meal system.
  TODO:
    - Summary stats (total residents, today's meals, pending verifications)
    - Quick links to manage residents, view analytics
    - Recent activity
-->
<template>
  <div class="owner-dashboard">
    <h1 class="text-2xl font-bold mb-6">Owner Dashboard</h1>
    
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="card">
        <p class="text-sm text-gray-500">Total Residents</p>
        <p class="text-3xl font-bold text-primary">{{ stats.totalResidents }}</p>
      </div>
      
      <div class="card">
        <p class="text-sm text-gray-500">Today's Meals</p>
        <p class="text-3xl font-bold text-green-600">{{ stats.todayMeals }}</p>
      </div>
      
      <div class="card">
        <p class="text-sm text-gray-500">Pending Verifications</p>
        <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingVerifications }}</p>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 gap-4">
        <NuxtLink to="/owner/residents" class="card flex items-center gap-3 hover:shadow-md transition-shadow">
          <span class="text-2xl">👥</span>
          <span>Manage Residents</span>
        </NuxtLink>
        
        <NuxtLink to="/owner/analytics" class="card flex items-center gap-3 hover:shadow-md transition-shadow">
          <span class="text-2xl">📊</span>
          <span>View Analytics</span>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Today's Meal Stats -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">Today's Overview</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="card text-center">
          <span class="text-2xl">🍳</span>
          <p class="text-2xl font-bold">15</p>
          <p class="text-sm text-gray-500">Breakfast</p>
        </div>
        <div class="card text-center">
          <span class="text-2xl">🍛</span>
          <p class="text-2xl font-bold">18</p>
          <p class="text-sm text-gray-500">Lunch</p>
        </div>
        <div class="card text-center">
          <span class="text-2xl">🍽️</span>
          <p class="text-2xl font-bold">16</p>
          <p class="text-sm text-gray-500">Dinner</p>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity (placeholder) -->
    <div>
      <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
      <div class="card">
        <p class="text-gray-500 text-sm">No recent activity</p>
        <!-- TODO: Show recent meal changes, new registrations, etc. -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/owner/index.vue
// PURPOSE: Owner dashboard page

definePageMeta({
  layout: 'owner',
  middleware: ['role-owner'],
})

// Placeholder stats
const stats = reactive({
  totalResidents: 20,
  todayMeals: 49,
  pendingVerifications: 3,
})
</script>
