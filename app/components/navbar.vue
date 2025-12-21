<template>

    <nav class="flex justify-between items-center p-2">

        <!-- Only show hamburger menu on dashboard and resident pages -->
        <button v-if="showSidebarButton" 
                class="tapCircle"
                @click="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="32"
                 class=""
                 height="32"
                 viewBox="0 0 24 24">
                <path fill="none"
                      stroke="black"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12h18M3 18h18M3 6h18" />
            </svg>
        </button>
        <!-- Spacer when sidebar button is hidden to maintain layout -->
        <div v-else class="w-12"></div>

        <!-- Show login button for non-authenticated users -->
        <NuxtLink to="/login" v-if="!authUser"
                  class="greenBtn justify-self-end">Login</NuxtLink>

        <!-- Show Dashboard/Home link for authenticated users (hide if already on that page) -->
        <NuxtLink v-if="authUser && isAdmin && !route.path.startsWith('/dashboard')" to="/dashboard"
                  class="greenBtn justify-self-end">Dashboard</NuxtLink>
        <NuxtLink v-if="authUser && isResident && !route.path.startsWith('/resident')" to="/resident"
                  class="greenBtn justify-self-end">Home</NuxtLink>

        <!-- Admin Navigation: Show when admin is in dashboard/hostels pages -->
        <NuxtLink v-if="authUser && isAdmin && route.path.startsWith('/dashboard/hostels/')" 
                  :to="isOnHostelHome ? '/dashboard' : hostelHomeUrl"
                  class="greenBtn">
            {{ isOnHostelHome ? 'Dashboard' : 'Hostel Home' }}
        </NuxtLink>

        <!-- Resident Navigation: Show when resident is in resident pages -->
        <NuxtLink v-if="authUser && isResident && route.path.startsWith('/resident/')"
                  :to="isOnResidentHome ? '/resident' : '/resident'"
                  class="greenBtn">
            Open Homepage
        </NuxtLink>

    </nav>


</template>

<script lang="ts" setup>

const { toggleSidebar } = useSidebar();
const { isAdmin, isResident } = useCurrentUser();
const authUser = useSupabaseUser();
const route = useRoute();

const isOnHostelHome = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined;
    return hostelSlug && route.path === `/dashboard/hostels/${hostelSlug}`;
});

const hostelHomeUrl = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined;
    return hostelSlug ? `/dashboard/hostels/${hostelSlug}` : '/dashboard';
});

const isOnResidentHome = computed(() => {
    return route.path === '/resident';
});

// Only show sidebar button on dashboard and resident pages
const showSidebarButton = computed(() => {
    return route.path.startsWith('/dashboard') || route.path.startsWith('/resident');
});

</script>

<style></style>