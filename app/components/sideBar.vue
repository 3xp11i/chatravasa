<template>
    <!-- Backdrop overlay - follows sidebar position -->
    <Teleport to="body">
        <div v-if="showBackdrop"
             class="sideBar-backdrop"
             :style="{ opacity: backdropOpacity }"
             @click="close" />
    </Teleport>

    <!-- Sidebar - always rendered, controlled via transform -->
    <Teleport to="body">
        <div class="sideBar"
             ref="sideBarRef"
             :style="sidebarStyle">

            <div class="topSection flex flex-col items-center mt-8 px-4">
                <!-- <img :src="avatarUrl" -->
                <img src="@/assets/images/profile.jpg"
                     width="80"
                     height="80"
                     class="rounded-full"
                     alt="Profile picture" />

                <span class="mt-4 text-lg font-semibold">{{ fullName }}</span>
                <span class="text-sm text-gray-600">{{ userRole }}</span>
            </div>

            <hr>

            <div class="middleSection flex flex-col gap-4 mt-4 px-4">
                <NuxtLink to="/edit-profile" @click="close">Edit Profile</NuxtLink>
                <NuxtLink to="/dashboard/manage-hostels" @click="close">Manage Hostels</NuxtLink>
            </div>

            <div class="bottomSection flex flex-col gap-4 mt-auto mb-8 px-4">
                <NuxtLink to="/contact" @click="close">Contact Us</NuxtLink>
                <button class="bg-red-500 text-white" @click="close">Logout</button>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { useSwipeableSidebar } from '@/composables/useSwipeableSidebar';

const { sideBarOpen } = useSidebar();
const sideBarRef = useTemplateRef('sideBarRef');
const user = useSupabaseUser();
console.log(user.value);


const fullName = computed(() => {
    if (!user.value) return 'Guest';
    const metadata = user.value.user_metadata;
    return `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim() || 'User';
});

const userRole = computed(() => {
    if (!user.value) return 'Guest';
    return user.value.user_metadata?.is_admin ? 'Admin' : 'User';
});

const avatarUrl = computed(() => {
    return user.value?.user_metadata?.avatar || '@/assets/images/profile.jpg';
});

// Calculate sidebar width (50% of viewport, matching CSS)
const SIDEBAR_WIDTH = computed(() => {
    if (import.meta.client) {
        return window.innerWidth * 0.5;
    }
    return 200; // fallback for SSR
});

// Use swipeable sidebar composable
const {
    sidebarStyle,
    backdropOpacity,
    showBackdrop,
    close,
} = useSwipeableSidebar(sideBarRef, {
    sidebarWidth: SIDEBAR_WIDTH.value,
    edgeThreshold: 25,      // px from left edge to start swipe-to-open
    snapThreshold: 0.4,     // 40% threshold to snap open/close
    isOpen: sideBarOpen,    // sync with global state
});
</script>

<style>
.sideBar {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    background-color: var(--color-secondary);
    height: 100vh;
    width: 50%;
    z-index: 1000;
    touch-action: pan-y; /* Allow vertical scroll, capture horizontal */
    will-change: transform; /* Optimize for animations */
}

.sideBar-backdrop {
    position: fixed;
    inset: 0;
    background: black;
    z-index: 999;
    touch-action: none;
}
</style>