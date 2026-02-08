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

            <div class="topSection flex flex-col items-center mt-8 px-4 pb-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center overflow-hidden ring-4 ring-primary/20 shadow-lg">
                    <img v-if="avatarUrl"
                         :src="avatarUrl"
                         alt="Profile picture"
                         class="w-full h-full object-cover" />
                    <span v-else class="text-white text-3xl font-bold">{{ userInitials }}</span>
                </div>

                <span class="mt-4 text-xl font-bold text-gray-800">{{ fullName }}</span>
                <span class="text-sm text-gray-600 mt-1 px-3 py-1 bg-primary/10 rounded-full">{{ userRole }}</span>
            </div>

            <div class="border-t border-gray-200"></div>

            <div class="middleSection flex flex-col gap-2 mt-6 px-4">
                <NuxtLink to="/edit-profile" @click="close" class="sidebar-link">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    <span>{{ t('editProfile') }}</span>
                </NuxtLink>
                <NuxtLink v-if="isAdmin" to="/dashboard" @click="close" class="sidebar-link">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>{{ t('dashboard') }}</span>
                </NuxtLink>
                <NuxtLink v-if="!isAdmin" to="/resident" @click="close" class="sidebar-link">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>{{ t('home') }}</span>
                </NuxtLink>
            </div>

            <div class="bottomSection flex flex-col gap-2 mt-auto mb-8 px-4">
                <div class="border-t border-gray-200 mb-4"></div>

                <!-- Change Language Option -->

                <select @change="changeLocale" :value="locale" class="sidebar-link">
                    <option value="en">{{ t('english') }}</option>
                    <option value="hi">{{ t('hindi') }}</option>
                </select>
                <NuxtLink to="/settings"
                          @click="close"
                          class="sidebar-link">
                    <svg class="w-5 h-5"
                         fill="currentColor"
                         viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clip-rule="evenodd" />
                    </svg>
                    <span>{{ t('settings') }}</span>
                </NuxtLink>

                <NuxtLink to="/contact" @click="close" class="sidebar-link">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{{ t('contactUs') }}</span>
                </NuxtLink>
                <button class="sidebar-link-danger" @click="logout">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ t('logout') }}</span>
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { useSwipeableSidebar } from '@/composables/useSwipeableSidebar';
import defaultAvatar from '~/assets/images/profile.jpg';
import { useI18n } from 'vue-i18n';

const { locale, setLocale, t } = useI18n();

const { sideBarOpen } = useSidebar();
const sideBarRef = useTemplateRef('sideBarRef');
const { userProfile, isAdmin, isResident, userName, fetchUserProfile } = useCurrentUser();

onMounted(async () => {
    if (!userProfile.value) {
        await fetchUserProfile();
    }
    try {
        const res = await $fetch<{ name: string }>("/api/resident/me", { method: "GET" });
        displayName.value = res?.name || '';
    } catch (e) {
        displayName.value = '';
    }
});

const displayName = ref('');
const fullName = computed(() => displayName.value || userName.value || 'User');

const userRole = computed(() => {
    if (isAdmin.value) return t('admin');
    if (isResident.value) return t('resident');
    return t('guest');
});

const avatarUrl = computed(() => {
    return userProfile.value?.avatar || defaultAvatar;
});

const userInitials = computed(() => {
    const name = displayName.value || userName.value || '';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';
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
    sidebarWidth: SIDEBAR_WIDTH,  // Pass the computed ref, not .value
    edgeThreshold: 25,            // px from left edge to start swipe-to-open
    snapThreshold: 0.4,           // 40% threshold to snap open/close
    isOpen: sideBarOpen,          // sync with global state
});


const logout = async () => {
    const supabase = useSupabaseClient();
    await supabase.auth.signOut();
    close();
    // Optionally redirect to home or login page
    navigateTo('/');
};

const changeLocale = (event) => {
    setLocale(event.target.value);
    close();
};



</script>

<style>
.sideBar {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    background-color: white;
    height: 100vh;
    width: 50%;
    z-index: 1000;
    touch-action: pan-y; /* Allow vertical scroll, capture horizontal */
    will-change: transform; /* Optimize for animations */
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.5);
}

.sideBar-backdrop {
    position: fixed;
    inset: 0;
    background: black;
    z-index: 999;
    touch-action: none;
}

.sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s;
    text-decoration: none;
}

.sidebar-link:hover {
    background-color: #f3f4f6;
    color: var(--color-primary);
}

.sidebar-link svg {
    flex-shrink: 0;
}

.sidebar-link-danger {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    color: #dc2626;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
    cursor: pointer;
}

.sidebar-link-danger:hover {
    background-color: #fee2e2;
    border-color: #fca5a5;
}

.sidebar-link-danger svg {
    flex-shrink: 0;
}
</style>