<template>
  <div class="min-h-screen bg-background text-text px-4 py-8">
    <div class="card space-y-6">
      <!-- Header -->
      <div class="flex flex-col justify-between">
        <h1 class="text-2xl md:text-3xl font-bold">Complaints</h1>
        <button @click="openCreateModal" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm md:text-base">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="overflow-x-auto">
        <nav class="border-b border-gray-200 flex w-auto" aria-label="Tabs">
          <button
            @click="currentFilter = undefined"
            :class="[
              currentFilter === undefined
                ? 'bg-red-600 text-white'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm rounded-b-none rounded-bl-none'
            ]"
          >
            All
          </button>
          <button
            @click="currentFilter = 'my'"
            :class="[
              currentFilter === 'my'
                ? 'bg-red-600 text-white'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm'
            ]"
          >
            My Complaints
          </button>
          <button
            @click="currentFilter = 'public'"
            :class="[
              currentFilter === 'public'
                ? 'bg-red-600 text-white'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm rounded-b-none rounded-br-none'
            ]"
          >
            Public Complaints
          </button>
        </nav>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="complaints.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
        <p class="text-gray-500 mb-4">Submit a complaint to get started.</p>
        <button @click="openCreateModal" class="text-red-600 hover:text-red-700 font-medium">
          Submit your first complaint →
        </button>
      </div>

      <!-- Complaints List -->
      <div v-else class="space-y-4">
        <div
          v-for="complaint in complaints"
          :key="complaint.id"
          @click="openComplaintDetails(complaint)"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <!-- Author Header -->
          <div class="flex items-start gap-3 mb-3">
            <img
              :src="complaint.author_profile?.avatar || defaultAvatar"
              :alt="getAuthorName(complaint)"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{{ getAuthorName(complaint) }}</span>
                <span v-if="complaint.is_own" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>
                <span v-if="complaint.author_room" class="text-xs text-gray-500">Room {{ complaint.author_room }}</span>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(complaint.created_at) }}
              </div>
            </div>
            <!-- Status & Type Badges -->
            <div class="flex flex-col items-end gap-1">
              <span :class="getStatusClass(complaint.status)" class="text-xs px-2 py-1 rounded-full capitalize">
                {{ complaint.status }}
              </span>
              <span :class="getTypeClass(complaint.type)" class="text-xs px-2 py-1 rounded-full capitalize">
                {{ complaint.type }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <h3 class="font-semibold text-gray-900 mb-1">{{ complaint.title }}</h3>
          <p class="text-gray-600 text-sm line-clamp-2 mb-3">{{ complaint.description }}</p>

          <!-- Media Preview -->
          <div v-if="complaint.attached_media && complaint.attached_media.length > 0" class="flex gap-2 mb-3 overflow-x-auto">
            <template v-for="(media, idx) in complaint.attached_media.slice(0, 3)" :key="idx">
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
            <div v-if="complaint.attached_media.length > 3" class="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
              +{{ complaint.attached_media.length - 3 }}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex items-center gap-4">
              <!-- Upvote Button (only for public complaints from others) -->
              <button
                v-if="complaint.type === 'public' && !complaint.is_own"
                @click.stop="handleUpvote(complaint.id)"
                :class="[
                  'flex items-center gap-1 text-sm transition-colors',
                  complaint.has_upvoted ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                ]"
              >
                <svg class="w-5 h-5" :fill="complaint.has_upvoted ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-7-7m7 7l7-7" />
                </svg>
                <span>{{ complaint.upvotes || 0 }}</span>
              </button>
              <div v-else-if="complaint.type === 'public'" class="flex items-center gap-1 text-sm text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-7-7m7 7l7-7" />
                </svg>
                <span>{{ complaint.upvotes || 0 }}</span>
              </div>

              <!-- Reply Count -->
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ complaint.reply_count || 0 }}</span>
              </div>
            </div>

            <!-- Resolve Button (only for own complaints that are not resolved) -->
            <button
              v-if="complaint.is_own && complaint.status !== 'resolved'"
              @click.stop="handleResolve(complaint.id)"
              class="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Complaint Modal -->
    <!-- Removed, now using useModal -->

    <!-- Complaint Details Modal -->
    <!-- Removed, now using useModal -->

    <ModalsContainer />
  </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import CreateComplaintModal from '~/components/modals/CreateComplaintModal.vue'
import ComplaintDetailsModal from '~/components/modals/ComplaintDetailsModal.vue'
import defaultAvatar from '~/assets/images/profile.jpg'

definePageMeta({
  layout: 'default',
  name: 'resident-complaints',
})

const {
  complaints,
  loading,
  error,
  load,
  resolveComplaint,
  toggleUpvote,
  addReply,
} = useComplaintsData()

const currentFilter = ref<'my' | 'public' | undefined>(undefined)

// Watch for filter changes
watch(currentFilter, async (newFilter) => {
  await load(newFilter)
})

onMounted(async () => {
  await load()
})

function openCreateModal() {
  const { open, close } = useModal({
    component: CreateComplaintModal,
    attrs: {
      onClose() {
        close()
      },
      onCreated() {
        close()
        load(currentFilter.value)
      },
    },
  })
  open()
}

function openComplaintDetails(complaint: any) {
  const replies = ref<any[]>([])
  const repliesLoading = ref(true)

  const { open, close } = useModal({
    component: ComplaintDetailsModal,
    attrs: {
      complaint,
      replies,
      repliesLoading,
      isResident: true,
      onClose() {
        close()
      },
      onReply: handleAddReply,
      onResolve: handleResolve,
      onUpvote: handleUpvote,
    },
  })

  open()

  // Load replies
  loadReplies(complaint.id, replies, repliesLoading)
}

async function loadReplies(complaintId: string, repliesRef: Ref<any[]>, loadingRef: Ref<boolean>) {
  loadingRef.value = true
  try {
    const res = await $fetch<{ success: boolean; replies: any[] }>(
      `/api/resident/complaints/get-replies?complaint_id=${complaintId}`,
      { method: 'GET' }
    )
    repliesRef.value = res.replies
  } catch (err: any) {
    console.error('Failed to load replies:', err)
  } finally {
    loadingRef.value = false
  }
}

async function handleResolve(complaintId: string) {
  try {
    await resolveComplaint(complaintId)
  } catch (err) {
    console.error('Failed to resolve complaint:', err)
  }
}

async function handleUpvote(complaintId: string) {
  try {
    const result = await toggleUpvote(complaintId)
    // Find the complaint in the list and update it directly
    const complaintIndex = complaints.value.findIndex(c => c.id === complaintId)
    if (complaintIndex !== -1) {
      complaints.value[complaintIndex].upvotes = result.upvotes
      complaints.value[complaintIndex].has_upvoted = result.upvoted
    }
  } catch (err) {
    console.error('Failed to upvote complaint:', err)
  }
}

async function handleAddReply(complaintId: string, message: string) {
  try {
    await addReply(complaintId, message)
  } catch (err) {
    console.error('Failed to add reply:', err)
  }
}

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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
