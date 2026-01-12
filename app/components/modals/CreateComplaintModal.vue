<template>
  <VueFinalModal
    :model-value="true"
    class="flex justify-center items-center px-4"
    content-class="max-w-lg w-full max-h-[90vh] max-h-[90dvh]"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    :click-to-close="false"
    :lock-scroll="true"
  >
    <div class="bg-white rounded-lg shadow-xl p-6 max-h-[85vh] max-h-[85dvh] overflow-y-auto overflow-x-hidden w-full">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900">Submit Complaint</h2>
        <button @click="props.onClose" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submit">
        <div class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Brief summary of your complaint"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              required
              rows="4"
              maxlength="2000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Provide detailed information about your complaint..."
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ form.description.length }}/2000 characters</p>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="private"
                  class="text-red-600 focus:ring-red-500"
                />
                <span class="text-sm">
                  <span class="font-medium">Private</span>
                  <span class="text-gray-500"> - Only visible to admin/staff</span>
                </span>
              </label>
            </div>
            <div class="flex gap-4 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="public"
                  class="text-red-600 focus:ring-red-500"
                />
                <span class="text-sm">
                  <span class="font-medium">Public</span>
                  <span class="text-gray-500"> - Visible to all residents (can be upvoted)</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Media Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Attachments
              <span class="text-gray-400 font-normal">(Optional - Max 2 images, 1 video)</span>
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*,video/*"
                multiple
                class="hidden"
                @change="handleFileSelect"
              />
              <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-600">Click or drag files to upload</p>
              <p class="text-xs text-gray-400 mt-1">Images: JPG, PNG, GIF, WebP • Video: MP4, WebM (max 10MB each)</p>
            </div>

            <!-- Preview -->
            <div v-if="mediaFiles.length > 0" class="flex flex-wrap gap-2 mt-3">
              <div
                v-for="(file, idx) in mediaFiles"
                :key="idx"
                class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  v-if="file.type.startsWith('image/')"
                  :src="getPreviewUrl(file)"
                  alt="Preview"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <button
                  type="button"
                  @click.stop="removeFile(idx)"
                  class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <div
          v-if="statusMessage"
          class="mt-4 p-3 rounded-md"
          :class="statusType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ statusMessage }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="props.onClose"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Complaint' }}
          </button>
        </div>
      </form>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'
import { useComplaintsData } from '~/composables/useComplaintsData'

const props = defineProps<{
  onClose: () => void
  onCreated: () => void
}>()

const { createComplaint } = useComplaintsData()

const form = reactive({
  title: '',
  description: '',
  type: 'private' as 'private' | 'public',
})

const mediaFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const previewUrls = new Map<File, string>()

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addFiles(Array.from(input.files))
  }
  // Reset input
  input.value = ''
}

function handleDrop(event: DragEvent) {
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

function addFiles(files: File[]) {
  const imageCount = mediaFiles.value.filter(f => f.type.startsWith('image/')).length
  const videoCount = mediaFiles.value.filter(f => f.type.startsWith('video/')).length

  for (const file of files) {
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      statusMessage.value = 'Only images and videos are allowed'
      statusType.value = 'error'
      continue
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      statusMessage.value = 'File size must be less than 10MB'
      statusType.value = 'error'
      continue
    }

    // Validate counts
    if (file.type.startsWith('image/')) {
      if (imageCount + mediaFiles.value.filter(f => f.type.startsWith('image/')).length >= 2) {
        statusMessage.value = 'Maximum 2 images allowed'
        statusType.value = 'error'
        continue
      }
    } else if (file.type.startsWith('video/')) {
      if (videoCount + mediaFiles.value.filter(f => f.type.startsWith('video/')).length >= 1) {
        statusMessage.value = 'Maximum 1 video allowed'
        statusType.value = 'error'
        continue
      }
    }

    mediaFiles.value.push(file)
  }
}

function removeFile(idx: number) {
  const file = mediaFiles.value[idx]
  if (file) {
    const url = previewUrls.get(file)
    if (url) {
      URL.revokeObjectURL(url)
      previewUrls.delete(file)
    }
  }
  mediaFiles.value.splice(idx, 1)
}

function getPreviewUrl(file: File) {
  if (!previewUrls.has(file)) {
    previewUrls.set(file, URL.createObjectURL(file))
  }
  return previewUrls.get(file)
}

async function submit() {
  if (!form.title.trim() || !form.description.trim()) {
    statusMessage.value = 'Please fill in all required fields'
    statusType.value = 'error'
    return
  }

  isSubmitting.value = true
  statusMessage.value = ''

  try {
    await createComplaint({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      media: mediaFiles.value.length > 0 ? mediaFiles.value : undefined,
    })

    statusMessage.value = 'Complaint submitted successfully!'
    statusType.value = 'success'

    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    previewUrls.clear()

    setTimeout(() => {
      props.onCreated()
    }, 1000)
  } catch (err: any) {
    statusMessage.value = err?.data?.statusMessage || err?.message || 'Failed to submit complaint'
    statusType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(() => {
  // Clean up preview URLs
  previewUrls.forEach(url => URL.revokeObjectURL(url))
})
</script>
