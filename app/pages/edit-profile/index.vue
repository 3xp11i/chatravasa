<template>
  <div class="min-h-screen bg-background text-text px-4 py-8">
    <div class="mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div class="card">
          <div class="h-32 bg-gray-200 rounded animate-shimmer mb-6"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-200 rounded animate-shimmer"></div>
            <div class="h-6 bg-gray-200 rounded animate-shimmer w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="userProfile" class="space-y-6">
        <!-- Page Title -->
        <div>
          <h1 class="text-3xl font-bold mb-2">Edit Profile</h1>
          <p class="text-text-muted">
            {{ isAdmin ? 'Manage your admin account details' : 'View your profile information' }}
          </p>
        </div>

        <!-- Profile Card -->
        <div class="card">
          <div class="flex flex-col items-center mb-8">
            <!-- Avatar Section -->
            <div class="relative mb-6">
              <div class="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center overflow-hidden">
                <img
                  v-if="userProfile.avatar"
                  :src="userProfile.avatar"
                  alt="Profile Avatar"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-4xl text-white font-bold">
                  {{ getInitials() }}
                </span>
              </div>
              
              <!-- Avatar Actions Button -->
              <button
                type="button"
                class="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg"
                @click="openAvatarActionsModal"
                aria-label="Manage profile photo"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 13.5V16h2.5l7.372-7.372-2.5-2.5L4 13.5zm11.854-6.646a.5.5 0 000-.708l-2-2a.5.5 0 00-.708 0l-1.043 1.043 2.5 2.5 1.251-1.251z" />
                </svg>
              </button>

              <!-- Hidden File Input -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>

            <!-- Name Display -->
            <h2 class="text-2xl font-bold text-center">
              {{ userProfile.first_name }} {{ userProfile.last_name }}
            </h2>
            <p class="text-text-muted text-center mt-2">
              {{ isAdmin ? 'Admin Account' : 'Resident Account' }}
            </p>
          </div>

          <!-- Role Badge Info -->
          <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm text-blue-800">
              <strong>Account Type:</strong> {{ isAdmin ? 'Administrator' : 'Resident' }}
            </p>
          </div>

          <!-- Form Section -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- First Name Field -->
            <div class="form-group">
              <label for="firstName" class="font-medium block mb-2">First Name</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                placeholder="Enter first name"
                :disabled="!isAdmin || submitting"
                class="w-full"
              />
              <p v-if="errors.firstName" class="text-red-600 text-sm mt-1">
                {{ errors.firstName }}
              </p>
            </div>

            <!-- Last Name Field -->
            <div class="form-group">
              <label for="lastName" class="font-medium block mb-2">Last Name</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                placeholder="Enter last name"
                :disabled="!isAdmin || submitting"
                class="w-full"
              />
              <p v-if="errors.lastName" class="text-red-600 text-sm mt-1">
                {{ errors.lastName }}
              </p>
            </div>

            <!-- Phone Number Field (Disabled) -->
            <div class="form-group">
              <label for="phone" class="font-medium block mb-2">Phone Number</label>
              <input
                id="phone"
                :value="userProfile.phone"
                type="tel"
                disabled
                class="w-full bg-gray-50 cursor-not-allowed"
              />
              <p class="text-text-muted text-xs mt-1">
                Phone number is linked to your authentication and cannot be changed here. Contact support if you need to update it.
              </p>
            </div>

            <!-- Account Created Date -->
            <div class="form-group">
              <label for="createdAt" class="font-medium block mb-2">Member Since</label>
              <input
                id="createdAt"
                :value="formatDate(userProfile.created_at)"
                type="text"
                disabled
                class="w-full bg-gray-50 cursor-not-allowed"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <!-- Save Button (Admin Only) -->
              <button
                v-if="isAdmin"
                type="submit"
                class="flex-1 bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="submitting || !hasChanges"
              >
                <span v-if="!submitting">Save Changes</span>
                <span v-else>Saving...</span>
              </button>

              <!-- Cancel Button -->
              <button
                type="button"
                class="flex-1 border-2 border-primary text-primary font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
                @click="resetForm"
              >
                {{ isAdmin && hasChanges ? 'Cancel' : 'Back' }}
              </button>
            </div>

            <!-- Success Message -->
            <p v-if="successMessage" class="text-green-600 text-center font-medium mt-4">
              ✓ {{ successMessage }}
            </p>

            <!-- Error Message -->
            <p v-if="errorMessage" class="text-red-600 text-center font-medium mt-4">
              {{ errorMessage }}
            </p>
          </form>
        </div>

        <!-- Info Box for Residents -->
        <div v-if="!isAdmin" class="card bg-blue-50 border border-blue-200">
          <h3 class="font-semibold text-blue-900 mb-2">📝 Info</h3>
          <p class="text-sm text-blue-800">
            Your profile information is managed by the hostel administration. To update your details other than your profile picture, please contact the admin.
          </p>
        </div>

        <!-- Info Box for Admins -->
        <div v-if="isAdmin" class="card bg-gray-50 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">💡 Note</h3>
          <p class="text-sm text-gray-700">
            You can update your profile picture by clicking the camera icon above. Phone number updates will be handled separately for security reasons.
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="card bg-red-50 border border-red-200">
        <p class="text-red-800 font-medium mb-4">{{ error || 'Unable to load profile information.' }}</p>
        <button
          type="button"
          class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          @click="retryFetch"
          :disabled="loading"
        >
          {{ loading ? 'Retrying...' : 'Retry' }}
        </button>
        <p class="text-red-700 text-xs mt-2">Check the browser console (F12) for detailed error information.</p>
      </div>
    </div>

    <ModalsContainer />

    
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent } from 'vue'
import { ModalsContainer, useModal } from 'vue-final-modal'
import type { Database } from '~/types/database.types'

definePageMeta({
  layout: 'default',
  name: 'edit-profile',
})

const { userProfile, isAdmin, loading, error, updateProfile, uploadAvatar, removeAvatar } = useCurrentUser()

const fileInput = ref<HTMLInputElement | null>(null)
const submitting = ref(false)
const uploadingAvatar = ref(false)
const removingAvatar = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const uploadStatusMessage = ref('')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const retryFetch = async () => {
  // Re-trigger the profile fetch by calling it directly
  const { fetchUserProfile } = useCurrentUser()
  await fetchUserProfile()
}

const formData = ref({
  firstName: '',
  lastName: '',
})

const errors = ref({
  firstName: '',
  lastName: '',
})

const originalFormData = ref({
  firstName: '',
  lastName: '',
})

const hasChanges = computed(() => {
  return (
    formData.value.firstName !== originalFormData.value.firstName ||
    formData.value.lastName !== originalFormData.value.lastName
  )
})

onMounted(() => {
  // Watch for userProfile changes and populate form
  const stopWatching = watch(userProfile, (newProfile) => {
    if (newProfile) {
      formData.value.firstName = newProfile.first_name || ''
      formData.value.lastName = newProfile.last_name || ''
      originalFormData.value.firstName = newProfile.first_name || ''
      originalFormData.value.lastName = newProfile.last_name || ''
    }
  }, { immediate: true })

  onUnmounted(() => stopWatching())
})

const getInitials = () => {
  if (!userProfile.value) return 'U'
  const first = userProfile.value.first_name?.charAt(0) || ''
  const last = userProfile.value.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read the file'))
    reader.readAsDataURL(file)
  })
}

const loadImageFromDataUrl = (dataUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for processing'))
    img.src = dataUrl
  })
}

const cropImageToSquare = async (file: File) => {
  const dataUrl = await readFileAsDataUrl(file)
  const image = await loadImageFromDataUrl(dataUrl)

  // If already square, keep original
  if (image.width === image.height) {
    return { croppedFile: file, previewUrl: dataUrl }
  }

  const side = Math.min(image.width, image.height)
  const startX = (image.width - side) / 2
  const startY = (image.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas is not supported in this browser')
  }

  ctx.drawImage(image, startX, startY, side, side, 0, 0, side, side)

  const targetType = file.type || 'image/jpeg'

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) return resolve(result)
        reject(new Error('Unable to process image'))
      },
      targetType,
      targetType === 'image/jpeg' ? 0.92 : undefined
    )
  })

  const croppedFile = new File([blob], file.name, { type: blob.type })
  const previewUrl = URL.createObjectURL(blob)

  return { croppedFile, previewUrl }
}

const handleImageSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  errorMessage.value = ''
  successMessage.value = ''

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errorMessage.value = 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
    return
  }

  try {
    const { croppedFile, previewUrl: processedPreviewUrl } = await cropImageToSquare(file)

    previewUrl.value = processedPreviewUrl
    selectedFile.value = croppedFile

    // Open modal for preview
    const { open: openPreviewModal, close: closePreviewModal } = useModal({
      component: defineAsyncComponent(() => import('~/components/modals/AvatarPreviewModal.vue')),
      attrs: {
        file: croppedFile,
        previewUrl: previewUrl.value,
        status: uploadStatus,
        statusMessage: uploadStatusMessage,
        onClose: () => {
          closePreviewModal()
          const previousPreview = previewUrl.value
          selectedFile.value = null
          previewUrl.value = ''
          uploadStatus.value = 'idle'
          uploadStatusMessage.value = ''
          if (previousPreview && previousPreview.startsWith('blob:')) {
            URL.revokeObjectURL(previousPreview)
          }
          // Reset file input
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        },
        onConfirm: handleAvatarConfirm,
      },
    })
    modalInstance = { close: closePreviewModal }
    openPreviewModal()
  } catch (err: any) {
    console.error('Image processing error:', err)
    errorMessage.value = err.message || 'Failed to process image. Please try another file.'
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleAvatarConfirm = async (file: File) => {
  uploadingAvatar.value = true
  errorMessage.value = ''
  successMessage.value = ''
  uploadStatus.value = 'uploading'
  uploadStatusMessage.value = ''

  try {
    await uploadAvatar(file)

    // Inform modal of success; it will show message and auto-close
    uploadStatusMessage.value = 'Profile picture uploaded successfully!'
    uploadStatus.value = 'success'

    // Reset file input and local state
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    selectedFile.value = null
    previewUrl.value = ''
  } catch (err: any) {
    console.error('Avatar upload error:', err)
    uploadStatusMessage.value = err.message || 'Failed to upload avatar. Please try again.'
    uploadStatus.value = 'error'
  } finally {
    uploadingAvatar.value = false
  }
}

const handleRemoveAvatar = async () => {
  if (!userProfile.value?.avatar) return

  const confirmed = window.confirm('Remove your profile picture?')
  if (!confirmed) return

  removingAvatar.value = true
  errorMessage.value = ''
  successMessage.value = ''
  uploadStatus.value = 'idle'
  uploadStatusMessage.value = ''

  try {
    await removeAvatar()
    successMessage.value = 'Profile picture removed.'

    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = ''
    selectedFile.value = null

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err: any) {
    console.error('Avatar removal error:', err)
    errorMessage.value = err.message || 'Failed to remove avatar. Please try again.'
  } finally {
    removingAvatar.value = false
  }
}

let modalInstance: any = null
let actionsModalInstance: any = null

const openAvatarActionsModal = () => {
  const { open, close } = useModal({
    component: defineAsyncComponent(() => import('~/components/modals/AvatarActionsModal.vue')),
    attrs: {
      hasAvatar: !!userProfile.value?.avatar,
      removing: removingAvatar,
      onUpload: () => {
        close()
        actionsModalInstance = null
        triggerFileInput()
      },
      onRemove: async () => {
        await handleRemoveAvatar()
        close()
        actionsModalInstance = null
      },
      onClose: () => {
        close()
        actionsModalInstance = null
      },
    },
  })

  actionsModalInstance = { close }
  open()
}

const validateForm = () => {
  errors.value = { firstName: '', lastName: '' }

  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }

  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }

  return !errors.value.firstName && !errors.value.lastName
}

const handleSubmit = async () => {
  if (!isAdmin.value) return

  if (!validateForm()) {
    return
  }

  if (!hasChanges.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateProfile(formData.value.firstName, formData.value.lastName)
    
    successMessage.value = 'Profile updated successfully!'
    originalFormData.value.firstName = formData.value.firstName
    originalFormData.value.lastName = formData.value.lastName
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update profile. Please try again.'
    console.error('Profile update error:', err)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (isAdmin.value && hasChanges.value) {
    formData.value.firstName = originalFormData.value.firstName
    formData.value.lastName = originalFormData.value.lastName
  } else {
    navigateTo('/')
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

.animate-slide-out {
  animation: slideOut 0.3s ease-in;
}

.form-group {
  display: flex;
  flex-direction: column;
}
</style>