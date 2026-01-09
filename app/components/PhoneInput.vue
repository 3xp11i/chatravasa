<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium mb-1" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="flex items-center">
      <span class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md" :class="prefixClass">
        +91
      </span>
      <input
        :id="inputId"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value.replace(/\D/g, '').slice(0, 10))"
        type="tel"
        :inputmode="inputmode"
        :placeholder="placeholder || 'Enter 10 digit number'"
        :maxlength="10"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary',
          'transition-colors duration-200',
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white',
          inputClass
        ]"
      />
    </div>
    <p v-if="hint" class="text-xs text-gray-500 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    inputmode?: 'tel' | 'numeric' | 'decimal'
    inputId?: string
    labelClass?: string
    prefixClass?: string
    inputClass?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Enter 10 digit number',
    hint: 'Enter 10 digit mobile number',
    disabled: false,
    required: false,
    inputmode: 'tel',
    inputId: 'phone-input',
    labelClass: 'text-gray-700 dark:text-gray-300',
    prefixClass: 'text-gray-700 bg-gray-100 border border-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600',
    inputClass: 'border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'complete': [value: string] // Emitted when 10 digits are entered
  'change': [value: string]
}>()

// Watch for when 10 digits are complete
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal.length === 10) {
      emit('complete', `+91${newVal}`)
    }
  }
)

// Provide full phone number as a computed property that parent can access
const fullPhoneNumber = computed(() => {
  return props.modelValue ? `+91${props.modelValue}` : ''
})

// Expose the full phone number
defineExpose({
  fullPhoneNumber
})
</script>
