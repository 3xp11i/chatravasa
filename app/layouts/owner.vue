<!--
  FILE: app/layouts/owner.vue
  PURPOSE: Layout for owner/admin role - includes sidebar or enhanced navigation.
  TODO:
    - Admin navigation (residents, analytics, settings)
    - Sidebar or header with all admin options
    - Quick actions
-->
<template>
  <div class="layout-owner min-h-screen flex flex-col lg:flex-row bg-gray-100">
    <!-- Sidebar (desktop) / Bottom nav (mobile) -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 bg-gray-800 text-white">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-700">
        <h1 class="text-xl font-bold">🍽️ Manav Meals</h1>
        <p class="text-sm text-gray-400">Admin Panel</p>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/owner"
              class="nav-link block px-4 py-2 rounded hover:bg-gray-700"
              :class="{ 'bg-gray-700': $route.path === '/owner' }"
            >
              📊 Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/owner/residents"
              class="nav-link block px-4 py-2 rounded hover:bg-gray-700"
              :class="{ 'bg-gray-700': $route.path === '/owner/residents' }"
            >
              👥 Residents
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/owner/analytics"
              class="nav-link block px-4 py-2 rounded hover:bg-gray-700"
              :class="{ 'bg-gray-700': $route.path === '/owner/analytics' }"
            >
              📈 Analytics
            </NuxtLink>
          </li>
        </ul>
      </nav>
      
      <!-- User / Logout -->
      <div class="p-4 border-t border-gray-700">
        <p class="text-sm text-gray-400 mb-2">Logged in as Owner</p>
        <LogoutButton class="text-red-400 hover:text-red-300" />
      </div>
    </aside>
    
    <!-- Mobile Header -->
    <header class="lg:hidden bg-gray-800 text-white p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold">🍽️ Admin</h1>
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-2xl">
          ☰
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <nav v-if="mobileMenuOpen" class="mt-4 space-y-2">
        <NuxtLink to="/owner" class="block py-2" @click="mobileMenuOpen = false">
          📊 Dashboard
        </NuxtLink>
        <NuxtLink to="/owner/residents" class="block py-2" @click="mobileMenuOpen = false">
          👥 Residents
        </NuxtLink>
        <NuxtLink to="/owner/analytics" class="block py-2" @click="mobileMenuOpen = false">
          📈 Analytics
        </NuxtLink>
        <hr class="border-gray-600" />
        <LogoutButton class="text-red-400" />
      </nav>
    </header>
    
    <!-- Main Content -->
    <main class="flex-1 p-4 lg:p-8 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// FILE: app/layouts/owner.vue
// PURPOSE: Owner/admin layout with sidebar navigation

const mobileMenuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  transition: background-color 0.2s;
}
</style>
