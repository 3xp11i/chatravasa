<template>
  <div class="mt-5 flex flex-col justify-center items-center">

    <h1 class="text-center">
      <span v-if="loading && !hostelName" class="inline-block animate-pulse rounded text-sm ">Loading...</span>
      <span v-else>{{ hostelName }}</span>
    </h1>
    <NuxtLink class="greenBtn active:text-white">Edit Hostel</NuxtLink>


    <div class="page_links_container w-full">


      <NuxtLink :to="`/dashboard/hostels/${hostelSlug}/manage-residents`"
                class="page_links">Residents</NuxtLink>
      <NuxtLink :to="`/dashboard/hostels/${hostelSlug}/manage-fees`"
                class="page_links">Fees</NuxtLink>
      <NuxtLink :to="`/dashboard/hostels/${hostelSlug}/manage-complaints`"
                class="page_links">Complaints</NuxtLink>
      <NuxtLink :to="`/dashboard/hostels/${hostelSlug}/manage-meals`"
                class="page_links">Meals</NuxtLink>

    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Database } from '@/types/database.types';

type Hostel = Database['public']['Tables']['hostels']['Row'];

const route = useRoute();
const hostelSlug = route.params.hostelslug as string;

const { data: hostelData, error, pending: loading } = useAsyncData(
  `hostel-${hostelSlug}`,
  () => $fetch<{ success: boolean; hostel: Hostel }>(`/api/manage-hostel/get-hostel-by-slug`, {
    query: { slug: hostelSlug }
  }),
  {
    getCachedData: (key) => useNuxtApp().payload.data[key] || useNuxtApp().static.data[key],
  }
);

const hostelName = computed(() => (hostelData.value as any)?.hostel?.hostel_name ?? '');

</script>

<style scoped>


a{
  text-decoration: none;
}
a:active{
}


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
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.746);
  font-size: 1rem;
  font-weight: 500;
}
.page_links:active {
  transition: .2s ease;
  transform: scale(0.95);
}


.page_links:nth-child(1) {
  background: linear-gradient(135deg, #ff9800, #ffbd5b);
}

.page_links:nth-child(2) {
  background: linear-gradient(135deg, #2196F3, #74c0ff);
}

.page_links:nth-child(3) {
  background: linear-gradient(135deg, #f44336, #ed7676);
}

.page_links:nth-child(4) {
  background: linear-gradient(135deg, #4CAF50, #74dd78);
}
</style>