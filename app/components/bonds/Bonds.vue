<template>
    <div class="bond-calculator">
        <h1 class="page-title">Calcolatore Rendita Obbligazioni</h1>
        <div class="input-grid">
            <div class="input-item">
                <label for="unitPrice">Prezzo unitario</label>
                <input type="number" id="unitPrice" v-model="inputs.unitPrice" step="0.01" @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="purchaseCommission">Commissioni di acquisto (€)</label>
                <input type="number" id="purchaseCommission" v-model="inputs.purchaseCommission" step="0.01"
                    @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="couponRate">Tasso cedola (%)</label>
                <input type="number" id="couponRate" v-model="inputs.couponRate" step="0.01" @input="validateInputs" />
            </div>
            <div class="input-item">
                <SelectOption id="couponFrequency" label="Frequenza cedole all'anno" v-model="inputs.couponFrequency"
                    :options="[
                        { value: 1, label: `1 volta all'anno` },
                        { value: 2, label: `2 volte all'anno` }
                    ]" />
            </div>
            <div class="input-item">
                <label for="issueDate">Data emissione</label>
                <input type="date" id="issueDate" v-model="inputs.issueDate" @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="maturityDate">Data scadenza</label>
                <input type="date" id="maturityDate" v-model="inputs.maturityDate" @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="purchaseDate">Data acquisto</label>
                <input type="date" id="purchaseDate" v-model="inputs.purchaseDate" @input="validateInputs" />
            </div>
            <div class="input-item">
                <label for="nominalValue">Valore nominale investimento</label>
                <input type="number" id="nominalValue" v-model="inputs.nominalValue" step="100"
                    @input="validateInputs" />
            </div>
            <div class="input-item checkbox-item">
                <label>
                    <input type="checkbox" v-model="inputs.isGovernmentBond" />
                    Obbligazione governativa (tassazione 12.5%)
                </label>
            </div>
            <div class="input-item">
                <SelectOption id="saleOption" label="Opzione di vendita" v-model="inputs.saleOption" :options="[
                    { value: 'maturity', label: 'Tenere fino alla scadenza' },
                    { value: 'early', label: 'Vendere prima della scadenza' }
                ]" />
            </div>
            <div v-if="inputs.saleOption === 'early'" class="input-item">
                <label for="saleDate">Data di vendita prevista</label>
                <input type="date" id="saleDate" v-model="inputs.saleDate" @input="validateInputs" />
            </div>
            <div v-if="inputs.saleOption === 'early'" class="input-item">
                <label for="saleUnitPrice">Prezzo unitario di vendita</label>
                <input type="number" id="saleUnitPrice" v-model="inputs.saleUnitPrice" step="0.01"
                    @input="validateInputs" />
            </div>
            <div v-if="inputs.saleOption === 'early'" class="input-item">
                <label for="saleCommission">Commissioni di vendita (€)</label>
                <input type="number" id="saleCommission" v-model="inputs.saleCommission" step="0.01"
                    @input="validateInputs" />
            </div>
        </div>

        <div v-if="validationError" class="error-message">{{ validationError }}</div>

        <button :disabled="!isValid" @click="calculateYield" class="btn">Calcola Rendita</button>

        <div v-if="results" class="results">
            <h2 class="subtitle">Risultati</h2>
            <div class="results-grid">
                <div class="result-item">
                    <span class="result-label">Capitale investito:</span>
                    <span class="result-value">{{ formatCurrency(results.actualInvestedCapital) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Unità acquistate:</span>
                    <span class="result-value">{{ results.numberOfUnits }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Interesse maturato (rateo):</span>
                    <span class="result-value">{{ formatCurrency(results.accruedInterest) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Commissioni totali:</span>
                    <span class="result-value negative">{{ formatCurrency(results.totalCommissions) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendita totale lorda:</span>
                    <span class="result-value positive">{{ formatCurrency(results.totalGrossYield) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendita totale netta:</span>
                    <span class="result-value positive">{{ formatCurrency(results.totalNetYield) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">TIR Lordo:</span>
                    <span class="result-value">{{ results.irrGross }}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendita annua lorda (valore):</span>
                    <span class="result-value positive">{{ formatCurrency(results.annualGrossYieldValue) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">TIR Netto:</span>
                    <span class="result-value">{{ results.irrNet }}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rendita annua netta (valore):</span>
                    <span class="result-value positive">{{ formatCurrency(results.annualNetYieldValue) }}</span>
                </div>
                <div v-if="Number(results.capitalGainTax) > 0" class="result-item">
                    <span class="result-label">Tassa sulla plusvalenza:</span>
                    <span class="result-value negative">{{ formatCurrency(results.capitalGainTax) }}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Valore finale netto:</span>
                    <span class="result-value positive">{{ formatCurrency(results.finalNetValue) }}</span>
                </div>
            </div>

            <h3 class="table-title">Flusso di cassa</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrizione</th>
                        <th>Valore</th>
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
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Totale</strong></td>
                        <td class="num-column"
                            :class="{ 'negative': Number(results.totalNetYield) < 0, 'positive': Number(results.totalNetYield) > 0 }">
                            <strong>{{ formatCurrency(results.totalNetYield) }}</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>

    <div>
        <UsefulLinks :links="externalLinks" />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import SelectOption from '../common/SelectOption.vue';
import type { BondInputs, CalculationResults } from './bonds';
import { calculateBondYield } from './bonds-calculation';

const inputs = ref<BondInputs>({
    unitPrice: 100,
    purchaseCommission: 0,
    saleCommission: 0,
    couponRate: '',
    nominalValue: '',
    issueDate: '',
    maturityDate: '',
    purchaseDate: '',
    isGovernmentBond: false,
    couponFrequency: 1,
    saleOption: 'maturity',
    saleDate: '',
    saleUnitPrice: 100
});

const results = ref<CalculationResults | null>(null);
const validationError = ref('');

const validateInputs = () => {
    if (!inputs.value.unitPrice) {
        validationError.value = 'Devi indicare un prezzo unitario valido';
    } else if (inputs.value.couponRate === undefined || inputs.value.couponRate === "") {
        validationError.value = 'Devi specificare il tasso della cedola';
    } else if (!inputs.value.issueDate) {
        validationError.value = 'Devi indicare la data di immissione';
    } else if (!inputs.value.maturityDate) {
        validationError.value = 'Devi indicare la data di scadenza';
    } else if (!inputs.value.purchaseDate) {
        validationError.value = 'Devi indicare la data di acquisto';
    } else if (!inputs.value.nominalValue || Number(inputs.value.nominalValue) <= 0) {
        validationError.value = 'Devi indicare valore da investire';
    } else if (inputs.value.purchaseCommission < 0) {
        validationError.value = 'Le commissioni di acquisto non possono essere negative';
    } else if (inputs.value.saleCommission < 0) {
        validationError.value = 'Le commissioni di vendita non possono essere negative';
    } else {
        validationError.value = '';
    }
};

const isValid = computed(() => !validationError.value);

watch(() => inputs.value.saleOption, (newValue) => {
    if (newValue === 'maturity') {
        inputs.value.saleDate = '';
        inputs.value.saleUnitPrice = 100;
        inputs.value.saleCommission = 0;
    }
    validateInputs();
});

const externalLinks = ref([
    { label: "Borsa Italiana - Obbligazioni", link: "https://www.borsaitaliana.it/borsa/obbligazioni/mot/obbligazioni-euro/lista.html" },
    { label: "Simple Tools for investors: Ricerca obbligazioni", link: "https://www.simpletoolsforinvestors.eu/monitors.shtml" },
    { label: "Youtube: Corso Educati e Finanziati - Obbligazioni", link: "https://www.youtube.com/watch?v=9cE5HNz3UJ4&list=PLfuzpc-H8qcdyEb5rpgYhN2P7cJGR1i9h&index=8&ab_channel=PaoloColetti" },
    { label: "Youtube: Mini Corso GRATIS sulle OBBLIGAZIONI: Come funzionano?", link: "https://www.youtube.com/watch?v=MXmp1vHInXY" }
]);

const calculateYield = () => {
    results.value = calculateBondYield(inputs.value);
}

validateInputs();
</script>

<style scoped>
.bond-calculator {
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

.results-table tfoot {
    font-weight: bold;
    color: #111;
    background-color: #edf2f7;
}

.results-table tfoot td {
    border-top: 2px solid #cbd5e0;
}

.num-column {
    justify-content: end;
    display: flex;
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