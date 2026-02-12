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
        <button v-else-if="isEditProfilePage || isSettingsPage"
                class="tapCircle"
                @click="navigateBack">
            <Icon name="material-symbols:arrow-back-rounded" class="text-3xl text-gray-800" />
        </button>
        <!-- Spacer when sidebar button is hidden to maintain layout -->
        <div v-else class="w-12"></div>

        <!-- Right side actions -->
        <div class="flex items-center gap-2">
            <!-- Reload Button -->
            <button 
                @click="reloadPage"
                class="tapCircle"
                :title="t('reload')"
            >
                <Icon name="material-symbols:refresh" class="text-2xl text-gray-800" />
            </button>

            <!-- Notifications Button - shown for all authenticated users on dashboard/resident pages -->
            <button 
                v-if="authUser && showNotificationButton"
                @click="toggleNotificationsModal"
                class="tapCircle relative"
            >
                <Icon name="material-symbols:notifications-outline" class="text-2xl text-gray-800" />
                <!-- Unread badge -->
                <span 
                    v-if="unreadCount > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                    {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
            </button>

            <!-- Show login button for non-authenticated users -->
            <NuxtLink to="/login" v-if="!authUser"
                      class="greenBtn justify-self-end">{{ t('login') }}</NuxtLink>

            <!-- Show Home link for resident when not on resident home -->
            <NuxtLink v-if="authUser && isResident && !route.path.startsWith('/resident')" to="/resident"
                      class="greenBtn justify-self-end">{{ t('home') }}</NuxtLink>

            <!-- Admin Navigation: Show when admin is in hostel subpages -->
            <NuxtLink v-if="authUser && isAdmin && route.path.startsWith('/dashboard/hostels/') && !isOnHostelHome" 
                      :to="hostelHomeUrl"
                      class="greenBtn flex items-center">
                      <Icon name="material-symbols:home" class="text-xl mr-1"></Icon>
                {{ t('hostelHome') }}
            </NuxtLink>
        </div>

    </nav>

    <!-- Notifications Modal -->
    <NotificationsModal 
        v-if="showNotificationsModal" 
        :on-close="() => showNotificationsModal = false" 
    />

</template>

<script lang="ts" setup>

import { useI18n } from 'vue-i18n';
import NotificationsModal from '~/components/modals/NotificationsModal.vue';

const { t } = useI18n();

const { toggleSidebar } = useSidebar();
const { isAdmin, isResident } = useCurrentUser();
const { unreadCount } = useNotifications();
const authUser = useSupabaseUser();
const route = useRoute();

// State for notifications modal
const showNotificationsModal = ref(false);

/**
 * Toggle notifications modal visibility
 */
const toggleNotificationsModal = () => {
    showNotificationsModal.value = !showNotificationsModal.value;
};

const isOnHostelHome = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined;
    return hostelSlug && route.path === `/dashboard/hostels/${hostelSlug}`;
});

const hostelHomeUrl = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined;
    return hostelSlug ? `/dashboard/hostels/${hostelSlug}` : '/dashboard';
});

// Only show sidebar button on dashboard and resident pages
const showSidebarButton = computed(() => {
    return route.path.startsWith('/dashboard') || route.path.startsWith('/resident');
});

// Show notification button on authenticated pages (dashboard, resident, settings)
const showNotificationButton = computed(() => {
    return route.path.startsWith('/dashboard') || 
           route.path.startsWith('/resident') ||
           route.path.startsWith('/settings');
});

// Check if current page is root
const isRootPage = computed(() => {
    return route.path === '/';
});

// Check if current page is edit-profile
const isEditProfilePage = computed(() => {
    return route.path === '/edit-profile';
});

// Check if current page is settings
const isSettingsPage = computed(() => {
    return route.path.startsWith('/settings');
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

// Reload the current page
const reloadPage = () => {
    window.location.reload();
};

</script>

<style></style>