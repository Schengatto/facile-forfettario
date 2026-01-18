// SrlCalculatorForm.vue
<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'

interface FormValues {
  fatturato: string
  costiOperativi: string
  compensoAmministratore: string
  percentualeDividendi: string
  tfmAnnuale: string
  buoniPastoGiornaliero: string
  giorniLavorati: string
}

const props = defineProps<{
  values: FormValues
  margineDifribuibile: number
  totaleCompensiLordi: number
  percentualeUtilizzata: number
}>()

const emit = defineEmits<{
  (e: 'update:values', value: FormValues): void
}>()

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value || 0)
}

const updateValue = (key: keyof FormValues, value: string) => {
  const cleanValue = value.replace(/^0+/, '')
  emit('update:values', { ...props.values, [key]: cleanValue })
}
</script>

<template>
  <div class="input-container">
    <!-- Distribuzione Info Panel -->
    <div class="distribuzione-info" :class="{ 'warning': percentualeUtilizzata > 1 }">
      <h4>Margine Distribuibile</h4>
      <div class="info-grid">
        <div class="info-item">
          <span>Disponibile:</span>
          <span>{{ formatCurrency(margineDifribuibile) }}</span>
        </div>
        <div class="info-item">
          <span>Utilizzato:</span>
          <span>{{ formatCurrency(totaleCompensiLordi) }}</span>
        </div>
        <div class="info-item">
          <span>Percentuale Utilizzata:</span>
          <span :class="{ 'text-red-600': percentualeUtilizzata > 1 }">
            {{ formatPercentage(percentualeUtilizzata) }}
          </span>
        </div>
      </div>
      <div v-if="percentualeUtilizzata > 1" class="warning-message">
        Attenzione: I compensi totali superano il margine distribuibile.
        La soluzione non è applicabile in quanto l'azienda andrebbe in perdita.
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${Math.min(percentualeUtilizzata * 100, 100)}%` }"
          :class="{ 'warning': percentualeUtilizzata > 1 }"></div>
      </div>
    </div>

    <!-- Input Form -->
    <div class="input-grid">
      <!-- Fatturato -->
      <div class="input-item">
        <label>Fatturato Annuo (IVA inclusa)</label>
        <input type="text" inputmode="numeric" :value="values.fatturato"
          @input="e => updateValue('fatturato', (e.target as HTMLInputElement).value)" placeholder="€">
      </div>

      <!-- Costi Operativi -->
      <div class="input-item">
        <label>Costi Operativi</label>
        <input type="text" inputmode="numeric" :value="values.costiOperativi"
          @input="e => updateValue('costiOperativi', (e.target as HTMLInputElement).value)" placeholder="€">
      </div>

      <!-- Compenso Amministratore -->
      <div class="input-item">
        <label>Compenso Amministratore</label>
        <input type="text" inputmode="numeric" :value="values.compensoAmministratore"
          @input="e => updateValue('compensoAmministratore', (e.target as HTMLInputElement).value)" placeholder="€">
      </div>

      <!-- TFM -->
      <div class="input-item">
        <label>TFM Annuale</label>
        <input type="text" inputmode="numeric" :value="values.tfmAnnuale"
          @input="e => updateValue('tfmAnnuale', (e.target as HTMLInputElement).value)" placeholder="€">
      </div>

      <!-- Dividendi -->
      <div class="input-item">
        <label>Percentuale Dividendi</label>
        <input type="text" inputmode="numeric" :value="values.percentualeDividendi"
          @input="e => updateValue('percentualeDividendi', (e.target as HTMLInputElement).value)" placeholder="%">
      </div>

    </div>
    <div>
      <!-- Buoni Pasto Group -->
      <div>
        <h4>Buoni Pasto</h4>
        <div class="input-grid">
          <div class="input-item">
            <label>Valore Giornaliero Buono Pasto</label>
            <input type="text" inputmode="numeric" :value="values.buoniPastoGiornaliero"
              @input="e => updateValue('buoniPastoGiornaliero', (e.target as HTMLInputElement).value)" placeholder="€">
            <small v-if="parseFloat(values.buoniPastoGiornaliero) > 8" class="error-text">
              Il valore massimo deducibile è 8€/giorno
            </small>
          </div>

          <div class="input-item">
            <label>Giorni Lavorati Annui</label>
            <input type="text" inputmode="numeric" :value="values.giorniLavorati"
              @input="e => updateValue('giorniLavorati', (e.target as HTMLInputElement).value)" placeholder="giorni">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-grid {
  display: grid;
  gap: 40px;
  margin-bottom: 20px;
}

@media (max-width: 767px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .input-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-item label {
  font-weight: 500;
  color: var(--color-text);
}

input {
  padding: 8px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: var(--gray-900);
}

input:hover {
  border-color: #d1d5db;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-group {
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.input-group h4 {
  margin-bottom: 1rem;
  font-weight: 500;
  color: var(--color-primary-text);
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.distribuzione-info {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background-color: #f9fafb;
}

.distribuzione-info.warning {
  background-color: #fff5f5;
  border-color: #feb2b2;
}

.distribuzione-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--gray-900);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--gray-100);
  color: var(--gray-900);
}

.warning-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fee2e2;
  border-radius: 0.25rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.progress.warning {
  background-color: #dc2626;
}

.text-red-600 {
  color: #dc2626;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .distribuzione-info {
    padding: 1rem;
  }
}
</style>