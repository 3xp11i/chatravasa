import { useComplaintsStore } from '~/stores/complaints'

/**
 * Composable for managing resident complaints data
 */
export const useComplaintsData = () => {
  const store = useComplaintsStore()

  const load = async (filter?: 'my' | 'public') => {
    try {
      await store.fetchResidentComplaints(filter)
    } catch (error) {
      console.error('Failed to load complaints:', error)
      throw error
    }
  }

  const createComplaint = async (data: {
    title: string
    description: string
    type: 'private' | 'public'
    media?: File[]
  }) => {
    try {
      return await store.createComplaint(data)
    } catch (error) {
      console.error('Failed to create complaint:', error)
      throw error
    }
  }

  const resolveComplaint = async (complaintId: string) => {
    try {
      return await store.resolveComplaint(complaintId)
    } catch (error) {
      console.error('Failed to resolve complaint:', error)
      throw error
    }
  }

  const toggleUpvote = async (complaintId: string) => {
    try {
      return await store.toggleUpvote(complaintId)
    } catch (error) {
      console.error('Failed to toggle upvote:', error)
      throw error
    }
  }

  const fetchReplies = async (complaintId: string) => {
    try {
      return await store.fetchReplies(complaintId)
    } catch (error) {
      console.error('Failed to fetch replies:', error)
      throw error
    }
  }

  const addReply = async (complaintId: string, message: string) => {
    try {
      return await store.addReply(complaintId, message)
    } catch (error) {
      console.error('Failed to add reply:', error)
      throw error
    }
  }

  const selectComplaint = (complaint: any) => {
    store.selectComplaint(complaint)
  }

  const refresh = async () => {
    await store.refresh()
  }

  return {
    // Reactive state
    complaints: computed(() => store.complaints),
    selectedComplaint: computed(() => store.selectedComplaint),
    replies: computed(() => store.replies),
    loading: computed(() => store.loading),
    repliesLoading: computed(() => store.repliesLoading),
    error: computed(() => store.error),
    isInitialized: computed(() => store.isInitialized),

    // Methods
    load,
    createComplaint,
    resolveComplaint,
    toggleUpvote,
    fetchReplies,
    addReply,
    selectComplaint,
    refresh,
  }
}
