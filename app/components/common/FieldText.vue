<template>
    <div class="input-wrapper">
        <label :for="id">
            {{ label ?? "&thinsp;" }}
        </label>
        <div :id="id" :type="type" :value="value" v-bind="$attrs" class="value">
            {{prefix}} {{ value }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    id: string;
    label?: string;
    value: string | number | boolean;
    type?: string;
    prefix?: string;
}>();

</script>

<style scoped>
.input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    align-items: start;
}

.value {
    padding: 0.5rem 0;
    font-size: 0.875rem;
}

label {
    margin-bottom: 5px;
    font-weight: bold;
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
    left: 50%;
    transform: translateX(-50%) translateY(+20%);
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    margin-top: 5px;
    max-width: 300px;
    width: max-content;
    text-align: left;
}

.tooltip.multi-line {
    white-space: normal;
    line-height: 1.4;
}

.tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #333 transparent;
    transform: translateX(-50%);
}
</style>