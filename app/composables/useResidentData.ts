/**
 * Composable for managing resident data with caching using useCachedAsyncData
 * Prevents unnecessary refetches when navigating back and forth
 */
export const useResidentData = () => {
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

  // Fetch resident profile data with caching
  const { data: residentData, pending: loading, error: fetchError, refresh: refreshProfile } = useCachedAsyncData(
    'resident-profile-data',
    () => $fetch<ResidentData>('/api/resident/me', { method: 'GET' })
  );

  // Fetch in-room status with caching
  const { data: inRoomData, pending: inRoomLoading, refresh: refreshInRoom } = useCachedAsyncData(
    'resident-inroom-status',
    () => $fetch<InRoomStatus>('/api/resident/update-in-room', { method: 'GET' })
  );

  const statusError = ref('');

  // Toggle in-room status
  const toggleInRoom = async () => {
    statusError.value = '';
    const currentStatus = inRoomData.value?.inRoom ?? true;
    
    try {
      await $fetch('/api/resident/update-in-room', {
        method: 'POST',
        body: { inRoom: !currentStatus },
      });

      // Refresh the in-room status after successful toggle
      await refreshInRoom();
    } catch (err: any) {
      statusError.value = err?.data?.statusMessage || err?.message || 'Failed to update status';
      throw err;
    }
  };

  // Refresh all data
  const refresh = async () => {
    await Promise.all([refreshProfile(), refreshInRoom()]);
  };

  return {
    // Reactive state
    residentData,
    firstName: computed(() => {
      const data = residentData.value as any;
      if (data?.first_name) return data.first_name as string;
      const parts = (data?.name || '').split(' ');
      return parts[0] || 'Resident';
    }),
    residentRoom: computed(() => residentData.value?.room || ''),
    inRoom: computed(() => {
      // If inRoom is null or undefined, default to true (in-room)
      const status = inRoomData.value?.inRoom;
      return status === undefined || status === null ? true : status;
    }),
    loading,
    inRoomLoading,
    error: computed(() => fetchError.value ? 'Failed to load resident info' : ''),
    statusError: computed(() => statusError.value),
    detailsLoading: loading,

    // Methods
    toggleInRoom,
    refresh,
  };
};
