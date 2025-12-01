<!--
  FILE: app/layouts/cook.vue
  PURPOSE: Layout for cook role - minimal, focused on meal counts display.
  TODO:
    - Simple header with date
    - Large content area for stats
    - Logout option
-->
<template>
  <div class="layout-cook min-h-screen flex flex-col bg-green-50">
    <!-- Header -->
    <header class="bg-green-600 text-white shadow-md">
      <div class="container-app flex items-center justify-between py-4">
        <div>
          <h1 class="text-xl font-bold">Cook Dashboard</h1>
          <p class="text-sm text-green-100">{{ formattedDate }}</p>
        </div>
        
        <LogoutButton class="text-white hover:text-green-200" />
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="flex-1 container-app py-6">
      <slot />
    </main>
    
    <!-- Simple Footer -->
    <footer class="text-center text-sm text-green-700 py-4">
      <p>Tap numbers to refresh</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// FILE: app/layouts/cook.vue
// PURPOSE: Cook-specific layout - minimal and focused

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.layout-cook {
  /* Cook layout has a distinct green theme */
  min-height: 100vh;
}
</style>
