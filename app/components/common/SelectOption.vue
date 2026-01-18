<template>
    <div class="select-wrapper">
        <label :for="id">
            {{ label }}
            <span v-if="hasTooltip" class="help-icon" @click="toggleTooltip" @mouseenter="showTooltip"
                @mouseleave="hideTooltip">?</span>
        </label>
        <select :id="id" :value="modelValue" @change="handleChange" v-bind="$attrs">
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <div v-if="isTooltipVisible" class="tooltip multi-line">
            ❔ {{ tooltipText }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Option {
    value: string | number;
    label: string;
}

const props = defineProps<{
    id: string;
    label: string;
    modelValue: string | number;
    options: Option[];
    tooltipText?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
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
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.select-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

label {
    margin-bottom: 5px;
}

select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.help-icon {
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    border-radius: 50%;
    background-color: var(--color-primary-background);
    color: white;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    margin-left: 5px;
    position: relative;
    bottom: 2px;
}

.help-icon:hover {
    background-color: #0056b3;
    cursor: help;
}

.tooltip {
    position: absolute;
    transform: translateX(0) translateY(+20%);
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10;
    margin-top: 5px;
    max-width: 90%;
    width: max-content;
    text-align: left;
}

.tooltip.multi-line {
    white-space: normal;
    line-height: 1.4;
}

</style>