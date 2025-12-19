
<template>
  <div>
    <!-- Accessibility: announces route changes to screen readers -->
    <ClientOnly>
      <NuxtRouteAnnouncer />
    </ClientOnly>
    
    <!-- Pages with their layouts render here -->
    <NuxtLayout />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">

</script>
