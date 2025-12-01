<!--
  FILE: app/components/resident/MealToggle.vue
  PURPOSE: Toggle switch for a single meal (breakfast/lunch/dinner) for a specific date.
  TODO:
    - Accept props: mealType ('breakfast'|'lunch'|'dinner'), date, initialValue
    - Emit toggle events to parent
    - Show disabled state if past cutoff time
    - Visual feedback for on/off state
-->
<template>
  <div class="meal-toggle flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
    <div class="flex items-center gap-3">
      <!-- Meal Icon (placeholder) -->
      <span class="text-2xl">{{ mealIcon }}</span>
      <div>
        <p class="font-medium">{{ mealLabel }}</p>
        <p class="text-xs text-gray-500">{{ cutoffText }}</p>
      </div>
    </div>
    
    <!-- Toggle Switch -->
    <button
      @click="handleToggle"
      :disabled="isDisabled"
      :class="[
        'toggle-switch w-14 h-8 rounded-full transition-colors duration-200',
        isEnabled ? 'bg-green-500' : 'bg-gray-300',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <span
        :class="[
          'block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200',
          isEnabled ? 'translate-x-7' : 'translate-x-1'
        ]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
// FILE: app/components/resident/MealToggle.vue
// PURPOSE: Individual meal toggle component

interface Props {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  date: string // ISO date string
  initialValue?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: true,
  disabled: false
})

const emit = defineEmits<{
  (e: 'toggle', value: boolean): void
}>()

// Local state
const isEnabled = ref(props.initialValue)

// Computed properties
const mealIcon = computed(() => {
  const icons = {
    breakfast: '🍳',
    lunch: '🍛',
    dinner: '🍽️'
  }
  return icons[props.mealType]
})

const mealLabel = computed(() => {
  return props.mealType.charAt(0).toUpperCase() + props.mealType.slice(1)
})

const cutoffText = computed(() => {
  // TODO: Calculate actual cutoff time based on config
  const cutoffs = {
    breakfast: '7:00 AM',
    lunch: '11:00 AM',
    dinner: '6:00 PM'
  }
  return `Cutoff: ${cutoffs[props.mealType]}`
})

const isDisabled = computed(() => {
  // TODO: Check if current time is past cutoff for this meal
  return props.disabled
})

// Methods
function handleToggle() {
  if (isDisabled.value) return
  
  isEnabled.value = !isEnabled.value
  emit('toggle', isEnabled.value)
  
  // TODO: Call API to update meal selection
  // useMeals().updateMeal(props.date, props.mealType, isEnabled.value)
}

// Watch for prop changes
watch(() => props.initialValue, (newVal) => {
  isEnabled.value = newVal
})
</script>

<style scoped>
.toggle-switch {
  position: relative;
}
</style>
