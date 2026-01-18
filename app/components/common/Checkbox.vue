<template>
  <div class="checkbox-wrapper">
    <label :for="id" class="checkbox-label">
      <input :id="id" type="checkbox" :checked="modelValue" class="checkbox-input" @change="handleChange"
        v-bind="$attrs" />
      <span class="checkbox-custom"></span>
      <span class="label-text">{{ label }}</span>
      <span v-if="tooltipText" class="help-icon" @mouseenter="showTooltip" @mouseleave="hideTooltip"
        @click="toggleTooltip">?</span>
    </label>
    <div v-if="isTooltipVisible" class="tooltip multi-line">
      {{ tooltipText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  id: string;
  label: string;
  modelValue: boolean;
  tooltipText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isTooltipVisible = ref(false);
const hasTooltip = computed(() => !!props.tooltipText);

const showTooltip = () => {
  isTooltipVisible.value = true;
};

const hideTooltip = () => {
  isTooltipVisible.value = false;
};

const toggleTooltip = () => {
  isTooltipVisible.value = !isTooltipVisible.value;
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<style scoped>
.checkbox-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  background-color: white;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-input:checked~.checkbox-custom {
  background-color: var(--color-primary-background);
  border-color: var(--color-primary-background);
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked~.checkbox-custom:after {
  display: block;
}

.checkbox-input:focus~.checkbox-custom {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}

.label-text {
  font-size: 0.9rem;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 8px;
  background-color: var(--color-primary-background);
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  cursor: help;
}

.help-icon:hover {
    background-color: #0056b3;
    cursor: help;
}

.tooltip {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 8px;
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  z-index: 10;
  max-width: 300px;
  width: max-content;
}

.tooltip.multi-line {
  white-space: normal;
  line-height: 1.4;
}

.tooltip:hover {
  cursor: help;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 16px;
  border: 6px solid transparent;
  border-bottom-color: #333;
}

@media (max-width: 640px) {
  .tooltip {
    max-width: calc(100vw - 32px);
    width: auto;
  }
}
</style>