<template>
    <div class="deposit-calculator">
        <h1 class="page-title">Calcolatore Rendita Conto Deposito</h1>
        <div class="input-grid">
            <div class="input-item">
                <label for="depositAmount">Ammontare da depositare</label>
                <input type="number" id="depositAmount" v-model="inputs.depositAmount" step="100"
                    @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="startDate">Data inizio deposito</label>
                <input type="date" id="startDate" v-model="inputs.startDate" @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="interestRate">Tasso di interesse annuo (%)</label>
                <input type="number" id="interestRate" v-model="inputs.interestRate" step="0.01"
                    @input="validateInputs" />
            </div>
            <div class="input-item">
                <SelectOption id="interestFrequency" label="Frequenza accredito interessi"
                    v-model="inputs.interestFrequency" :options="[
                        { value: 12, label: 'Mensile' },
                        { value: 4, label: 'Trimestrale' },
                        { value: 1, label: 'Annuale' }
                    ]" />
            </div>
            <div class="input-item">
                <label for="depositDuration">Durata deposito (mesi)</label>
                <input type="number" id="depositDuration" v-model="inputs.depositDuration" min="1" step="1"
                    @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="constraintMonths">Mesi di vincolo</label>
                <input type="number" id="constraintMonths" v-model="inputs.constraintMonths" min="0" step="1"
                    @input="validateInputs" />
            </div>
            <div class="input-item checkbox-item">
                <label>
                    <input type="checkbox" v-model="inputs.reinvestInterest" />
                    Reinvestire gli interessi nel deposito (capitalizzazione)
                </label>
            </div>
        </div>

        <div v-if="validationError" class="error-message">{{ validationError }}</div>

        <button :disabled="!isValid" @click="calculateYield" class="btn">Calcola Rendimento</button>

        <div v-if="results" class="results">
            <h2 class="subtitle">Risultati</h2>
            <div class="results-grid">
                <div class="result-item">
                    <span class="result-label">Capitale iniziale:</span>
                    <span class="result-value">{{ formatCurrency(results.initialCapital) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Interessi lordi totali:</span>
                    <span class="result-value positive">{{ formatCurrency(results.totalGrossInterest) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Tasse sugli interessi (26%):</span>
                    <span class="result-value negative">{{ formatCurrency(results.totalTax) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Interessi netti totali:</span>
                    <span class="result-value positive">{{ formatCurrency(results.totalNetInterest) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Capitale finale:</span>
                    <span class="result-value positive">{{ formatCurrency(results.finalCapital) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendimento annuo effettivo (lordo):</span>
                    <span class="result-value">{{ results.effectiveGrossYield }}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendimento annuo effettivo (netto):</span>
                    <span class="result-value">{{ results.effectiveNetYield }}%</span>
                </div>
            </div>

            <h3 class="table-title">Flusso di cassa</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrizione</th>
                        <th>Valore</th>
                        <th>Capitale dopo operazione</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(cashFlow, index) in results.cashFlows" :key="index">
                        <td>{{ cashFlow.date }}</td>
                        <td>{{ cashFlow.description }}</td>
                        <td class="num-column"
                            :class="{ 'negative': cashFlow.value < 0, 'positive': cashFlow.value > 0 }">
                            {{ formatCurrency(cashFlow.value) }}
                        </td>
                        <td class="num-column positive">
                            {{ formatCurrency(cashFlow.balance) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { CalculationResults, DepositInputs } from './deposit';
import { calculateDepositYield } from './deposit-calculation';

const inputs = ref<DepositInputs>({
    depositAmount: 10000,
    startDate: '',
    interestRate: 3.5,
    interestFrequency: 12,
    depositDuration: 12,
    constraintMonths: 12,
    reinvestInterest: true
});

const results = ref<CalculationResults | null>(null);
const validationError = ref('');

const validateInputs = () => {
    if (!inputs.value.depositAmount || inputs.value.depositAmount <= 0) {
        validationError.value = 'Devi indicare un ammontare valido da depositare';
    } else if (!inputs.value.startDate) {
        validationError.value = 'Devi indicare la data di inizio deposito';
    } else if (!inputs.value.interestRate || inputs.value.interestRate <= 0) {
        validationError.value = 'Devi specificare un tasso di interesse valido';
    } else if (!inputs.value.depositDuration || inputs.value.depositDuration <= 0) {
        validationError.value = 'Devi specificare una durata valida del deposito';
    } else if (inputs.value.constraintMonths < 0) {
        validationError.value = 'I mesi di vincolo non possono essere negativi';
    } else if (inputs.value.constraintMonths > inputs.value.depositDuration) {
        validationError.value = 'I mesi di vincolo non possono superare la durata del deposito';
    } else {
        validationError.value = '';
    }
};

const isValid = computed(() => !validationError.value);

const calculateYield = () => {
    results.value = calculateDepositYield(inputs.value);
};

validateInputs();
</script>

<style scoped>
.deposit-calculator {
    max-width: 1280px;
    margin: 0 auto;
}

.input-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.input-item {
    width: 100%;
}

.checkbox-item {
    grid-column: 1 / -1;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.btn {
    margin-top: 20px;
}

.results {
    margin-top: 30px;
}

.subtitle {
    font-size: 20px;
    margin-bottom: 15px;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.result-item {
    background-color: var(--primary-50);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
    color: #4a5568;
}

.result-value {
    font-size: 1.2em;
    color: #2d3748;
}

.table-title {
    font-size: 18px;
    margin-bottom: 15px;
    color: #ffffff;
}

.results-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.results-table th,
.results-table td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: left;
}

.results-table th {
    background-color: #000;
    color: #fff;
    font-weight: bold;
}

.num-column {
    text-align: end !important;
}

.negative {
    color: var(--color-danger);
}

.positive {
    color: var(--color-success);
}

.error-message {
    color: var(--color-danger);
    font-weight: bold;
    margin-top: 10px;
    padding: 10px;
    background-color: #fed7d7;
    border: 1px solid var(--color-danger);
    border-radius: 4px;
}
</style>