<template>
  <div class="p-4 md:p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Manage Complaints</h1>
      <p class="text-gray-600">View and respond to resident complaints</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <!-- Status Filter -->
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Status:</label>
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="ongoing">Ongoing</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <!-- Type Filter -->
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Type:</label>
        <select
          v-model="typeFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      <!-- Refresh Button -->
      <button
        @click="loadComplaints"
        :disabled="loading"
        class="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
        <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
        <div class="text-sm text-gray-600">Pending</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div class="text-2xl font-bold text-blue-600">{{ ongoingCount }}</div>
        <div class="text-sm text-gray-600">Ongoing</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <div class="text-2xl font-bold text-green-600">{{ resolvedCount }}</div>
        <div class="text-sm text-gray-600">Resolved</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
        <div class="text-2xl font-bold text-gray-600">{{ totalCount }}</div>
        <div class="text-sm text-gray-600">Total</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-full bg-gray-200"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredComplaints.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
      <p class="text-gray-500">
        {{ statusFilter || typeFilter ? 'Try adjusting your filters.' : 'No complaints have been submitted yet.' }}
      </p>
    </div>

    <!-- Complaints List -->
    <div v-else class="space-y-4">
      <div
        v-for="complaint in filteredComplaints"
        :key="complaint.id"
        @click="openComplaintDetails(complaint)"
        class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="p-4">
          <!-- Author Header -->
          <div class="flex items-start gap-3 mb-3">
            <img
              :src="complaint.author_profile?.avatar || defaultAvatar"
              :alt="getAuthorName(complaint)"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{{ getAuthorName(complaint) }}</span>
                <span v-if="complaint.author_room" class="text-sm text-gray-500">Room {{ complaint.author_room }}</span>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(complaint.created_at) }}
              </div>
            </div>
            <!-- Status & Type Badges -->
            <div class="flex flex-col items-end gap-1.5">
              <span :class="getStatusClass(complaint.status)" class="text-xs px-2.5 py-1 rounded-full capitalize font-medium">
                {{ complaint.status }}
              </span>
              <span :class="getTypeClass(complaint.type)" class="text-xs px-2.5 py-1 rounded-full capitalize">
                {{ complaint.type }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <h3 class="font-semibold text-gray-900 text-lg mb-1">{{ complaint.title }}</h3>
          <p class="text-gray-600 line-clamp-2 mb-3">{{ complaint.description }}</p>

          <!-- Media Preview -->
          <div v-if="complaint.attached_media && complaint.attached_media.length > 0" class="flex gap-2 mb-3">
            <template v-for="(media, idx) in complaint.attached_media.slice(0, 4)" :key="idx">
              <img
                v-if="isImage(media)"
                :src="media"
                alt="Attachment"
                class="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <div v-else class="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <div class="flex items-center gap-4">
              <!-- Upvotes (public only) -->
              <div v-if="complaint.type === 'public'" class="flex items-center gap-1.5 text-sm text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-7-7m7 7l7-7" />
                </svg>
                <span>{{ complaint.upvotes || 0 }} upvotes</span>
              </div>

              <!-- Reply Count -->
              <div class="flex items-center gap-1.5 text-sm text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ complaint.reply_count || 0 }} replies</span>
              </div>
            </div>

            <!-- Quick Action -->
            <button
              v-if="complaint.status === 'pending' && canManageComplaints"
              @click.stop="updateComplaintStatus(complaint.id)"
              class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Mark Ongoing
            </button>
            <span v-else-if="complaint.status === 'ongoing'" class="text-sm text-blue-600 font-medium">
              Awaiting resolution by resident
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Complaint Details Modal -->
    <!-- Removed, now using useModal -->

    <ModalsContainer />
  </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import ComplaintDetailsModal from '~/components/modals/ComplaintDetailsModal.vue'
import defaultAvatar from '~/assets/images/profile.jpg'

definePageMeta({
  layout: 'default',
  name: 'manage-complaints',
})

const route = useRoute()
const hostelSlug = computed(() => route.params.hostelslug as string)

// State
const complaints = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

// Permission check
const { isAdmin } = useCurrentUser()
const { isStaff, hasPermission } = useStaffContext()

const canManageComplaints = computed(() => {
  return isAdmin.value || (isStaff.value && hasPermission('manage_complaints'))
})

// Filtered complaints
const filteredComplaints = computed(() => complaints.value)

// Stats
const pendingCount = computed(() => complaints.value.filter(c => c.status === 'pending').length)
const ongoingCount = computed(() => complaints.value.filter(c => c.status === 'ongoing').length)
const resolvedCount = computed(() => complaints.value.filter(c => c.status === 'resolved').length)
const totalCount = computed(() => complaints.value.length)

// Load complaints
async function loadComplaints() {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams({ hostel_slug: hostelSlug.value })
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (typeFilter.value) params.append('type', typeFilter.value)

    const res = await $fetch<{ success: boolean; complaints: any[] }>(
      `/api/manage-complaints/list?${params.toString()}`,
      { method: 'GET' }
    )

    complaints.value = res.complaints
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load complaints'
  } finally {
    loading.value = false
  }
}

// Open complaint details
function openComplaintDetails(complaint: any) {
  const replies = ref<any[]>([])
  const repliesLoading = ref(true)

  const { open, close } = useModal({
    component: ComplaintDetailsModal,
    attrs: {
      complaint,
      replies,
      repliesLoading,
      isResident: false,
      onClose() {
        close()
      },
      onReply: handleAddReply,
      onUpdateStatus: updateComplaintStatus,
    },
  })

  open()

  loadReplies(complaint.id, replies, repliesLoading)
}

// Load replies for selected complaint
async function loadReplies(complaintId: string, repliesRef: Ref<any[]>, loadingRef: Ref<boolean>) {
  loadingRef.value = true

  try {
    const res = await $fetch<{ success: boolean; replies: any[] }>(
      `/api/manage-complaints/get-replies?complaint_id=${complaintId}&hostel_slug=${hostelSlug.value}`,
      { method: 'GET' }
    )

    repliesRef.value = res.replies
  } catch (err: any) {
    console.error('Failed to load replies:', err)
  } finally {
    loadingRef.value = false
  }
}

// Update complaint status
async function updateComplaintStatus(complaintId: string) {
  try {
    await $fetch('/api/manage-complaints/update-status', {
      method: 'POST',
      body: {
        complaint_id: complaintId,
        status: 'ongoing',
        hostel_slug: hostelSlug.value,
      },
    })

    // Update local state
    const idx = complaints.value.findIndex(c => c.id === complaintId)
    if (idx !== -1) {
      complaints.value[idx].status = 'ongoing'
    }
  } catch (err: any) {
    console.error('Failed to update status:', err)
    alert(err?.data?.statusMessage || 'Failed to update status')
  }
}

// Add reply
async function handleAddReply(complaintId: string, message: string) {
  try {
    const res = await $fetch<{ success: boolean; reply: any }>(
      '/api/manage-complaints/add-reply',
      {
        method: 'POST',
        body: {
          complaint_id: complaintId,
          message,
          hostel_slug: hostelSlug.value,
        },
      }
    )

    // Note: Since replies is local to the modal, we don't update it here
    // The modal will reload replies if needed, but for now, we can ignore

    // Update reply count
    const idx = complaints.value.findIndex(c => c.id === complaintId)
    if (idx !== -1) {
      complaints.value[idx].reply_count = (complaints.value[idx].reply_count || 0) + 1
    }
  } catch (err: any) {
    console.error('Failed to add reply:', err)
    alert(err?.data?.statusMessage || 'Failed to add reply')
  }
}

// Helper functions
function getAuthorName(complaint: any) {
  if (complaint.author_profile) {
    return `${complaint.author_profile.first_name} ${complaint.author_profile.last_name}`
  }
  return 'Unknown'
}

function getInitials(complaint: any) {
  if (complaint.author_profile) {
    return `${complaint.author_profile.first_name?.[0] || ''}${complaint.author_profile.last_name?.[0] || ''}`
  }
  return '?'
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'ongoing':
      return 'bg-blue-100 text-blue-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getTypeClass(type: string) {
  switch (type) {
    case 'public':
      return 'bg-purple-100 text-purple-800'
    case 'private':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function isImage(url: string) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const ext = url.split('.').pop()?.toLowerCase() || ''
  return imageExtensions.includes(ext)
}

// Watch for filter changes
watch([statusFilter, typeFilter], () => {
  loadComplaints()
})

// Initial load
onMounted(() => {
  loadComplaints()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>