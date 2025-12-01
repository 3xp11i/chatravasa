<!--
  FILE: app/components/owner/ResidentListItem.vue
  PURPOSE: Display a single resident in the owner's resident list with actions.
  TODO:
    - Show resident info (name, phone, room, role, verification status)
    - Actions: edit, delete, regenerate access code, view meals
    - Show access code if not yet verified
-->
<template>
  <div class="resident-list-item flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
    <!-- Resident Info -->
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
        {{ resident.fullName?.charAt(0) || '?' }}
      </div>
      
      <div>
        <p class="font-medium">{{ resident.fullName }}</p>
        <p class="text-sm text-gray-500">{{ resident.phone }} • Room {{ resident.roomNumber || 'N/A' }}</p>
        
        <!-- Status badges -->
        <div class="flex gap-2 mt-1">
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              resident.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            ]"
          >
            {{ resident.isVerified ? 'Verified' : 'Pending' }}
          </span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {{ resident.role }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Show access code if not verified -->
      <span v-if="!resident.isVerified && resident.accessCode" class="text-sm font-mono text-gray-600">
        Code: {{ resident.accessCode }}
      </span>
      
      <!-- Action buttons -->
      <button
        @click="$emit('edit', resident)"
        class="p-2 text-blue-600 hover:bg-blue-50 rounded"
        title="Edit"
      >
        ✏️
      </button>
      <button
        @click="$emit('delete', resident)"
        class="p-2 text-red-600 hover:bg-red-50 rounded"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/owner/ResidentListItem.vue
// PURPOSE: Display resident item in owner's list

interface Resident {
  id: string
  phone: string
  fullName: string
  roomNumber?: string
  role: 'resident' | 'cook' | 'owner'
  isVerified: boolean
  accessCode?: string
}

defineProps<{
  resident: Resident
}>()

defineEmits<{
  (e: 'edit', resident: Resident): void
  (e: 'delete', resident: Resident): void
}>()
</script>

<style scoped>
.resident-list-item {
  transition: box-shadow 0.2s;
}
.resident-list-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
