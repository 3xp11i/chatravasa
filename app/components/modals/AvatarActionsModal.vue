<template>
  <VueFinalModal 
    class="flex items-center justify-center px-4" 
    @click-outside="emit('close')"
    :lock-scroll="true">
    <div class="card bg-white rounded-lg shadow-lg p-6 w-full max-w-sm overflow-x-hidden">
      <h3 class="text-lg font-semibold mb-4">Profile picture</h3>

      <div class="space-y-3">
        <button
          type="button"
          class="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          @click="emit('upload')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
          <span>Upload new photo</span>
        </button>

        <button
          v-if="hasAvatar"
          type="button"
          class="w-full border border-red-500 text-red-600 font-medium py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="emit('remove')"
          :disabled="removing"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-10a1 1 0 10-1-1l-2 2-2-2a1 1 0 10-1 1l2 2-2 2a1 1 0 101 1l2-2 2 2a1 1 0 001-1l-2-2 2-2z" clip-rule="evenodd" />
          </svg>
          <span v-if="!removing">Remove current photo</span>
          <span v-else>Removing...</span>
        </button>

        <button
          type="button"
          class="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from 'vue-final-modal'

interface Props {
  hasAvatar: boolean
  removing?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  upload: []
  remove: []
}>()
</script>
