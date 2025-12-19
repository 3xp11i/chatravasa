<template>
    <div class="flex flex-col justify-center items-center">

        <h1>Dashboard</h1>

        <NuxtLink to="/dashboard/manage-hostels" class="greenBtn">Manage Hostels</NuxtLink>

    </div>
</template>

<script lang="ts" setup>

// Layout
definePageMeta({
  layout: "default",
});


</script>

<style></style>