<template>
  <div class="investment-form">
      <h2 class="form-title">Parametri Investimento</h2>

      <!-- Sezione Comune -->
      <div class="form-section">
          <h3 class="section-subtitle">Parametri Comuni</h3>
          <div class="form-grid">
              <div class="input-group">
                  <label for="investmentAmount">Capitale da Investire</label>
                  <input type="number" id="investmentAmount" v-model="commonInputs.investmentAmount" step="100"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="startDate">Data Inizio Investimento</label>
                  <input type="date" id="startDate" v-model="commonInputs.startDate" @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="endDate">Data Fine Investimento</label>
                  <input type="date" id="endDate" v-model="commonInputs.endDate" @input="validateAndUpdate" />
              </div>
          </div>
      </div>

      <!-- Sezione Conto Deposito -->
      <div class="form-section">
          <h3 class="section-subtitle">Parametri Conto Deposito</h3>
          <div class="form-grid">
              <div class="input-group">
                  <label for="depositRate">Tasso di interesse annuo (%)</label>
                  <input type="number" id="depositRate" v-model="depositInputs.interestRate" step="0.01"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="interestFrequency">Frequenza accredito interessi</label>
                  <select id="interestFrequency" v-model="depositInputs.interestFrequency">
                      <option :value="12">Mensile</option>
                      <option :value="4">Trimestrale</option>
                      <option :value="1">Annuale</option>
                  </select>
              </div>

              <div class="input-group">
                  <label for="constraintMonths">Mesi di vincolo</label>
                  <input type="number" id="constraintMonths" v-model="depositInputs.constraintMonths" min="0" step="1"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group checkbox-group">
                  <label>
                      <input type="checkbox" v-model="depositInputs.reinvestInterest" />
                      Reinvestire gli interessi (capitalizzazione)
                  </label>
              </div>
          </div>
      </div>

      <!-- Sezione Obbligazioni -->
      <div class="form-section">
          <h3 class="section-subtitle">Parametri Obbligazione</h3>
          <div class="form-grid">
              <div class="input-group">
                  <label for="maturityDate">Data Scadenza Obbligazione</label>
                  <input type="date" id="maturityDate" v-model="bondInputs.maturityDate" @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="unitPrice">Prezzo unitario</label>
                  <input type="number" id="unitPrice" v-model="bondInputs.unitPrice" step="0.01"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="couponRate">Tasso cedola (%)</label>
                  <input type="number" id="couponRate" v-model="bondInputs.couponRate" step="0.01"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="couponFrequency">Frequenza cedole</label>
                  <select id="couponFrequency" v-model="bondInputs.couponFrequency">
                      <option :value="1">Annuale</option>
                      <option :value="2">Semestrale</option>
                  </select>
              </div>

              <div class="input-group">
                  <label for="purchaseCommission">Commissioni di acquisto (€)</label>
                  <input type="number" id="purchaseCommission" v-model="bondInputs.purchaseCommission" step="0.01"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="saleCommission">Commissioni di vendita (€)</label>
                  <input type="number" id="saleCommission" v-model="bondInputs.saleCommission" step="0.01"
                      @input="validateAndUpdate" />
              </div>

              <div class="input-group">
                  <label for="saleUnitPrice">Prezzo unitario di vendita anticipata</label>
                  <input type="number" id="saleUnitPrice" v-model="bondInputs.saleUnitPrice" step="0.01"
                      @input="validateAndUpdate" />
                  <small class="help-text">Applicato solo in caso di vendita prima della scadenza</small>
              </div>

              <div class="input-group checkbox-group">
                  <label>
                      <input type="checkbox" v-model="bondInputs.isGovernmentBond" />
                      Obbligazione governativa (tassazione 12.5%)
                  </label>
              </div>
          </div>
      </div>

      <div v-if="validationError" class="error-message">
          {{ validationError }}
      </div>

      <button class="calculate-button" :disabled="!isValid" @click="calculateComparison">
          Calcola Confronto
      </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { differenceInMonths, parse, isAfter, isBefore } from 'date-fns'
import type { DepositInputs } from '../components/deposit/deposit'
import type { BondInputs } from '../components/bonds/bonds'

interface CommonInputs {
  investmentAmount: number
  startDate: string
  endDate: string
}

const commonInputs = ref < CommonInputs > ({
  investmentAmount: 10000,
  startDate: '',
  endDate: ''
})

const depositInputs = ref < Partial < DepositInputs >> ({
  interestRate: 3.5,
  interestFrequency: 12,
  constraintMonths: 0,
  reinvestInterest: true
})

const bondInputs = ref < Partial < BondInputs >> ({
  maturityDate: '',
  unitPrice: 100,
  purchaseCommission: 0,
  saleCommission: 0,
  couponRate: '',
  isGovernmentBond: false,
  couponFrequency: 1,
  saleUnitPrice: 100
})

const validationError = ref('')
const isValid = computed(() => !validationError.value)

const validateAndUpdate = () => {
  if (!commonInputs.value.investmentAmount || commonInputs.value.investmentAmount <= 0) {
      validationError.value = 'Inserire un capitale valido'
      return
  }

  if (!commonInputs.value.startDate) {
      validationError.value = 'Inserire una data di inizio'
      return
  }

  if (!commonInputs.value.endDate) {
      validationError.value = 'Inserire una data di fine investimento'
      return
  }

  const startDate = parse(commonInputs.value.startDate, 'yyyy-MM-dd', new Date())
  const endDate = parse(commonInputs.value.endDate, 'yyyy-MM-dd', new Date())
  const maturityDate = bondInputs.value.maturityDate ?
      parse(bondInputs.value.maturityDate, 'yyyy-MM-dd', new Date()) :
      null

  if (isAfter(startDate, endDate)) {
      validationError.value = 'La data di fine deve essere successiva alla data di inizio'
      return
  }

  if (maturityDate && isBefore(maturityDate, startDate)) {
      validationError.value = 'La data di scadenza obbligazione deve essere successiva alla data di inizio'
      return
  }

  const months = differenceInMonths(endDate, startDate)
  if (depositInputs.value.constraintMonths! > months) {
      validationError.value = 'Il vincolo non può superare la durata dell\'investimento'
      return
  }

  // Altre validazioni specifiche...
  validationError.value = ''
}

const calculateComparison = () => {
  const startDate = commonInputs.value.startDate
  const endDate = commonInputs.value.endDate
  const maturityDate = bondInputs.value.maturityDate!

  // Prepara i dati per il conto deposito
  const depositData: DepositInputs = {
      depositAmount: commonInputs.value.investmentAmount,
      startDate,
      interestRate: depositInputs.value.interestRate!,
      interestFrequency: depositInputs.value.interestFrequency!,
      depositDuration: differenceInMonths(
          parse(endDate, 'yyyy-MM-dd', new Date()),
          parse(startDate, 'yyyy-MM-dd', new Date())
      ),
      constraintMonths: depositInputs.value.constraintMonths!,
      reinvestInterest: depositInputs.value.reinvestInterest!
  }

  // Prepara i dati per l'obbligazione
  const bondData: BondInputs = {
      unitPrice: bondInputs.value.unitPrice!,
      purchaseCommission: bondInputs.value.purchaseCommission!,
      saleCommission: bondInputs.value.saleCommission!,
      couponRate: bondInputs.value.couponRate!,
      nominalValue: commonInputs.value.investmentAmount.toString(),
      issueDate: startDate,
      maturityDate,
      purchaseDate: startDate,
      isGovernmentBond: bondInputs.value.isGovernmentBond!,
      couponFrequency: bondInputs.value.couponFrequency!,
      saleOption: isBefore(
          parse(endDate, 'yyyy-MM-dd', new Date()),
          parse(maturityDate, 'yyyy-MM-dd', new Date())
      ) ? 'early' : 'maturity',
      saleDate: endDate,
      saleUnitPrice: bondInputs.value.saleUnitPrice!
  }

  emit('calculate', { depositData, bondData })
}

const emit = defineEmits < {
  (e: 'calculate', data: { depositData: DepositInputs, bondData: BondInputs }): void
}> ()
</script>

<style scoped>
.investment-form {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
}

.form-section {
    background-color: var(--color-background-alt);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.form-section:last-child {
    margin-bottom: 0;
}

.section-subtitle {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-weight: 500;
    color: var(--color-text-primary);
}

.input-group small {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.checkbox-group {
    margin-top: 0.5rem;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
}

.checkbox-group input[type="checkbox"] {
    width: auto;
    margin: 0;
}

.error-message {
    color: var(--color-danger);
    padding: 1rem;
    margin: 1rem 0;
    background-color: color-mix(in srgb, var(--color-danger) 15%, transparent);
    border-radius: 4px;
}

.calculate-button {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 2rem auto 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .investment-form {
        padding: 1rem;
    }

    .form-section {
        padding: 1rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .calculate-button {
        max-width: 100%;
    }
}

/* Stili per gruppi di input specifici */
.duration-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.duration-inputs input {
    flex: 1;
}

.duration-inputs span {
    color: var(--color-text-secondary);
    white-space: nowrap;
}

/* Stili per input disabilitati */
.input-group.disabled label {
    color: var(--color-text-secondary);
}

.input-group.disabled input,
.input-group.disabled select {
    background-color: color-mix(in srgb, var(--color-text-secondary) 10%, transparent);
    cursor: not-allowed;
}

/* Stili per sezioni condizionali */
.conditional-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--color-text-secondary) 20%, transparent);
}

/* Stili per raggruppamenti logici di input */
.input-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

@media (max-width: 640px) {
    .input-row {
        flex-direction: column;
    }

    .input-row .input-group {
        width: 100%;
    }
}

/* Stili per tooltip/help text */
.help-tooltip {
    display: inline-block;
    margin-left: 0.5rem;
    color: var(--color-text-secondary);
    cursor: help;
}

.help-tooltip:hover {
    color: var(--color-link);
}

/* Stili per validazione */
.input-group.has-error input,
.input-group.has-error select {
    border-color: var(--color-danger);
}

.input-group.has-error .error-hint {
    color: var(--color-danger);
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

/* Stili per i gruppi di radio/select */
.radio-group {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.radio-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

/* Animazioni */
.form-section {
    transition: all 0.3s ease;
}

.form-section:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.conditional-section {
    animation: slideDown 0.3s ease-out;
}
</style>