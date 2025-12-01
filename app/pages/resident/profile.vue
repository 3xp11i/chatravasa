<!--
  FILE: app/pages/resident/profile.vue
  PURPOSE: Resident profile page - view and edit profile information.
  TODO:
    - Display ProfileForm component
    - Handle profile updates
    - Show logout option
-->
<template>
  <div class="profile-page">
    <h1 class="text-xl font-bold mb-6">My Profile</h1>
    
    <ProfileForm />
    
    <!-- Logout Section -->
    <div class="mt-8 pt-6 border-t">
      <LogoutButton class="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100" />
    </div>
    
    <!-- App Info -->
    <div class="mt-6 text-center text-sm text-gray-500">
      <p>Manav Boys Hostel Meals v1.0</p>
      <p>Need help? Contact the hostel owner.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/resident/profile.vue
// PURPOSE: Profile editing page

definePageMeta({
  layout: 'resident',
  middleware: ['role-resident'],
})
</script>
