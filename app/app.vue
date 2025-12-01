<!--
  FILE: app/app.vue
  PURPOSE: Root application component. Renders the current page via <NuxtPage />.
  NOTE: Global layout/header is handled via layouts (app/layouts/).
        This file is minimal - just the page router outlet.
  TODO: Add global error boundary or loading states if needed.
-->
<template>
  <div>
    <!-- Accessibility: announces route changes to screen readers -->
    <NuxtRouteAnnouncer />
    
    <!-- Main layout wrapper - layouts are defined in app/layouts/ -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// FILE: app/app.vue
// Global app-level setup can go here (e.g., global event listeners, analytics init)
// Most logic should live in composables or layouts.
</script>
