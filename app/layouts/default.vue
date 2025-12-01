<!--
  FILE: app/layouts/default.vue
  PURPOSE: Default layout for the app - includes header, main content slot, and footer.
  TODO:
    - Include HeaderBar component
    - Add navigation for authenticated users
    - Include InstallPwaButton
-->
<template>
  <div class="layout-default min-h-screen flex flex-col">
    <!-- Header -->
    <HeaderBar />
    
    <!-- Main Content -->
    <main class="flex-1 container-app py-4">
      <slot />
    </main>
    
    <!-- Footer (minimal) -->
    <footer class="text-center text-sm text-gray-500 py-4">
      <p>Manav Boys Hostel © {{ currentYear }}</p>
    </footer>
    
    <!-- PWA Install Button -->
    <InstallPwaButton />
  </div>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/composables/usePwaInstall'

// FILE: app/layouts/default.vue
// PURPOSE: Default layout for all pages

const currentYear = new Date().getFullYear()

// Initialize PWA install prompt listener
onMounted(() => {
  const { initialize } = usePwaInstall()
  initialize()
})
</script>

<style scoped>
.layout-default {
  background-color: var(--color-background);
}
</style>
