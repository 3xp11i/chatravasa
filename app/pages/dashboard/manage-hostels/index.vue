<template>
  <div class="manage-hostels-container">
    <div class="header">
      <h1 class="text-3xl font-bold">Manage Your Hostels</h1>
      <NuxtLink to="/dashboard/add-hostel" class="btn-primary">
        + Add Hostel
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading your hostels...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="text-red-600">{{ error }}</p>
      <button @click="fetchHostels()" class="btn-secondary mt-4">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="hostels.length === 0" class="empty-state">
      <div class="empty-content">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <h2 class="text-xl font-semibold mt-4">No hostels yet</h2>
        <p class="text-gray-600 mt-2">Get started by adding your first hostel</p>
        <NuxtLink to="/dashboard/add-hostel" class="btn-primary mt-6 inline-block">
          Add Your First Hostel
        </NuxtLink>
      </div>
    </div>

    <!-- Hostels Grid -->
    <div v-else class="hostels-grid">
      <div v-for="hostel in hostels" :key="hostel.id" class="hostel-card">
        <div class="card-content">
          <div class="card-header">
            <h3 class="hostel-name">{{ hostel.hostel_name }}</h3>
            <!-- <span class="hostel-id">#{{ hostel.id }}</span> -->
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>{{ hostel.address }}</span>
            </div>
            
            <div class="info-row">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Total Rooms: {{ hostel.total_rooms }}</span>
            </div>
            
            <div class="info-row">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Available: {{ hostel.available_rooms ?? hostel.total_rooms }}</span>
            </div>
          </div>

          <div class="card-footer">
            <NuxtLink :to="`/dashboard/hostels/${hostel.hostel_slug}`" class="btn-view">
              View Details
            </NuxtLink>
            <button @click="deleteHostel(hostel.id)" class="btn-delete">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.totalPages"
        class="pagination-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Database } from '@/types/database.types';

type Hostel = Database['public']['Tables']['hostels']['Row'];

const route = useRoute()
const navigationStore = useNavigationStore()
const pageKey = computed(() => route.path)
const currentPage = ref(navigationStore.getLastPage(pageKey.value));
const pageSize = 10;

const { data: hostelData, pending: loading, error: fetchError, refresh } = useAsyncData(
  () => `hostels-page-${currentPage.value}`,
  () => $fetch('/api/manage-hostel/get-hostels', {
    method: 'GET',
    query: {
      page: currentPage.value,
      pageSize: pageSize,
    },
  }),
  {
    watch: [currentPage],
    getCachedData: (key) => useNuxtApp().payload.data[key] || useNuxtApp().static.data[key],
  }
);

// Explicitly name the refresh function for template usage
const fetchHostels = refresh;

const hostels = computed(() => hostelData.value?.hostels || []);
const pagination = computed(() => hostelData.value?.pagination || {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
});
const error = computed(() => fetchError.value ? 'Failed to load hostels' : '');

async function deleteHostel(hostelId: number) {
  if (!confirm('Are you sure you want to delete this hostel?')) {
    return;
  }

  try {
    const response = await $fetch('/api/manage-hostel/delete-hostel', {
      method: 'DELETE',
      query: { id: hostelId },
    });

    if (response.success) {
      alert('Hostel deleted successfully');
      await fetchHostels();
    }
  } catch (err: any) {
    console.error('Error deleting hostel:', err);
    alert(err.data?.statusMessage || 'Failed to delete hostel');
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage;
  navigationStore.saveLastPage(pageKey.value, newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<style scoped>
.manage-hostels-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-primary {
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #059669;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  color: #9ca3af;
}

.hostels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hostel-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.hostel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.hostel-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.hostel-id {
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
}

.info-row .icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: #10b981;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-view {
  flex: 1;
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-view:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  font-weight: 500;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background-color: #f3f4f6;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>