<template>
    <div class="min-h-screen bg-background px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <!-- Admin View -->
            <div v-if="!isStaff">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('dashboardTitle') }}</h1>
                <p class="text-gray-600 mb-6">{{ t('dashboardSubtitle') }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NuxtLink to="/dashboard/manage-hostels" 
                              class="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20">
                                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900">{{ t('manageHostels') }}</h2>
                        </div>
                        <p class="text-sm text-gray-600">{{ t('manageHostelsDesc') }}</p>
                    </NuxtLink>
                </div>
            </div>

            <!-- Staff View -->
            <div v-else-if="staffContext.member && staffContext.role">
                <!-- Loading indicator for staff context -->
                <div v-if="staffLoading" class="text-center py-8">
                    <div class="inline-block">
                        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                    <p class="text-gray-600 mt-4">{{ t('loadingContext') }}</p>
                </div>

                <div v-else class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-1">{{ t('welcomeStaff', { name: staffContext.member.first_name }) }}</h1>
                    <p class="text-gray-600">{{ t('staffSubtitle') }}</p>
                </div>

                <div v-if="!staffLoading" class="grid grid-cols-1 gap-4">
                    <NuxtLink to="/dashboard/manage-hostels" class="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20">
                                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900">{{ t('manageHostels') }}</h2>
                        </div>
                        <p class="text-sm text-gray-600">{{ t('manageHostelsStaffDesc') }}</p>
                    </NuxtLink>
                </div>

                <!-- No Permission Message -->
                <div v-if="!canView('residents') && !canView('meals') && !canView('fees') && !canView('complaints')"
                     class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <p class="text-yellow-800">{{ t('noPermission') }}</p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-else class="text-center py-10">
                <p class="text-gray-600">{{ t('loadingDashboard') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
definePageMeta({
  layout: "default",
});

const route = useRoute();
const { staffContext, canView, canManage, isStaff, loading: staffLoading } = useStaffContext();

const currentHostelSlug = computed(() => {
  // Only return slug after loading is complete
  if (staffLoading.value) return '';
  
  // If staff, use their current hostel slug
  if (isStaff.value && staffContext.value.role?.hostel_slug) {
    return staffContext.value.role.hostel_slug;
  }
  return '';
});

const currentHostelName = computed(() => {
  if (staffContext.value.role) {
    return staffContext.value.role.title;
  }
  return '';
});
</script>