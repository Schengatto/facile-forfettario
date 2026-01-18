<template>
    <div class="comparison-page">
        <h1 class="page-title">Confronto Strumenti di Investimento</h1>

        <!-- Form unificato -->
        <BondsDeposit @calculate="handleCalculation" />

        <!-- Sezione Risultati (visibile solo dopo il calcolo) -->
        <div v-if="depositResults && bondResults" class="results-section">
            <div class="card">
                <h2 class="card-title">Confronto Rendimenti</h2>

                <div class="tab-content">
                    <!-- Tab Analisi Comparativa -->
                    <div class="comparison-grid">
                        <div class="stat-card">
                            <h3>Conto Deposito</h3>
                            <dl class="stat-list">
                                <div class="stat-row">
                                    <dt>Capitale Iniziale:</dt>
                                    <dd>{{ formatCurrency(depositResults.initialCapital) }}</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>Rendimento Lordo:</dt>
                                    <dd>{{ depositResults.effectiveGrossYield }}%</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>Rendimento Netto:</dt>
                                    <dd>{{ depositResults.effectiveNetYield }}%</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>Capitale Finale:</dt>
                                    <dd>{{ formatCurrency(depositResults.finalCapital) }}</dd>
                                </div>
                            </dl>
                        </div>

                        <div class="stat-card">
                            <h3>Obbligazione</h3>
                            <dl class="stat-list">
                                <div class="stat-row">
                                    <dt>Capitale Investito:</dt>
                                    <dd>{{ formatCurrency(bondResults.actualInvestedCapital) }}</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>TIR Lordo:</dt>
                                    <dd>{{ bondResults.irrGross }}%</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>TIR Netto:</dt>
                                    <dd>{{ bondResults.irrNet }}%</dd>
                                </div>
                                <div class="stat-row">
                                    <dt>Valore Finale:</dt>
                                    <dd>{{ formatCurrency(bondResults.finalNetValue) }}</dd>
                                </div>
                            </dl>
                        </div>

                        <div class="analysis-card">
                            <h3>Analisi Comparativa</h3>
                            <div class="analysis-content">
                                <p class="analysis-text">
                                    {{ comparativeAnalysis }}
                                </p>
                                <div class="key-differences">
                                    <h4>Principali differenze:</h4>
                                    <ul class="differences-list">
                                        <li>Flessibilità: il conto deposito offre generalmente maggiore flessibilità
                                        </li>
                                        <li>Rischio: l'obbligazione comporta un rischio emittente e di mercato</li>
                                        <li>Tassazione: titoli di stato hanno un'aliquota agevolata del 12.5%</li>
                                        <li>Liquidità: le obbligazioni possono avere una liquidabilità più limitata</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { BondResults, DepositResults } from '~/components/bonds-deposit/bonds-deposit';
import type { BondInputs } from '~/components/bonds/bonds';
import { calculateBondYield } from '~/components/bonds/bonds-calculation';
import type { DepositInputs } from '~/components/deposit/deposit';
import { calculateDepositYield } from '~/components/deposit/deposit-calculation';


// Stato per i risultati
const depositResults = ref<DepositResults | null>(null)
const bondResults = ref<BondResults | null>(null)
const currentTab = ref('comparison')


// Analisi comparativa
const comparativeAnalysis = computed(() => {
    if (!depositResults.value || !bondResults.value) return ''

    const depositYield = Number(depositResults.value.effectiveNetYield)
    const bondYield = Number(bondResults.value.irrNet)

    if (bondYield > depositYield) {
        return `L'obbligazione offre un rendimento netto superiore al conto deposito di ${(bondYield - depositYield).toFixed(2)} punti percentuali.`
    } else {
        return `Il conto deposito offre un rendimento netto superiore all'obbligazione di ${(depositYield - bondYield).toFixed(2)} punti percentuali.`
    }
})

// Handler per il calcolo
const handleCalculation = async (data: { depositData: DepositInputs, bondData: BondInputs }) => {
    // Calcola i risultati del deposito
    depositResults.value = calculateDepositYield(data.depositData)

    // Calcola i risultati dell'obbligazione
    bondResults.value = calculateBondYield(data.bondData)

    // Imposta il tab iniziale
    currentTab.value = 'yields'
}

// Utility function per la formattazione della valuta
const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(num)
}
</script>

<style scoped>
.comparison-page {
    max-width: 1600px;
    margin: 0 auto;
    padding: 2rem;
}

.results-section {
    margin-top: 2rem;
    opacity: 0;
    animation: fadeIn 0.3s ease-in forwards;
}

.comparison-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

@media (min-width: 768px) {
    .comparison-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.stat-card {
    background-color: var(--color-background-alt);
    padding: 1.5rem;
    border-radius: 8px;
    height: 100%;
}

.stat-card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--color-text-primary);
}

.analysis-card {
    grid-column: 1 / -1;
    background-color: var(--color-background-alt);
    padding: 1.5rem;
    border-radius: 8px;
}

.stat-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.95rem;
}

.stat-row:last-child {
    border-bottom: none;
}

.stat-row dt {
    color: var(--color-text-secondary);
    max-width: 60%;
}

.stat-row dd {
    font-weight: 500;
    color: var(--color-text-primary);
}

.analysis-content {
    margin-top: 1rem;
    color: var(--color-text-primary);
}

.analysis-text {
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.key-differences {
    background-color: var(--color-background);
    padding: 1.5rem;
    border-radius: 6px;
    margin-top: 1.5rem;
}

.key-differences h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--color-text-primary);
}

.differences-list {
    list-style-type: disc;
    margin-left: 1.5rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin-bottom: 0;
}

.differences-list li {
    margin-bottom: 0.75rem;
}

.differences-list li:last-child {
    margin-bottom: 0;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.positive {
    color: var(--color-success);
}

.negative {
    color: var(--color-danger);
}

@media (max-width: 640px) {
    .comparison-page {
        padding: 1rem;
    }

    .stat-row {
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-row dt {
        max-width: 100%;
    }
}

@media print {
    .comparison-page {
        padding: 0;
    }

    .comparison-grid {
        break-inside: avoid;
        page-break-inside: avoid;
    }
}
</style>