<template>
  <div class="add-hostel-container">
    <h1 class="text-2xl font-bold mb-6">{{ t('addNewHostel') }}</h1>
    <form class="hostel-form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="hostelName">{{ t('hostelName') }} <span class="required">*</span></label>
        <input 
          type="text" 
          id="hostelName" 
          v-model="formData.hostelName" 
          :placeholder="t('enterHostelName')"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="address">{{ t('address') }} <span class="required">*</span></label>
        <textarea 
          id="address" 
          v-model="formData.address" 
          :placeholder="t('enterAddress')"
          rows="3"
          required
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="totalRooms">{{ t("totalRooms") }} <span class="required">*</span></label>
          <input 
            type="number" 
            id="totalRooms" 
            v-model.number="formData.totalRooms" 
            placeholder="0"
            min="1"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="availableRooms">{{ t('availableRooms') }}</label>
          <input 
            type="number" 
            id="availableRooms" 
            v-model.number="formData.availableRooms" 
            :placeholder="t('sameAsTotal')"
            min="0"
            :max="formData.totalRooms"
          />
          <small class="text-gray-500">{{ t('leaveEmptyTotal') }}</small>
        </div>
      </div>
      
      <div class="form-group">
        <label for="hostelPhoto">{{ t('hostelPhoto') }}</label>
        <input 
          type="file" 
          id="hostelPhoto" 
          @change="e => formData.hostelPhoto = (e.target as HTMLInputElement)?.files?.[0] ?? null" 
          accept="image/*"
        />
        <small class="text-gray-500">{{ t('uploadHostelPhoto') }}</small>
      </div>
      
      <button class="btn-submit" type="submit" :disabled="loading">
        {{ loading ? t('addingHostel') : t('addHostel') }}
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import type { Database } from '@/types/database.types';

type HostelInsert = Database['public']['Tables']['hostels']['Insert'];

const formData = ref({
  hostelName: '',
  address: '',
  totalRooms: 0,
  availableRooms: null as number | null,
  hostelPhoto: null as File | null,
});

const valuesValidator = computed(() => {
  return {
    hostelName: formData.value.hostelName.trim().length > 0,
    address: formData.value.address.trim().length > 0,
    totalRooms: formData.value.totalRooms > 0,
    availableRooms: formData.value.availableRooms === null || 
                    (formData.value.availableRooms >= 0 && formData.value.availableRooms <= formData.value.totalRooms),
  };
});

const loading = ref(false);
const router = useRouter();

async function submitForm() {
  const isValid = Object.values(valuesValidator.value).every(v => v);
  if (!isValid) {
    alert(t('fillRequiredFields'));
    return;
  }

  loading.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('hostelName', formData.value.hostelName);
    formDataToSend.append('hostelLocation', formData.value.address);
    formDataToSend.append('numberOfRooms', formData.value.totalRooms.toString());
    
    // Add available rooms if specified
    if (formData.value.availableRooms !== null) {
      formDataToSend.append('availableRooms', formData.value.availableRooms.toString());
    }
    
    // Add photo if provided
    if (formData.value.hostelPhoto) {
      formDataToSend.append('hostelPhoto', formData.value.hostelPhoto);
    }

    const response = await $fetch('/api/manage-hostel/add-hostel', {
      method: 'POST',
      body: formDataToSend,
    });

    if (response.success) {
      alert(t('hostelAdded'));
      // Reset form
      formData.value = {
        hostelName: '',
        address: '',
        totalRooms: 0,
        availableRooms: null,
        hostelPhoto: null,
      };
      // Reset file input
      const fileInput = document.getElementById('hostelPhoto') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Navigate to manage hostels page
      await router.push('/dashboard/manage-hostels');
    }
  } catch (error: any) {
    console.error('Error adding hostel:', error);
    alert(t('failedAddHostel'));
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.add-hostel-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hostel-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group small {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-submit {
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #059669;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>