<template>
  <div class="mt-5 flex flex-col items-center min-h-screen">

    <h1 class="text-center">
      <span v-if="loading && !hostelName"
            class="inline-block animate-pulse rounded text-sm ">{{ t('loading') }}</span>
      <span v-else>{{ hostelName }} 🏡</span>
    </h1>

    <NuxtLink v-if="isAdmin" :to="`/dashboard/hostels/${hostelSlug}/edit-hostel`" class="greenBtn flex items-center active:text-white">
     <Icon name="material-symbols:edit" class="text-xl mr-1"></Icon> {{ t('editHostel') }}</NuxtLink>


    <div class="page_links_container w-full">

      <!-- Putting icons -->
            <NuxtLink v-if="isAdmin || canViewResidents" :to="`/dashboard/hostels/${hostelSlug}/manage-residents`"
                class="page_links">
        <Icon name="ic:baseline-people" class="text-2xl mr-2"></Icon>
        {{ t('residents') }}
      </NuxtLink>
            <NuxtLink v-if="isAdmin || canViewFees" :to="`/dashboard/hostels/${hostelSlug}/manage-fees`"
                class="page_links">
        <Icon name="material-symbols:currency-rupee" class="text-2xl mr-2"></Icon>
        {{ t('fees') }}
      </NuxtLink>
            <NuxtLink v-if="isAdmin || canViewComplaints" :to="`/dashboard/hostels/${hostelSlug}/manage-complaints`"
                class="page_links">
        <Icon name="material-symbols:problem" class="text-2xl mr-2"></Icon>
                {{ t('complaints') }}</NuxtLink>
            <NuxtLink v-if="isAdmin || canViewMeals" :to="`/dashboard/hostels/${hostelSlug}/manage-meals`"
                class="page_links">
        <Icon name="material-symbols:calendar-meal-2" class="text-2xl mr-2"></Icon>
            {{ t("meals") }}</NuxtLink>
            <NuxtLink v-if="isAdmin" :to="`/dashboard/hostels/${hostelSlug}/manage-staff`"
                class="page_links">
        <Icon name="streamline-plump:office-worker-solid" class="text-2xl mr-2"></Icon>
                {{ t('staff') }}</NuxtLink>
            <NuxtLink v-if="isAdmin" :to="`/dashboard/hostels/${hostelSlug}/manage-finances`"
                class="page_links">
        <Icon name="streamline-ultimate:accounting-calculator-1" class="text-2xl mr-2"></Icon>
                {{ t('finances') }}</NuxtLink>

    </div>

  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import type { Database } from '@/types/database.types';


type Hostel = Database['public']['Tables']['hostels']['Row'];

const route = useRoute();
const { isAdmin } = useCurrentUser();
const { canViewForHostel, activateHostelBySlug, fetchStaffContext, staffContext } = useStaffContext();
const hostelSlug = route.params.hostelslug as string;

// useAsyncData properly caches in SPA mode
const { data: hostelData, error, pending: loading } = useAsyncData(
  `hostel-${hostelSlug}`,
  () => $fetch<{ success: boolean; hostel: Hostel }>(`/api/manage-hostel/get-hostel-by-slug`, {
    query: { slug: hostelSlug }
  }),
  {
    getCachedData: (key) => useNuxtApp().payload.data[key] || useNuxtApp().static.data[key],
  }
);


const hostelName = computed(() => hostelData.value?.hostel?.hostel_name ?? '');

// Per-hostel view permissions (will be reactive once staffContext loads)
const canViewResidents = computed(() => canViewForHostel(hostelSlug, 'residents'));
const canViewMeals = computed(() => canViewForHostel(hostelSlug, 'meals'));
const canViewFees = computed(() => canViewForHostel(hostelSlug, 'fees'));
const canViewComplaints = computed(() => canViewForHostel(hostelSlug, 'complaints'));

onMounted(async () => {
  // Ensure staff context is loaded for permission checks
  await fetchStaffContext();
  activateHostelBySlug(hostelSlug);
});

</script>

<style scoped>
a {
  text-decoration: none;
}

a:active {}


.page_links_container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}


.page_links {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 1rem;
  padding: 2rem 1rem;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.746);
  font-size: 1rem;
  font-weight: 500;
}

.page_links:active {
  transition: .2s ease;
  transform: scale(0.95);
}


.page_links:nth-child(1) {
  background: linear-gradient(135deg, #ff9800, hsla(36, 100%, 68%, 0.8));
  /* border: 2px solid hsl(36, 100%, 75%); */
}

.page_links:nth-child(2) {
  background: linear-gradient(135deg, #2196F3, hsla(207, 100%, 73%, 0.8));
  border: 2px solid hsl(207, 100%, 75%);
}

.page_links:nth-child(3) {
  background: linear-gradient(135deg, #f44336, hsla(0, 77%, 70%, 0.8));
  border: 2px solid hsl(0, 77%, 75%);
}

.page_links:nth-child(4) {
  background: linear-gradient(135deg, #4CAF50, hsla(122, 61%, 66%, 0.8));
  border: 2px solid hsl(122, 61%, 75%);
}

.page_links:nth-child(5) {
  background: linear-gradient(135deg, #9C27B0, hsla(283, 100%, 71%, 0.8));
  border: 2px solid hsl(283, 100%, 75%);
}

.page_links:nth-child(6) {
  background: linear-gradient(135deg, #607D8B, hsla(200, 14%, 57%, 0.8));
  border: 2px solid hsl(200, 14%, 65%);
}
</style>