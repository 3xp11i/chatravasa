import { defineStore } from 'pinia';

interface ResidentData {
  name: string;
  room: string;
  hasProfile: boolean;
  hasResident: boolean;
}

interface InRoomStatus {
  success: boolean;
  inRoom: boolean;
}

export const useResidentStore = defineStore('resident', () => {
  // State
  const residentData = ref<ResidentData | null>(null);
  const inRoomStatus = ref<boolean>(false);
  const loading = ref(false);
  const inRoomLoading = ref(false);
  const error = ref('');
  const statusError = ref('');
  const isInitialized = ref(false);

  // Fetch resident profile data
  async function fetchResidentData() {
    if (isInitialized.value && residentData.value) {
      // Use cached data
      return residentData.value;
    }

    loading.value = true;
    error.value = '';

    try {
      const res = await $fetch<ResidentData>('/api/resident/me', {
        method: 'GET',
      });

      residentData.value = res;
      isInitialized.value = true;
      return res;
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load resident info';
      isInitialized.value = true;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch in-room status
  async function fetchInRoomStatus() {
    inRoomLoading.value = true;
    try {
      const status = await $fetch<InRoomStatus>('/api/resident/update-in-room', {
        method: 'GET',
      });
      // If status?.inRoom is undefined or null, default to true
      inRoomStatus.value = status?.inRoom === undefined || status?.inRoom === null ? true : !!status?.inRoom;
      return inRoomStatus.value;
    } catch (e: any) {
      console.warn('Failed to fetch in-room status:', e);
      return null;
    } finally {
      inRoomLoading.value = false;
    }
  }

  // Toggle in-room status
  async function toggleInRoom() {
    statusError.value = '';
    try {
      await $fetch('/api/resident/update-in-room', {
        method: 'POST',
        body: { inRoom: !inRoomStatus.value },
      });

      inRoomStatus.value = !inRoomStatus.value;
      return true;
    } catch (err: any) {
      statusError.value = err?.data?.statusMessage || err?.message || 'Failed to update status';
      throw err;
    }
  }

  // Refresh all data (force refetch)
  async function refresh() {
    isInitialized.value = false;
    error.value = '';
    await Promise.all([fetchResidentData(), fetchInRoomStatus()]);
  }

  return {
    // State
    residentData,
    inRoomStatus,
    loading,
    inRoomLoading,
    error,
    statusError,
    isInitialized,

    // Methods
    fetchResidentData,
    fetchInRoomStatus,
    toggleInRoom,
    refresh,
  };
});
