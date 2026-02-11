/**
 * Composable for managing resident complaints data with caching using useCachedAsyncData
 * Prevents unnecessary refetches when navigating back and forth
 */
export const useComplaintsData = () => {
  type Complaint = {
    id: string
    title: string
    description: string
    type: 'private' | 'public'
    status: string
    upvotes: number
    reply_count: number
    created_at: string
    attached_media: string[]
    author_profile: {
      id: string
      first_name: string
      last_name: string
      avatar: string | null
    } | null
    author_room: string | null
    is_own?: boolean
    has_upvoted?: boolean
  }

  type ComplaintsResponse = {
    success: boolean
    complaints: Complaint[]
    hostel_id: string
  }

  const currentFilter = ref<'my' | 'public' | undefined>(undefined)
  const complaintsData = ref<ComplaintsResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  const complaints = computed(() => complaintsData.value?.complaints || [])
  const hostelId = computed(() => complaintsData.value?.hostel_id || null)

  // Load complaints with optional filter
  const load = async (filter?: 'my' | 'public') => {
    currentFilter.value = filter
    loading.value = true
    error.value = ''
    try {
      const query = filter ? `?filter=${filter}` : ''
      complaintsData.value = await $fetch<ComplaintsResponse>(`/api/resident/complaints/list${query}`, { method: 'GET' })
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load complaints'
    } finally {
      loading.value = false
    }
  }

  // Refresh current filter
  const refresh = async () => {
    await load(currentFilter.value)
  }

  // Initial load
  if (import.meta.client && !complaintsData.value) {
    load()
  }

  // Create new complaint
  const createComplaint = async (data: {
    title: string
    description: string
    type: 'private' | 'public'
    media?: File[]
  }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('type', data.type)

    if (data.media) {
      for (const file of data.media) {
        formData.append('media', file)
      }
    }

    try {
      const res = await $fetch<{ success: boolean; complaint: Complaint }>(
        '/api/resident/complaints/create',
        {
          method: 'POST',
          body: formData,
        }
      )

      // Refresh complaints list after creation
      await refresh()
      return res.complaint
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to create complaint'
      throw err
    }
  }

  // Resolve own complaint
  const resolveComplaint = async (complaintId: string) => {
    try {
      const res = await $fetch<{ success: boolean; complaint: Complaint }>(
        '/api/resident/complaints/resolve',
        {
          method: 'POST',
          body: { complaint_id: complaintId },
        }
      )

      // Refresh to get updated data
      await refresh()
      return res.complaint
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to resolve complaint'
      throw err
    }
  }

  // Upvote/unupvote complaint
  const toggleUpvote = async (complaintId: string) => {
    try {
      const res = await $fetch<{ success: boolean; upvoted: boolean; upvotes: number }>(
        '/api/resident/complaints/upvote',
        {
          method: 'POST',
          body: { complaint_id: complaintId },
        }
      )

      return res
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to upvote complaint'
      throw err
    }
  }

  // Add reply to complaint
  const addReply = async (complaintId: string, message: string) => {
    try {
      const res = await $fetch<{ success: boolean; reply: any }>(
        '/api/resident/complaints/add-reply',
        {
          method: 'POST',
          body: { complaint_id: complaintId, message },
        }
      )

      // Refresh to get updated reply count
      await refresh()
      return res.reply
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to add reply'
      throw err
    }
  }

  // Delete own complaint
  const deleteComplaint = async (complaintId: string) => {
    try {
      await $fetch<{ success: boolean }>(
        '/api/resident/complaints/delete',
        {
          method: 'POST',
          body: { complaint_id: complaintId },
        }
      )

      // Refresh complaints list after deletion
      await refresh()
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to delete complaint'
      throw err
    }
  }

  return {
    // Reactive state
    complaints,
    hostelId,
    loading,
    error: computed(() => error.value),
    isInitialized: computed(() => complaintsData.value !== null && complaintsData.value !== undefined),

    // Methods
    load,
    createComplaint,
    resolveComplaint,
    toggleUpvote,
    addReply,
    deleteComplaint,
    refresh,
  }
}
