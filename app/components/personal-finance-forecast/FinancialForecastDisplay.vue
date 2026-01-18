<template>
  <div class="financial-display">
    <div class="card">
      <div class="display-header">
        <h2>Proiezione Finanziaria 2025-2050</h2>
        <div class="controls">
          <div class="view-selector">
            <label class="view-label">Visualizzazione:</label>
            <div class="tabs">
              <button class="tab-button" :class="{ active: viewType === 'yearly' }" @click="switchView('yearly')">
                <span class="icon">📊</span>
                Annuale
              </button>
              <button class="tab-button" :class="{ active: viewType === 'monthly' }" @click="switchView('monthly')">
                <span class="icon">📅</span>
                Mensile
              </button>
            </div>
            <div v-if="viewType === 'monthly'" class="year-selector">
              <label for="year-select">Anno:</label>
              <select id="year-select" v-model="selectedYear" class="year-select">
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="goalSummary" class="goal-summary">
        <div class="goal-summary-content">
          <span class="goal-icon">🎯</span>
          <div class="goal-text">
            <h3>Obiettivo Patrimonio</h3>
            <p>
              Raggiungerai l'obiettivo nel {{ formatPeriod(goalSummary.period) }}
              {{ goalSummary.year }} con un patrimonio di
              {{ formatCurrency(goalSummary.total) }}
            </p>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ viewType === 'monthly' ? 'Mese' : 'Anno' }}</th>
              <th>Liquidità</th>
              <th>Fondi</th>
              <th>Obbligazioni</th>
              <th>ETF</th>
              <th>Crypto</th>
              <th>Totale</th>
              <th>Rendita Investimenti</th>
              <th v-if="viewType === 'yearly'">Crescita %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in currentData" :key="row[timeKey]" :class="{ 'goal-reached': row.goalReached }">
              <td>{{ formatPeriod(row[timeKey]) }}</td>
              <td>{{ formatCurrency(row.liquidity) }}</td>
              <td>{{ formatCurrency(row.funds) }}</td>
              <td>{{ formatCurrency(row.bonds) }}</td>
              <td>{{ formatCurrency(row.etf) }}</td>
              <td>{{ formatCurrency(row.crypto) }}</td>
              <td class="total-column">{{ formatCurrency(row.total) }}</td>
              <td class="interest-column">{{ formatCurrency(calculateInterestIncome(row)) }}</td>
              <td v-if="viewType === 'yearly'">{{ formatGrowth(row.yearlyGrowth) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface FinancialData {
  month?: string;
  year?: number;
  liquidity: number;
  funds: number;
  bonds: number;
  etf: number;
  crypto: number;
  total: number;
  goalReached: boolean;
  yearlyGrowth?: string;
  fundsYield: number;
  bondsYield: number;
  etfYield: number;
  cryptoYield: number;
  [key: string]: string | number | boolean | undefined;
}

const props = defineProps<{
  monthlyData: Record<string, FinancialData[]>;
  yearlyData: FinancialData[];
  goalYear: number | null;
}>()

const viewType = ref<'monthly' | 'yearly'>('yearly')
const selectedYear = ref('2025')

const years = computed(() => Object.keys(props.monthlyData))
const timeKey = computed(() => viewType.value === 'monthly' ? 'month' : 'year' as const)

const currentData = computed(() => {
  return viewType.value === 'monthly'
    ? props.monthlyData[selectedYear.value]
    : props.yearlyData
})

const goalSummary = computed(() => {
  const goalRow = currentData.value.find(row => row.goalReached)
  if (!goalRow) return null

  return {
    period: viewType.value === 'monthly' ? goalRow.month : '',
    year: goalRow.year,
    total: goalRow.total
  }
})

// Calcolo degli yield rates
const calculateInterestIncome = (row: FinancialData) => {

  const yieldRates = {
    funds: props.yearlyData[0].fundsYield ?? 0, // valore di default se non presente
    bonds: props.yearlyData[0].bondsYield ?? 0,
    etf: props.yearlyData[0].etfYield ?? 0,
    crypto: props.yearlyData[0].cryptoYield ?? 0
  }

  const monthlyInterest = 
    (row.funds * (yieldRates.funds / 100 / 12)) +
    (row.bonds * (yieldRates.bonds / 100 / 12)) +
    (row.etf * (yieldRates.etf / 100 / 12)) +
    (row.crypto * (yieldRates.crypto / 100 / 12))

  return viewType.value === 'yearly' ? monthlyInterest * 12 : monthlyInterest
}

// Mesi in italiano per la formattazione
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const chartData = computed(() => ({
  labels: currentData.value.map(row => {
    const timeValue = row[timeKey.value]
    return formatPeriod(timeValue, true)
  }),
  datasets: [
    {
      label: 'Liquidità',
      backgroundColor: '#0ea5e9', // blu royal
      data: currentData.value.map(row => row.liquidity)
    },
    {
      label: 'Fondi',
      backgroundColor: '#7c3aed', // viola intenso
      data: currentData.value.map(row => row.funds)
    },
    {
      label: 'Obbligazioni',
      backgroundColor: '#84cc16', // verde foresta
      data: currentData.value.map(row => row.bonds)
    },
    {
      label: 'ETF',
      backgroundColor: '#1e40af', // ciano
      data: currentData.value.map(row => row.etf)
    },
    {
      label: 'Crypto',
      backgroundColor: '#b91c1c', // rosso intenso
      data: currentData.value.map(row => row.crypto)
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: {
      stacked: true,
      ticks: {
        callback: (value: number) => formatCurrency(value, true)
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw || 0
          return `${context.dataset.label}: ${formatCurrency(value)}`
        }
      }
    },
    datalabels: {
      formatter: () => {
        return "";
      },
    }
  }
}

// Formatta la valuta in modo compatto per il grafico se richiesto
const formatCurrency = (value: number, compact = false) => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR'
  }

  if (compact) {
    options.notation = 'compact'
    options.maximumFractionDigits = 1
  }

  return new Intl.NumberFormat('it-IT', options).format(value)
}

// Formatta il periodo (mese o anno)
const formatPeriod = (value: string | number | undefined, short = false) => {
  if (!value) return ''

  if (viewType.value === 'monthly') {
    const monthIndex = parseInt(value.toString()) - 1
    if (monthIndex >= 0 && monthIndex < MONTHS.length) {
      return short ? MONTHS[monthIndex].substring(0, 3) : MONTHS[monthIndex]
    }
    return value.toString()
  }
  return value.toString()
}

// Formatta la percentuale di crescita
const formatGrowth = (value: string | undefined) => {
  if (!value) return '0%'
  return `${parseFloat(value).toFixed(1)}%`
}

// Gestisce il cambio di vista
const switchView = (newView: 'monthly' | 'yearly') => {
  viewType.value = newView
}

watch(years, (newYears) => {
  if (!newYears.includes(selectedYear.value)) {
    selectedYear.value = newYears[0]
  }
}, { immediate: true })
</script>

<style scoped>
.financial-display {
  width: 100%;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.view-selector {
  display: flex;
  gap: 16px;
  align-items: center;
}

.view-label {
  font-weight: 500;
}

.tabs {
  display: flex;
  gap: 8px;
  background-color: var(--color-background-alt);
  padding: 4px;
  border-radius: 8px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 1.1em;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-select {
  padding: 6px 12px;
  border-radius: 6px;
}

.goal-summary {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 8px;
}

.goal-summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.goal-icon {
  font-size: 24px;
}

.goal-text {
  flex: 1;
}

.goal-text h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #047857;
}

.goal-text p {
  margin: 0;
  color: #065f46;
}

.chart-container {
  height: 400px;
  margin-bottom: 30px;
  padding: 16px;
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-background);
}

th,
td {
  padding: 12px 16px;
  text-align: right;
  border: 1px solid var(--color-border);
}

th:first-child,
td:first-child {
  text-align: left;
  font-weight: 500;
}

.total-column {
  font-weight: 500;
  background-color: var(--color-background-alt);
}

.interest-column {
  font-weight: 500;
  color: #047857;
  background-color: rgba(6, 78, 59, 0.05);
}

.goal-reached {
  background-color: #ecfdf5 !important;
  position: relative;
  color: var(--color-success);
}

.goal-reached td {
  font-weight: 500;
  border-top: 2px solid #6ee7b7;
  border-bottom: 2px solid #6ee7b7;
}

.goal-reached td:first-child {
  border-left: 2px solid #6ee7b7;
}

.goal-reached td:last-child {
  border-right: 2px solid #6ee7b7;
}

.goal-reached .total-column {
  color: #047857;
  font-weight: 700;
}

.goal-reached .interest-column {
  color: #047857;
  font-weight: 700;
  background-color: rgba(6, 78, 59, 0.1);
}

.goal-reached:hover {
  background-color: #d1fae5 !important;
}

tr:hover {
  background-color: var(--color-background-hover);
}

@media (max-width: 768px) {
  .display-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .view-selector {
    flex-direction: column;
    align-items: flex-start;
  }

  .year-selector {
    width: 100%;
  }

  .year-select {
    width: 100%;
  }

  .goal-summary-content {
    flex-direction: column;
    text-align: center;
  }

  .goal-text {
    text-align: center;
  }
}
</style>