<template>
    <div class="input-wrapper">
        <label :for="id">
            {{ label }}
            <span v-if="hasTooltip" class="help-icon" @click="toggleTooltip" @mouseenter="showTooltip"
                @mouseleave="hideTooltip">?</span>
        </label>
        <input :id="id" :type="type" :value="modelValue" @input="handleInput" @change="handleChange"
            @keydown="checkMinMax" v-bind="$attrs" :min="props.min" :max="props.max"/>
        <div v-if="isTooltipVisible" class="tooltip multi-line">
            ❔ {{ tooltipText }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    id: string;
    label: string;
    modelValue: string | number | boolean;
    type?: string;
    tooltipText?: string;
    min?: number;
    max?: number;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | boolean): void;
}>();

const checkMinMax = () => {

}

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

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (props.type !== 'numer') {
        if (props.max && Number(target.value) > props.max) {
            target.value = String(props.max);
        }
    }
    if (props.type !== 'checkbox') {
        emit('update:modelValue', target.value);
    }
};

const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (props.type === 'checkbox') {
        emit('update:modelValue', target.checked);
    }
};
</script>

<style scoped>
.input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    align-items: start;
}

input:disabled {
    border-color: var(--);
}

label {
    margin-bottom: 5px;
    font-weight: bold;
}

input {
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
    transform: translateX(0) translateY(+30%);
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
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