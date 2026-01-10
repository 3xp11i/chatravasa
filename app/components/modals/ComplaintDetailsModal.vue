<template>
  <VueFinalModal
    :model-value="true"
    class="flex justify-center items-center"
    content-class="w-full mx-4 max-h-[90vh]"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="bg-white rounded-lg shadow-xl max-h-[85vh] overflow-hidden flex flex-col w-full">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <button @click="props.onClose" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-gray-900">Complaint Details</h2>
        </div>
        <div class="flex items-center gap-2">
          <span :class="getStatusClass(complaint.status)" class="text-xs px-2 py-1 rounded-full capitalize">
            {{ complaint.status }}
          </span>
          <span :class="getTypeClass(complaint.type)" class="text-xs px-2 py-1 rounded-full capitalize">
            {{ complaint.type }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Author Info -->
        <div class="flex items-start gap-3 mb-4">
          <img
            :src="props.complaint.author_profile?.avatar || defaultAvatar"
            :alt="authorName"
            class="w-12 h-12 rounded-full object-cover"

          />
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-gray-900">{{ authorName }}</span>
              <span v-if="complaint.is_own" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>
              <span v-if="complaint.author_room" class="text-xs text-gray-500">Room {{ complaint.author_room }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ formatDate(complaint.created_at) }}</div>
          </div>
        </div>

        <!-- Title & Description -->
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ complaint.title }}</h3>
        <p class="text-gray-700 whitespace-pre-wrap mb-4">{{ complaint.description }}</p>

        <!-- Media Gallery -->
        <div v-if="complaint.attached_media && complaint.attached_media.length > 0" class="mb-4">
          <div class="grid grid-cols-2 gap-2">
            <template v-for="(media, idx) in complaint.attached_media" :key="idx">
              <div
                v-if="isImage(media)"
                class="aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                @click="openMediaViewer(media)"
              >
                <img :src="media" alt="Attachment" class="w-full h-full object-cover" />
              </div>
              <div v-else class="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <video :src="media" controls class="w-full h-full object-cover"></video>
              </div>
            </template>
          </div>
        </div>

        <!-- Stats & Actions -->
        <div class="flex items-center justify-between py-3 border-y border-gray-100 mb-4">
          <div class="flex items-center gap-4">
            <!-- Upvote Button -->
            <button
              v-if="props.isResident && props.complaint.type === 'public' && !props.complaint.is_own"
              @click="handleUpvote"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                props.complaint.has_upvoted
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              ]"
            >
              <svg class="w-5 h-5" :fill="props.complaint.has_upvoted ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-7-7m7 7l7-7" />
              </svg>
              {{ props.complaint.upvotes || 0 }} {{ props.complaint.upvotes === 1 ? 'Upvote' : 'Upvotes' }}
            </button>
            <div v-else-if="complaint.type === 'public'" class="flex items-center gap-1.5 text-sm text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0 0l-7-7m7 7l7-7" />
              </svg>
              {{ complaint.upvotes || 0 }} {{ complaint.upvotes === 1 ? 'Upvote' : 'Upvotes' }}
            </div>

            <div class="flex items-center gap-1.5 text-sm text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {{ replies.length }} {{ replies.length === 1 ? 'Reply' : 'Replies' }}
            </div>
          </div>

          <!-- Resolve / Update Status Button -->
          <div class="flex items-center gap-2">
            <!-- Resident can mark as resolved -->
            <button
              v-if="props.isResident && props.complaint.is_own && props.complaint.status !== 'resolved'"
              @click="handleResolve"
              class="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Mark Resolved
            </button>

            <!-- Admin can change pending to ongoing -->
            <button
              v-if="!props.isResident && props.complaint.status === 'pending'"
              @click="handleUpdateStatus"
              class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Mark Ongoing
            </button>
          </div>
        </div>

        <!-- Replies Section -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Replies</h4>

          <!-- Loading -->
          <div v-if="props.repliesLoading" class="space-y-3">
            <div v-for="i in 2" :key="i" class="flex gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div class="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- No Replies -->
          <div v-else-if="props.replies.length === 0" class="text-center py-6 text-gray-500">
            <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No replies yet</p>
          </div>

          <!-- Replies List -->
          <div v-else class="space-y-4">
            <div v-for="reply in props.replies" :key="reply.id" class="flex gap-3">
              <img
                v-if="reply.author_profile?.avatar"
                :src="reply.author_profile.avatar"
                :alt="getReplyAuthorName(reply)"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm"
              >
                {{ getReplyInitials(reply) }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-gray-900 text-sm">{{ getReplyAuthorName(reply) }}</span>
                  <span v-if="reply.author_profile?.is_admin" class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Admin</span>
                  <span v-else-if="!isResident" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Resident</span>
                  <span v-if="reply.is_own" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>
                  <span class="text-xs text-gray-500">{{ formatDate(reply.created_at) }}</span>
                </div>
                <p class="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{{ reply.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reply Input -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <form @submit.prevent="submitReply" class="flex gap-2">
          <input
            v-model="replyMessage"
            type="text"
            placeholder="Write a reply..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            :disabled="isSubmittingReply"
          />
          <button
            type="submit"
            :disabled="!replyMessage.trim() || isSubmittingReply"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmittingReply ? '...' : 'Reply' }}
          </button>
        </form>
      </div>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import defaultAvatar from '~/assets/images/profile.jpg'

const props = defineProps<{
  complaint: any
  replies: any[]
  repliesLoading: boolean
  isResident: boolean
  onClose: () => void
  onReply: (complaintId: string, message: string) => void
  onResolve?: (complaintId: string) => void
  onUpvote?: (complaintId: string) => void
  onUpdateStatus?: (complaintId: string, status: string) => void
}>()

const replyMessage = ref('')
const isSubmittingReply = ref(false)

const authorName = computed(() => {
  if (props.complaint.author_profile) {
    return `${props.complaint.author_profile.first_name} ${props.complaint.author_profile.last_name}`
  }
  return 'Unknown'
})

const initials = computed(() => {
  if (props.complaint.author_profile) {
    return `${props.complaint.author_profile.first_name?.[0] || ''}${props.complaint.author_profile.last_name?.[0] || ''}`
  }
  return '?'
})

function getReplyAuthorName(reply: any) {
  if (reply.author_profile) {
    return `${reply.author_profile.first_name} ${reply.author_profile.last_name}`
  }
  return 'Unknown'
}

function getReplyInitials(reply: any) {
  if (reply.author_profile) {
    return `${reply.author_profile.first_name?.[0] || ''}${reply.author_profile.last_name?.[0] || ''}`
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
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isImage(url: string) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const ext = url.split('.').pop()?.toLowerCase() || ''
  return imageExtensions.includes(ext)
}

function openMediaViewer(url: string) {
  window.open(url, '_blank')
}

function handleUpvote() {
  props.onUpvote?.(props.complaint.id)
}

function handleResolve() {
  props.onResolve?.(props.complaint.id)
}

function handleUpdateStatus() {
  props.onUpdateStatus?.(props.complaint.id, 'ongoing')
}

async function submitReply() {
  if (!replyMessage.value.trim()) return

  isSubmittingReply.value = true
  try {
    props.onReply(props.complaint.id, replyMessage.value.trim())
    replyMessage.value = ''
  } finally {
    isSubmittingReply.value = false
  }
}
</script>
