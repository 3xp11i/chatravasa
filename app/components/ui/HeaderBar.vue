<!--
  FILE: app/components/ui/HeaderBar.vue
  PURPOSE: Global header/navigation bar for the app.
  TODO:
    - Show app title/logo
    - Show current user info (name, avatar)
    - Navigation links based on role
    - Logout button
-->
<template>
  <header class="header-bar bg-white shadow-sm sticky top-0 z-50">
    <div class="container-app flex items-center justify-between py-3">
      <!-- Logo/Title -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-xl">🍽️</span>
        <span class="font-semibold text-primary">Manav Meals</span>
      </NuxtLink>
      
      <!-- User Menu (when logged in) -->
      <div v-if="isLoggedIn" class="flex items-center gap-3">
        <span class="text-sm text-gray-600">{{ userName }}</span>
        <button
          @click="toggleMenu"
          class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
        >
          {{ userInitial }}
        </button>
        
        <!-- Dropdown Menu -->
        <div
          v-if="menuOpen"
          class="absolute top-14 right-4 bg-white shadow-lg rounded-lg py-2 min-w-[150px]"
        >
          <NuxtLink
            to="/resident/profile"
            class="block px-4 py-2 hover:bg-gray-50"
            @click="menuOpen = false"
          >
            Profile
          </NuxtLink>
          <hr class="my-1" />
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <!-- Login Link (when not logged in) -->
      <NuxtLink v-else to="/login" class="text-primary font-medium">
        Login
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
// FILE: app/components/ui/HeaderBar.vue
// PURPOSE: Global header component

const router = useRouter()

// State
const menuOpen = ref(false)

// TODO: Get these from useAuth composable
const isLoggedIn = ref(false)
const userName = ref('John Doe')
const userInitial = computed(() => userName.value?.charAt(0) || '?')

// Methods
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

async function handleLogout() {
  menuOpen.value = false
  // TODO: Call useAuth().logout()
  console.log('TODO: Implement logout')
  await router.push('/login')
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.header-bar')) {
      menuOpen.value = false
    }
  })
})
</script>

<style scoped>
.header-bar {
  border-bottom: 1px solid #e5e7eb;
}
</style>
