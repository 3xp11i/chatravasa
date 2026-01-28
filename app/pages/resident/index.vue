<template>
  <div class="text-text px-4 py-8">
    <div class="card">
      <h1 class="text-3xl font-bold mb-2" v-if="!detailsLoading">Namaste, {{ firstName || 'Resident' }}</h1>
      <div v-else class="h-10 bg-gray-200 rounded animate-shimmer mb-2"></div>
      <p class="text-text-muted mb-6" v-if="!detailsLoading">Room: {{ residentRoom || 'Not Assigned' }}</p>
      <div v-else class="h-6 bg-gray-200 rounded animate-shimmer mb-6 w-1/2"></div>

      <!-- In-Room Status Button -->
      <p class="text-xs text-text-muted mt-2 text-center">Tap to change in-room status</p>
      <div v-if="inRoomLoading" class="w-full mb-4 py-3 px-4 h-12 bg-gray-300 rounded-lg animate-shimmer"></div>
      <button
        v-else
        class="w-full mb-6 py-3 px-4 rounded-lg font-semibold transition-colors"
        :class="inRoom ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'"
        @click="handleToggleInRoom"
        :disabled="updatingStatus"
      >
        {{ updatingStatus ? 'Updating...' : (inRoom ? 'In-Room' : 'Out of Room') }}
      </button>

      <!-- Meals and Complaints Links -->
      <div class="space-y-3">
        <NuxtLink
          to="/resident/meals"
          class="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          Meals Planner
        </NuxtLink>
        <NuxtLink
          to="/resident/complaints"
          class="block w-full py-3 px-4 rounded-lg font-semibold text-center bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Complaints
        </NuxtLink>
      </div>

      <p v-if="fetchError" class="text-red-600 text-sm mt-4">{{ fetchError }}</p>
      <p v-if="statusError" class="text-red-600 text-sm mt-2">{{ statusError }}</p>
    </div>
  </div>
  </template>

<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  name: 'resident-home',
});

const {
  firstName,
  residentRoom,
  inRoom,
  loading,
  inRoomLoading,
  detailsLoading,
  error: fetchError,
  statusError,
  toggleInRoom,
} = useResidentData();

const updatingStatus = ref(false);

async function handleToggleInRoom() {
  updatingStatus.value = true;
  try {
    await toggleInRoom();
  } finally {
    updatingStatus.value = false;
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
</style>