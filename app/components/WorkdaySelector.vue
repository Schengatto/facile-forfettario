<template>
    <div class="workday-selector">
        <label>Seleziona i giorni lavorativi:</label>
        <div class="form-group">
            <div v-for="day in days" :key="day.value" class="flex">
                <input type="checkbox" :id="day.name" :value="day.value" v-model="selectedDays" @change="emitUpdate">
                <label class="day-name" :for="day.name">{{ day.name }}</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const days = [
    { name: 'Lunedì', value: 1 },
    { name: 'Martedì', value: 2 },
    { name: 'Mercoledì', value: 3 },
    { name: 'Giovedì', value: 4 },
    { name: 'Venerdì', value: 5 },
    { name: 'Sabato', value: 6 },
    { name: 'Domenica', value: 7 }
];

const selectedDays = ref<number[]>([1, 2, 3, 4, 5]);

const emit = defineEmits(['update']);

const emitUpdate = () => {
    emit('update', selectedDays.value);
};

// Emettere l'aggiornamento iniziale
watch(selectedDays, emitUpdate, { immediate: true });
</script>

<style scoped>
.workday-selector {
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    justify-content: space-between;
}

.day-name {
    margin-left: 8px
}

@media (max-width: 960px) {
    .form-group {
        display: grid;
        grid-template-columns: 40px;
    }
}
</style>