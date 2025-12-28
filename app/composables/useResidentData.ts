/**
 * Composable for managing resident data with caching
 * Prevents unnecessary refetches when navigating back and forth
 */
export const useResidentData = () => {
  const store = useResidentStore();

  const load = async () => {
    try {
      await store.fetchResidentData();
      await store.fetchInRoomStatus();
    } catch (error) {
      console.error('Failed to load resident data:', error);
      throw error;
    }
  };

  const toggleInRoom = async () => {
    try {
      await store.toggleInRoom();
    } catch (error) {
      console.error('Failed to toggle in-room status:', error);
      throw error;
    }
  };

  const refresh = async () => {
    await store.refresh();
  };

  return {
    // Reactive state
    residentData: computed(() => store.residentData),
    firstName: computed(() => {
      const data = store.residentData as any;
      if (data?.first_name) return data.first_name as string;
      const parts = (data?.name || '').split(' ');
      return parts[0] || 'Resident';
    }),
    residentRoom: computed(() => store.residentData?.room || ''),
    inRoom: computed(() => {
      // If inRoomStatus is null or undefined, default to true (in-room)
      return store.inRoomStatus === undefined || store.inRoomStatus === null ? true : store.inRoomStatus;
    }),
    loading: computed(() => store.loading),
    inRoomLoading: computed(() => store.inRoomLoading),
    error: computed(() => store.error),
    statusError: computed(() => store.statusError),
    detailsLoading: computed(() => store.loading),

    // Methods
    load,
    toggleInRoom,
    refresh,
  };
};
