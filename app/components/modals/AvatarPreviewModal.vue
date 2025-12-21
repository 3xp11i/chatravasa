<template>
  <VueFinalModal class="flex items-center justify-center" :click-to-close="false">
    <div class="card bg-white rounded-lg shadow-lg p-6 w-[92vw] mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <h3 class="text-xl font-bold mb-4">Confirm Avatar</h3>

      <!-- Preview Image -->
      <div class="mb-6 relative">
        <img
          :src="previewUrl"
          alt="Avatar Preview"
          class="w-full h-64 object-cover rounded-lg border-2 border-primary"
        />
        <!-- Loading overlay on image -->
        <div
          v-if="uploading"
          class="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-primary"></div>
            <p class="text-white text-sm font-medium">Uploading...</p>
          </div>
        </div>
      </div>

      <!-- File Info -->
      <div class="mb-6 space-y-2 text-sm">
        <p class="text-text-muted">
          <strong>Filename:</strong> {{ file.name }}
        </p>
        <p class="text-text-muted">
          <strong>File Size:</strong> {{ formatFileSize(file.size) }}
        </p>
        <p class="text-text-muted">
          <strong>Dimensions:</strong> {{ imageDimensions }}
        </p>
      </div>


      <!-- Error Message -->
      <p v-if="errorMessage" class="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
        {{ errorMessage }}
      </p>

      <!-- Success Message -->
      <p v-if="successMessage" class="text-green-600 text-sm mb-4 p-2 bg-green-50 rounded flex items-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ successMessage }}
      </p>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <!-- Confirm Button -->
        <button
          type="button"
          class="flex-1 bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          @click="handleConfirm"
          :disabled="uploading"
        >
          <svg v-if="!uploading" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          <span v-if="!uploading">Upload Avatar</span>
          <span v-else class="flex items-center gap-2">
            <span class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            Uploading...
          </span>
        </button>

        <!-- Cancel Button -->
        <button
          type="button"
          class="flex-1 border-2 border-primary text-primary font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('close')"
          :disabled="uploading"
        >
          Cancel
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

interface Props {
  file: File
  previewUrl: string
  status?: 'idle' | 'uploading' | 'success' | 'error'
  statusMessage?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [file: File]
}>()

const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const imageDimensions = ref('Loading...')

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getImageDimensions = () => {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      imageDimensions.value = `${img.width} x ${img.height} px`
      resolve()
    }
    img.onerror = () => {
      imageDimensions.value = 'Unable to determine'
      resolve()
    }
    img.src = props.previewUrl
  })
}

const handleConfirm = async () => {
  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    emit('confirm', props.file)
    // Parent handles closing the modal on success.
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred'
    uploading.value = false
  }
}

// React to parent-provided status to show success/error and auto-close
watch(
  () => props.status,
  (newStatus) => {
    if (!newStatus) return
    if (newStatus === 'uploading') {
      uploading.value = true
      errorMessage.value = ''
      successMessage.value = ''
    } else if (newStatus === 'success') {
      uploading.value = false
      errorMessage.value = ''
      successMessage.value = props.statusMessage || 'Profile picture updated successfully!'
      setTimeout(() => {
        emit('close')
      }, 1200)
    } else if (newStatus === 'error') {
      uploading.value = false
      successMessage.value = ''
      errorMessage.value = props.statusMessage || 'Failed to upload avatar.'
    } else {
      uploading.value = false
      errorMessage.value = ''
      successMessage.value = ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  getImageDimensions()
})
</script>
