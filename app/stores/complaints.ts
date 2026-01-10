import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'

type Complaint = Database['public']['Tables']['hostel_complaints']['Row'] & {
  reply_count: number
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

type Reply = {
  id: string
  message: string
  created_at: string
  author: string
  author_profile: {
    id: string
    first_name: string
    last_name: string
    avatar: string | null
    is_admin?: boolean
  } | null
  is_own?: boolean
}

export const useComplaintsStore = defineStore('complaints', () => {
  // State
  const complaints = ref<Complaint[]>([])
  const selectedComplaint = ref<Complaint | null>(null)
  const replies = ref<Reply[]>([])
  const loading = ref(false)
  const repliesLoading = ref(false)
  const error = ref('')
  const isInitialized = ref(false)
  const hostelId = ref<string | null>(null)

  // Fetch complaints for resident
  async function fetchResidentComplaints(filter?: 'my' | 'public') {
    loading.value = true
    error.value = ''

    try {
      const query = filter ? `?filter=${filter}` : ''
      const res = await $fetch<{ success: boolean; complaints: Complaint[]; hostel_id: string }>(
        `/api/resident/complaints/list${query}`,
        { method: 'GET' }
      )

      complaints.value = res.complaints
      hostelId.value = res.hostel_id
      isInitialized.value = true
      return res.complaints
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load complaints'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new complaint
  async function createComplaint(data: {
    title: string
    description: string
    type: 'private' | 'public'
    media?: File[]
  }) {
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

      // Refresh complaints list
      await fetchResidentComplaints()
      return res.complaint
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to create complaint'
      throw err
    }
  }

  // Resolve own complaint
  async function resolveComplaint(complaintId: string) {
    try {
      const res = await $fetch<{ success: boolean; complaint: Complaint }>(
        '/api/resident/complaints/resolve',
        {
          method: 'POST',
          body: { complaint_id: complaintId },
        }
      )

      // Update local state
      const idx = complaints.value.findIndex((c) => c.id === complaintId)
      if (idx !== -1 && complaints.value[idx]) {
        complaints.value[idx]!.status = 'resolved'
      }
      if (selectedComplaint.value?.id === complaintId) {
        selectedComplaint.value.status = 'resolved'
      }

      return res.complaint
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to resolve complaint'
      throw err
    }
  }

  // Upvote/unupvote complaint
  async function toggleUpvote(complaintId: string) {
    try {
      const res = await $fetch<{ success: boolean; upvoted: boolean; upvotes: number }>(
        '/api/resident/complaints/upvote',
        {
          method: 'POST',
          body: { complaint_id: complaintId },
        }
      )

      // Update local state
      const idx = complaints.value.findIndex((c) => c.id === complaintId)
      if (idx !== -1 && complaints.value[idx]) {
        complaints.value[idx]!.upvotes = res.upvotes
        complaints.value[idx]!.has_upvoted = res.upvoted
      }
      if (selectedComplaint.value?.id === complaintId) {
        selectedComplaint.value.upvotes = res.upvotes
        selectedComplaint.value.has_upvoted = res.upvoted
      }

      return res
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to upvote complaint'
      throw err
    }
  }

  // Fetch replies for a complaint
  async function fetchReplies(complaintId: string) {
    repliesLoading.value = true

    try {
      const res = await $fetch<{ success: boolean; replies: Reply[] }>(
        `/api/resident/complaints/get-replies?complaint_id=${complaintId}`,
        { method: 'GET' }
      )

      replies.value = res.replies
      return res.replies
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to load replies'
      throw err
    } finally {
      repliesLoading.value = false
    }
  }

  // Add reply to complaint
  async function addReply(complaintId: string, message: string) {
    try {
      const res = await $fetch<{ success: boolean; reply: Reply }>(
        '/api/resident/complaints/add-reply',
        {
          method: 'POST',
          body: { complaint_id: complaintId, message },
        }
      )

      // Add to local replies
      replies.value.push(res.reply)

      // Update reply count
      const idx = complaints.value.findIndex((c) => c.id === complaintId)
      if (idx !== -1 && complaints.value[idx]) {
        complaints.value[idx]!.reply_count = (complaints.value[idx]!.reply_count || 0) + 1
      }

      return res.reply
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to add reply'
      throw err
    }
  }

  // Select a complaint for viewing details
  function selectComplaint(complaint: Complaint | null) {
    selectedComplaint.value = complaint
    if (complaint) {
      fetchReplies(complaint.id)
    } else {
      replies.value = []
    }
  }

  // Refresh all data
  async function refresh() {
    isInitialized.value = false
    error.value = ''
    await fetchResidentComplaints()
  }

  // Clear state
  function clear() {
    complaints.value = []
    selectedComplaint.value = null
    replies.value = []
    isInitialized.value = false
    error.value = ''
    hostelId.value = null
  }

  return {
    // State
    complaints,
    selectedComplaint,
    replies,
    loading,
    repliesLoading,
    error,
    isInitialized,
    hostelId,

    // Actions
    fetchResidentComplaints,
    createComplaint,
    resolveComplaint,
    toggleUpvote,
    fetchReplies,
    addReply,
    selectComplaint,
    refresh,
    clear,
  }
})
