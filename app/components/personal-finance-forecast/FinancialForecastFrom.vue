<template>
    <div class="financial-form">
        <div class="section">
            <h2>Allocazioni Iniziali</h2>
            <div class="input-grid">
                <div class="input-item" v-for="field in initialFields" :key="field.id">
                    <label :for="field.id">{{ field.label }}</label>
                    <input type="number" :id="field.id" :value="formData[field.id]"
                        @input="updateField(field.id, $event)" step="0.01" />
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Quota Massima Allocazioni</h2>
            <div class="input-grid">
                <div class="input-item" v-for="field in limitsFields" :key="field.id">
                    <label :for="field.id">{{ field.label }}</label>
                    <input type="number" :id="field.id" :value="formData[field.id]"
                        @input="updateField(field.id, $event)" step="0.01" />
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Rendimenti Annuale Medio (%)</h2>
            <div class="input-grid">
                <div class="input-item" v-for="field in yieldFields" :key="field.id">
                    <label :for="field.id">{{ field.label }}</label>
                    <input type="number" :id="field.id" :value="formData[field.id]"
                        @input="updateField(field.id, $event)" step="0.1" />
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Reddito Mensile e Obiettivo finale</h2>
            <div class="input-grid">
                <div class="input-item" v-for="field in targetFields" :key="field.id">
                    <label :for="field.id">{{ field.label }}</label>
                    <input type="number" :id="field.id" :value="formData[field.id]"
                        @input="updateField(field.id, $event)" step="0.01" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import type { FinancialParams } from '~/types/financial';

type FieldId = keyof FinancialParams;

interface Field {
    id: FieldId;
    label: string;
}

const props = defineProps<{
    params: FinancialParams
}>()

const emit = defineEmits<{
    (e: 'update', value: FinancialParams): void
}>()

const formData = ref<FinancialParams>({ ...props.params })

const initialFields: Field[] = [
    { id: 'initialLiquidity', label: 'Liquidità' },
    { id: 'initialFunds', label: 'Fondo emergenza e spese' },
    { id: 'initialBonds', label: 'Obbligazioni' },
    { id: 'initialEtf', label: 'ETF / Azionario' },
    { id: 'initialCrypto', label: 'Crypto' }
]

const limitsFields: Field[] = [
    { id: 'maxLiquidity', label: 'Liquidità' },
    { id: 'maxFunds', label: 'Fondi' },
    { id: 'maxBonds', label: 'Obbligazioni' },
    { id: 'maxEtf', label: 'ETF / Azionario' },
    { id: 'maxCrypto', label: 'Crypto' },
]

const yieldFields: Field[] = [
    { id: 'fundsYield', label: 'Fondi - (C.D./BTC)' },
    { id: 'bondsYield', label: 'Obbligazioni' },
    { id: 'etfYield', label: 'ETF / Azionario' },
    { id: 'cryptoYield', label: 'Rendimento Crypto' }
]

const targetFields: Field[] = [
    { id: 'monthlyIncome', label: 'Reddito Netto Mensile' },
    { id: 'targetWealth', label: 'Obiettivo Patrimonio' }
]

const updateField = (fieldId: FieldId, event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    formData.value = {
        ...formData.value,
        [fieldId]: value
    }
    emit('update', formData.value)
}

watchEffect(() => {
    formData.value = { ...props.params }
})
</script>

<style scoped>
.input-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
}

/* Mobile: 1 input per riga */
@media (max-width: 767px) {
    .input-grid {
        grid-template-columns: 1fr;
    }
}

/* Tablet: 3 input per riga */
@media (min-width: 768px) and (max-width: 1199px) {
    .input-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Desktop: 5 input per riga */
@media (min-width: 1200px) {
    .input-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}

.input-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

h2 {
    margin-bottom: 20px;
    color: var(--color-text-primary);
}

/* Stili aggiuntivi per migliorare la responsività degli input */
input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

label {
    font-size: 14px;
    font-weight: 500;
}

@media (max-width: 767px) {
    .input-item {
        padding: 0 10px;
    }
}
</style>