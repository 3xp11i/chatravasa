
<template>
  <div>
    <!-- Loading indicator for page transitions -->
    <NuxtLoadingIndicator color="#16a34a" />
    
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

console.log(useSupabaseUser().value);


</script>
