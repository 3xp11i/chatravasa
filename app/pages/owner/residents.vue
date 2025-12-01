<!--
  FILE: app/pages/owner/residents.vue
  PURPOSE: Owner page to manage residents - list, add, edit, delete.
  TODO:
    - Display list of all residents using ResidentListItem
    - Add new resident form (AddResidentForm)
    - Edit/delete resident actions
    - Search/filter residents
-->
<template>
  <div class="residents-page">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manage Residents</h1>
      <button
        @click="showAddForm = !showAddForm"
        class="bg-primary text-white px-4 py-2 rounded-lg"
      >
        {{ showAddForm ? 'Cancel' : '+ Add Resident' }}
      </button>
    </div>
    
    <!-- Add Resident Form (collapsible) -->
    <div v-if="showAddForm" class="card mb-6">
      <AddResidentForm @resident-added="handleResidentAdded" />
    </div>
    
    <!-- Search/Filter -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or phone..."
        class="w-full px-4 py-2 border rounded-lg"
      />
    </div>
    
    <!-- Residents List -->
    <div class="space-y-3">
      <ResidentListItem
        v-for="resident in filteredResidents"
        :key="resident.id"
        :resident="resident"
        @edit="handleEdit"
        @delete="handleDelete"
      />
      
      <p v-if="filteredResidents.length === 0" class="text-center text-gray-500 py-8">
        No residents found
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// FILE: app/pages/owner/residents.vue
// PURPOSE: Resident management page

definePageMeta({
  layout: 'owner',
  middleware: ['role-owner'],
})

// State
const showAddForm = ref(false)
const searchQuery = ref('')

// Placeholder residents data
const residents = ref([
  { id: '1', phone: '+91 98765 43210', fullName: 'John Doe', roomNumber: '101', role: 'resident' as const, isVerified: true },
  { id: '2', phone: '+91 98765 43211', fullName: 'Jane Smith', roomNumber: '102', role: 'resident' as const, isVerified: true },
  { id: '3', phone: '+91 98765 43212', fullName: 'Bob Wilson', roomNumber: '103', role: 'resident' as const, isVerified: false, accessCode: '123456' },
  { id: '4', phone: '+91 98765 43213', fullName: 'Chef Kumar', roomNumber: '', role: 'cook' as const, isVerified: true },
])

// Computed
const filteredResidents = computed(() => {
  if (!searchQuery.value) return residents.value
  
  const query = searchQuery.value.toLowerCase()
  return residents.value.filter(r => 
    r.fullName.toLowerCase().includes(query) ||
    r.phone.includes(query)
  )
})

// Methods
function handleResidentAdded(data: any) {
  console.log('Resident added:', data)
  // TODO: Add to list or refresh from API
  residents.value.push({
    id: Date.now().toString(),
    ...data,
    isVerified: false,
  })
  showAddForm.value = false
}

function handleEdit(resident: any) {
  console.log('Edit resident:', resident)
  // TODO: Open edit modal or navigate to edit page
}

function handleDelete(resident: any) {
  if (confirm(`Are you sure you want to delete ${resident.fullName}?`)) {
    console.log('Delete resident:', resident)
    // TODO: Call API to delete
    residents.value = residents.value.filter(r => r.id !== resident.id)
  }
}
</script>
