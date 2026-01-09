<template>

    <nav class="flex justify-between items-center p-2">

        <!-- Only show hamburger menu on dashboard and resident pages -->
        <button v-if="showSidebarButton" 
                class="tapCircle"
                @click="toggleSidebar">
            <Icon name="material-symbols:menu-rounded" class="text-3xl text-gray-800" />
        </button>
        <!-- Show logo on root page -->
        <img v-else-if="isRootPage" 
             src="/pwa-192x192.png" 
             alt="Chatravasa Logo" 
             class="w-12 h-12 object-contain" />
        <!-- Show back button on edit-profile page -->
        <button v-else-if="isEditProfilePage"
                class="tapCircle"
                @click="navigateBack">
            <Icon name="material-symbols:arrow-back-rounded" class="text-3xl text-gray-800" />
        </button>
        <!-- Spacer when sidebar button is hidden to maintain layout -->
        <div v-else class="w-12"></div>

        <!-- Show login button for non-authenticated users -->
        <NuxtLink to="/login" v-if="!authUser"
                  class="greenBtn justify-self-end">{{ t('login') }}</NuxtLink>

        <!-- Show Dashboard/Home link for authenticated users (hide if already on that page) -->
        <!-- <NuxtLink v-if="authUser && isAdmin && !route.path.startsWith('/dashboard')" to="/dashboard"
                  class="greenBtn justify-self-end">Dashboard</NuxtLink> -->
        <NuxtLink v-if="authUser && isResident && !route.path.startsWith('/resident')" to="/resident"
                  class="greenBtn justify-self-end">{{ t('home') }}</NuxtLink>

        <!-- Admin Navigation: Show when admin is in dashboard/hostels pages -->
        <NuxtLink v-if="authUser && isAdmin && route.path.startsWith('/dashboard/hostels/')" 
                  :to="isOnHostelHome ? '/dashboard' : hostelHomeUrl"
                  class="greenBtn flex items-center">
                  <Icon :name="isOnHostelHome ? 'material-symbols:team-dashboard' : 'material-symbols:home'" class="text-xl mr-1"></Icon>
            {{ isOnHostelHome ? t('dashboard') : t('hostelHome') }}
        </NuxtLink>

        <!-- Resident Navigation: Show when resident is in resident pages -->
        <NuxtLink v-if="authUser && isResident && route.path.startsWith('/resident/')"
                  :to="isOnResidentHome ? '/resident' : '/resident'"
                  class="greenBtn">
            {{ t('openHomepage') }}
        </NuxtLink>

    </nav>


</template>

<script lang="ts" setup>

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

// Check if current page is root
const isRootPage = computed(() => {
    return route.path === '/';
});

// Check if current page is edit-profile
const isEditProfilePage = computed(() => {
    return route.path === '/edit-profile';
});

// Navigate back based on user role
const navigateBack = () => {
    if (isAdmin.value) {
        navigateTo('/dashboard');
    } else if (isResident.value) {
        navigateTo('/resident');
    } else {
        navigateTo('/');
    }
};

</script>

<style></style>