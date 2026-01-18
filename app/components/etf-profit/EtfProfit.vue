<template>
    <div class="etf-calculator">
        <h1 class="page-title">Calcolatore Rendita ETF</h1>
        <div class="form-group">
            <label>Seleziona ETF:</label>
            <div class="button-group">
                <button class="btn-secondary" v-for="(etf, key) in etfOptions" :key="key" @click="handleETFSelect(key)"
                    :class="{ active: selectedETF === key }">
                    {{ etf.name }}
                </button>
                <button class="btn-secondary" @click="handleETFSelect('')" :class="{ active: selectedETF === '' }">
                    Personalizzato
                </button>
            </div>
        </div>
        <div v-if="selectedETF" class="isin-info">
            <a :href="`https://www.justetf.com/etf-profile.html?isin=${etfOptions[selectedETF].isin}`"
                target="_blank">ISIN: {{ etfOptions[selectedETF].isin }}</a>
        </div>
        <div class="form-group">
            <label>Tipo di Investimento:</label>
            <div class="button-group">
                <button class="btn-secondary" v-for="type in investmentTypes" :key="type.value" @click="investmentType = type.value"
                    :class="{ active: investmentType === type.value }">
                    {{ type.label }}
                </button>
            </div>
        </div>
        <div v-if="investmentType === 'single-investment'" class="form-group">
            <label>Investimento Iniziale (€):</label>
            <input v-model.number="initialInvestment" type="number" min="0" />
        </div>
        <template v-else>
            <div class="form-group">
                <label>Importo Prima Somma (€):</label>
                <input v-model.number="initialInvestment" type="number" min="0" />
            </div>
            <div class="form-group">
                <label>Importo Investimento Periodico (€):</label>
                <input v-model.number="pacAmount" type="number" min="0" />
            </div>
            <div class="form-group">
                <label>Frequenza Investimento:</label>
                <select v-model="pacFrequency">
                    <option v-for="freq in pacFrequencies" :key="freq.value" :value="freq.value">
                        {{ freq.label }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label>Ferma investimenti dopo (iterazioni):</label>
                <input v-model.number="stopAfterIterations" type="number" min="0" />
            </div>
        </template>
        <div class="form-group">
            <label>Durata Investimento (Anni):</label>
            <input v-model.number="years" type="number" min="1" />
        </div>
        <div class="form-group">
            <label>Rendimento Annuo Medio (%):</label>
            <input v-model.number="returnRate" type="number" step="0.1" />
        </div>
        <div class="form-group">
            <label>TER (%):</label>
            <input v-model.number="ter" type="number" step="0.01" />
        </div>
        <button @click="calculateCompounding" class="btn calculate-btn">
            Calcola
        </button>
        <div v-if="result" class="result">
            <h3>Risultato:</h3>
            <p>Valore Finale: {{ formatCurrency(result.finalValue) }}</p>
            <p>Totale Investito: {{ formatCurrency(result.totalInvested) }}</p>
            <p>Guadagno Totale: {{ formatCurrency(result.totalGain) }}</p>
            <p>Rendimento Totale: {{ formatPercent(result.totalReturn) }}</p>

            <div class="chart-container">
                <canvas ref="chartCanvas"></canvas>
            </div>

            <h3>Dettaglio Annuale:</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Anno</th>
                            <th>Valore</th>
                            <th>Quota TER</th>
                            <th>Incremento</th>
                            <th>% dall'Iniziale</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in result.yearlyData" :key="data.year">
                            <td>{{ data.year }}</td>
                            <td>{{ formatCurrency(data.value) }}</td>
                            <td>{{ formatCurrency(data.terQuota) }}</td>
                            <td>{{ formatPercent(data.increment) }}</td>
                            <td>{{ formatPercent(data.percentageFromInitial / 100) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div>
        <UsefulLinks :links="externalLinks" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';

interface ETFOption {
    name: string;
    returnRate: number;
    ter: number;
    isin: string;
}

interface InvestmentType {
    value: 'single-investment' | 'pac';
    label: string;
}

interface PACFrequency {
    value: 'monthly' | 'quarterly' | 'yearly';
    label: string;
}

interface YearlyData {
    year: number;
    value: number;
    increment: number;
    terQuota: number;
    percentageFromInitial: number;  // Nuova proprietà
}

interface CalculationResult {
    finalValue: number;
    totalInvested: number;
    totalGain: number;
    totalReturn: number;
    chartData: { 
        year: number; 
        previousValue: number; 
        yearInvestment: number; 
        yearProfit: number;
        percentageIncrease: number;
        percentageFromInitial: number;  // Nuova proprietà
    }[];
    yearlyData: YearlyData[];
}

const etfOptions: Record<string, ETFOption> = {
    'sp500': { name: 'S&P500', returnRate: 10.5, ter: 0.07, isin: 'IE00B5BMR087' },
    'global': { name: 'MSCI World', returnRate: 8.5, ter: 0.2, isin: 'IE00B4L5Y983' },
    'nasdaq': { name: 'NASDAQ-100', returnRate: 12.5, ter: 0.15, isin: 'IE00B53SZB19' },
};

const investmentTypes: InvestmentType[] = [
    { value: 'single-investment', label: 'Investimento Singolo' },
    { value: 'pac', label: 'Investimento Periodico' },
];

const pacFrequencies: PACFrequency[] = [
    { value: 'monthly', label: 'Mensile' },
    { value: 'quarterly', label: 'Trimestrale' },
    { value: 'yearly', label: 'Annuale' },
];

const selectedETF = ref('');
const investmentType = ref<'single-investment' | 'pac'>('single-investment');
const initialInvestment = ref(10000);
const pacAmount = ref(100);
const pacFrequency = ref<'monthly' | 'quarterly' | 'yearly'>('monthly');
const stopAfterIterations = ref(120);
const years = ref(10);
const returnRate = ref(7);
const ter = ref(0.2);
const result = ref<CalculationResult | null>(null);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const handleETFSelect = (etf: string) => {
    selectedETF.value = etf;
    if (etf) {
        returnRate.value = etfOptions[etf].returnRate;
        ter.value = etfOptions[etf].ter;
    }
};

const calculateCompounding = () => {
    let finalValue = 0;
    let totalInvested = 0;
    const effectiveRate = 1 + (returnRate.value - ter.value) / 100;
    const periodsPerYear = investmentType.value === 'pac' ?
        (pacFrequency.value === 'monthly' ? 12 : pacFrequency.value === 'quarterly' ? 4 : 1) : 1;

    const chartData = [];
    const yearlyData: YearlyData[] = [];
    let currentValue = initialInvestment.value;
    totalInvested = initialInvestment.value;
    let iterationCount = 0;
    let previousYearValue = currentValue;

    for (let year = 0; year <= years.value; year++) {
        let yearStartValue = currentValue;
        let yearInvestment = 0;

        if (investmentType.value === 'pac' && year > 0) {
            const paymentsThisYear = periodsPerYear;
            for (let i = 0; i < paymentsThisYear; i++) {
                if (iterationCount < stopAfterIterations.value) {
                    yearInvestment += pacAmount.value;
                    currentValue = (currentValue + pacAmount.value) * Math.pow(effectiveRate, 1 / periodsPerYear);
                    totalInvested += pacAmount.value;
                    iterationCount++;
                } else {
                    currentValue *= Math.pow(effectiveRate, 1 / periodsPerYear);
                }
            }
        } else if (year > 0) {
            currentValue *= effectiveRate;
        }

        const yearProfit = currentValue - previousYearValue - yearInvestment;
        const percentageIncrease = year === 0 ? 0 : ((currentValue - previousYearValue) / previousYearValue) * 100;
        const percentageFromInitial = ((currentValue - initialInvestment.value) / initialInvestment.value) * 100;

        chartData.push({
            year,
            previousValue: previousYearValue,
            yearInvestment: yearInvestment,
            yearProfit: yearProfit,
            percentageIncrease: percentageIncrease,
            percentageFromInitial: percentageFromInitial,
            totalValue: currentValue
        });

        const yearlyIncrement = (currentValue - yearStartValue - yearInvestment) / yearStartValue;
        const terQuota = currentValue * (ter.value / 100);

        yearlyData.push({
            year,
            value: currentValue,
            increment: yearlyIncrement,
            terQuota: terQuota,
            percentageFromInitial: percentageFromInitial,
        });

        previousYearValue = currentValue;
    }

    finalValue = currentValue;

    const totalGain = finalValue - totalInvested;
    const totalReturn = (totalGain / totalInvested);

    result.value = {
        finalValue,
        totalInvested,
        totalGain,
        totalReturn,
        chartData,
        yearlyData,
    };

    nextTick(() => {
        updateChart();
    });
};

const updateChart = () => {
    if (!chartCanvas.value || !result.value) return;

    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;

    if (chart) {
        chart.destroy();
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: ''
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valore (€)'
                },
                ticks: {
                    callback: function (value: any) {
                        return '€' + value.toLocaleString();
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const dataIndex = context.dataIndex;
                        const datasetIndex = context.datasetIndex;
                        const value = context.raw;
                        const percentageIncrease = result.value!.chartData[dataIndex].percentageIncrease.toFixed(2);
                        let label = '';
                        switch (datasetIndex) {
                            case 0:
                                label = `Valore precedente: €${value.toLocaleString()}`;
                                break;
                            case 1:
                                label = `Investito quest'anno: €${value.toLocaleString()}`;
                                break;
                            case 2:
                                label = `Profitto anno corrente: €${value.toLocaleString()}`;
                                break;
                        }
                        return `${label} (Incremento: ${percentageIncrease}%)`;
                    }
                }
            },
            legend: {
                display: true,
                position: 'top'
            }
        }
    };

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: result.value.chartData.map(d => `Anno ${d.year}`),
            datasets: [
                {
                    label: 'Valore precedente',
                    data: result.value.chartData.map(d => d.previousValue),
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgb(40, 167, 69)',
                    borderWidth: 1
                },
                {
                    label: 'Investito quest\'anno',
                    data: result.value.chartData.map(d => d.yearInvestment),
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgb(255, 193, 7)',
                    borderWidth: 1
                },
                {
                    label: 'Profitto anno corrente',
                    data: result.value.chartData.map(d => d.yearProfit),
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    borderColor: 'rgb(0, 123, 255)',
                    borderWidth: 1
                }
            ]
        },
        options: options as any
    });

    drawCustomLabels();
};

const drawCustomLabels = () => {
    if (!chart || !result.value) return;

    const ctx = chart.ctx;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.textAlign = 'center';

    chart.data.datasets[0].data.forEach((_, index) => {
        const meta = chart?.getDatasetMeta(0);
        if (!meta) return;
        const x = meta.data[index].x;
        const y = meta.data[index].y;
        const percentage = result.value!.chartData[index].percentageFromInitial.toFixed(2);
        ctx.fillText(`${percentage}%`, x, y - 10);
    });
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2 }).format(value);
};

watch(() => result.value, () => {
    nextTick(() => {
        updateChart();
    });
});

// New watch to reset result when investment type changes
watch(() => investmentType.value, () => {
    result.value = null;
    if (chart) {
        chart.destroy();
        chart = null;
    }
});

onMounted(() => {
    if (result.value) {
        nextTick(() => {
            updateChart();
        });
    }
});

const externalLinks = ref([
    { label: "Just ETF - Motore ricerca ETF", link: "https://www.justetf.com/en/search.html?search=ETFS" },
    { label: "Youtube: Corso Educati e Finanziati - ETF", link: "https://www.youtube.com/watch?v=8JymHrq-7pE&list=PLfuzpc-H8qcdyEb5rpgYhN2P7cJGR1i9h&index=13&ab_channel=PaoloColetti" }
]);

</script>

<style scoped>
.etf-calculator {
    font-family: Arial, sans-serif;
}

.page-title {
    text-align: center;
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}

input,
select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

input:focus,
select:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.25);
}

.button-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.isin-info {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #555;
}

.isin-info a:hover {
    text-decoration: underline;
}

.calculate-btn {
    display: block;
    width: 100%;
    padding: 12px;
    color: white;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.result {
    margin-top: 30px;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.result h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #4CAF50;
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.result p {
    margin: 10px 0;
    color: #555;
    font-size: 16px;
}

.chart-container {
    margin-top: 30px;
    height: 400px;
}

.table-container {
    margin-top: 30px;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: right;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
    color: #333;
}

td {
    color: #555;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #f5f5f5;
}

@media (max-width: 600px) {
    .button-group {
        flex-direction: column;
    }

    .btn-secondary {
        width: 100%;
    }

    th, td {
        padding: 8px;
    }
}
</style>