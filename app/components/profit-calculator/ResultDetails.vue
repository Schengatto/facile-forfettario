<template>
    <div class="results">
        <div class="disclaimer">
            <p>
                <strong>Nota:</strong> I valori mostrati sono puramente indicativi e servono solo come riferimento
                generale.
                Ogni situazione fiscale è unica e richiede un'analisi dettagliata. Si consiglia di consultare sempre
                un professionista qualificato per una valutazione accurata della propria situazione specifica.
            </p>
        </div>
        <div class="results-section">
            <div class="results-text">
                <h2>Risultati</h2>
                <p title="Il fatturato lordo incassato durante l'anno">Fatturato incassato: {{
                    formatCurrency(totaleFatturato) }}</p>
                <p title="L'imponibile su cui vengono calcolati i contributi previdenziali da versare">Base imponibile
                    previdenziale: {{ formatCurrency(imponibilePrevidenziale) }}</p>
                <p title="L'importo dei contributi previdenziali da versare">Contributi previdenziali da versare: {{
                    formatCurrency(contributiPrevidenziali) }}</p>
                <p
                    title="L'imponibile su cui vengono calcolate le tasse da pagare. Il valore viene calcolato partendo dall'imponibile annuale al meno dei contributi previdenziali che vengono dedotti">
                    Base imponibile fiscale: {{ formatCurrency(imponibileFiscale) }}</p>
                <p title="L'importo delle tasse da pagare">Tasse da pagare: {{ formatCurrency(tasseDaVersare) }}</p>
                <p title="Il totale tra contributi da versare e tassse da pagare">Totale tasse e contributi: {{
                    formatCurrency(totaleTasseContributi) }}</p>
                <p title="L'effettivo netto annuale del soggetto">Netto annuale: {{ formatCurrency(netto) }}</p>
                <p title="Una proiezione del netto annuale suddiviso per le 12 mensilità">Netto mensile: {{
                    formatCurrency(netto / 12) }}</p>
                <p title="I giorni effettivamente lavorati e fatturati">Giorni lavorati: {{ giorniLavorati ?? 0 }}</p>
                <p title="I giorni dell'anno per cui non si è lavorato">Giorni liberi: {{ giorniLiberi ?? 0 }}</p>
            </div>
            <div class="chart">
                <h2>Suddivisione Fatturato Incassato</h2>
                <div class="chart-container">
                    <Pie :data="chartData" :options="chartOptions" :key="chartKey" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const props = defineProps<{
    totaleFatturato: number;
    imponibilePrevidenziale: number;
    imponibileFiscale: number;
    tasseDaVersare: number;
    contributiPrevidenziali: number;
    totaleTasseContributi: number;
    netto: number;
    giorniLavorati: number;
    giorniLiberi: number;
}>();

const chartKey = ref(0);

const chartData = computed(() => {
    chartKey.value++;
    return {
        labels: ['Netto', 'Tasse', 'Contributi'],
        datasets: [{
            backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
            data: [props.netto, props.tasseDaVersare, props.contributiPrevidenziali]
        }]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
                    return `${label}: ${percentage}% (${value.toFixed(2)} €)`;
                }
            }
        },
        datalabels: {
            formatter: (value: number, ctx: any) => {
                const datapoints = ctx.chart.data.datasets[0].data;
                const total = datapoints.reduce((total: number, datapoint: number) => total + datapoint, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
                return percentage + '%';
            },
            color: '#fff',
        }
    }
};
</script>

<style scoped>
.results {
    display: flex;
    background-color: var(--primary-50);
    color: #333;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.results-section {
    display: flex;
    flex-direction: column;
}

.results-text,
.chart {
    padding: 20px;
}

h2 {
    margin-top: 0;
    color: #333;
}

p {
    cursor: help;
}

.disclaimer {
    margin: 20px;
    padding: 15px;
    background-color: var(--primary-50);
    border-left: 4px solid #ffc107;
    border-radius: 4px;
}

.disclaimer p {
    margin: 0;
    font-size: 0.9em;
    line-height: 1.5;
    color: #666;
}

.chart-container {
    height: 300px;
}

@media (min-width: 1200px) {
    .results-section {
        flex-direction: row;
    }

    .results-text,
    .chart {
        flex: 1;
    }
}
</style>