<!--
  FILE: app/layouts/resident.vue
  PURPOSE: Layout for resident role pages - simplified navigation for residents.
  TODO:
    - Show resident-specific navigation (meals, profile)
    - Different header style if needed
-->
<template>
  <div class="layout-resident min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-primary text-white shadow-md sticky top-0 z-50">
      <div class="container-app flex items-center justify-between py-3">
        <NuxtLink to="/resident" class="flex items-center gap-2">
          <span class="text-xl">🍽️</span>
          <span class="font-semibold">My Meals</span>
        </NuxtLink>
        
        <NuxtLink to="/resident/profile" class="text-white">
          Profile
        </NuxtLink>
      </div>
    </header>
    
    <!-- Bottom Navigation (mobile-friendly) -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div class="container-app flex justify-around py-2">
        <NuxtLink
          to="/resident"
          class="nav-item flex flex-col items-center text-xs"
          :class="{ 'text-primary': $route.path === '/resident' }"
        >
          <span class="text-xl">🏠</span>
          <span>Home</span>
        </NuxtLink>
        
        <NuxtLink
          to="/resident/meals"
          class="nav-item flex flex-col items-center text-xs"
          :class="{ 'text-primary': $route.path === '/resident/meals' }"
        >
          <span class="text-xl">🍛</span>
          <span>Today</span>
        </NuxtLink>
        
        <NuxtLink
          to="/resident/weekly-plan"
          class="nav-item flex flex-col items-center text-xs"
          :class="{ 'text-primary': $route.path === '/resident/weekly-plan' }"
        >
          <span class="text-xl">📅</span>
          <span>Week</span>
        </NuxtLink>
        
        <NuxtLink
          to="/resident/profile"
          class="nav-item flex flex-col items-center text-xs"
          :class="{ 'text-primary': $route.path === '/resident/profile' }"
        >
          <span class="text-xl">👤</span>
          <span>Profile</span>
        </NuxtLink>
      </div>
    </nav>
    
    <!-- Main Content (with bottom padding for nav) -->
    <main class="flex-1 container-app py-4 pb-20">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// FILE: app/layouts/resident.vue
// PURPOSE: Resident-specific layout with bottom navigation
</script>

<style scoped>
.nav-item {
  padding: 0.5rem;
  color: #666;
  transition: color 0.2s;
}
.nav-item.text-primary {
  color: var(--color-primary);
}
</style>
