<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="card w-full text-center">
      <h1 class="text-3xl font-bold text-text mb-4">Contact Us</h1>
      <p class="text-text-muted mb-6">
        We'd love to hear from you! Get in touch with us for any questions or support.
      </p>
      <div class="space-y-4 text-left">
        <div>
          <h3 class="font-semibold text-text mb-1">Email</h3>
          <p class="text-text-muted">support@chatravasa.com</p>
        </div>
        <div>
          <h3 class="font-semibold text-text mb-1">Phone</h3>
          <p class="text-text-muted">+91 XXX XXX XXXX</p>
        </div>
      </div>
      <NuxtLink 
        to="/"
        class="mt-8 inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md transition-all"
      >
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>


definePageMeta({
  layout: "public"
});


</script>

<style>

</style>