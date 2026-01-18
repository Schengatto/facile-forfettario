<script setup>
import { defineProps, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);


const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => {
  // Calcolo del totale delle tasse (aziendali + personali)
  const totaleTasse = props.results.totaleTasseAziendali + // IRES + IRAP
                     props.results.irpefAmministratore +    // IRPEF
                     props.results.contributiInps +         // Ritenuta INPS
                     props.results.tfmAnnuale * 0.23 +     // Ritenuta TFM
                     props.results.ritenutaDividendi        // Ritenuta dividendi

  const data = {
    labels: [
      'Totale Tasse e contributi',
      'Netto Personale',
      'Utile in Azienda'
    ],
    datasets: [{
      data: [
        totaleTasse,
        props.results.totaleNettoPersonale,
        props.results.utileNetto
      ],
      backgroundColor: [
        '#FF9F40', // Tasse (tutte)
        '#36A2EB', // Netto Amministratore
        '#34D399', // TFM Netto
        '#A78BFA', // Dividendi Netti
        '#FCD34D', // Buoni Pasto
        '#FF4F70'  // Utile in Azienda
      ],
      hoverBackgroundColor: [
        '#FF8B26', // Tasse hover
        '#2288D1', // Netto Amministratore hover
        '#10B981', // TFM Netto hover
        '#8B5CF6', // Dividendi Netti hover
        '#F59E0B', // Buoni Pasto hover
        '#FF4F70'  // Utile in Azienda hover
      ]
    }]
  }
  return data
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: {
          size: 12
        },
        generateLabels: (chart) => {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i]
              const total = (props.results.fatturatoNetto - props.results.costiOperativi);
              const percentage = ((value / total) * 100).toFixed(1)
              return {
                text: `${label}: ${percentage}% - ${value.toFixed(2)}€`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw
          const total = (props.results.fatturatoNetto - props.results.costiOperativi);
          const percentage = ((value / total) * 100).toFixed(2)
          return `${context.label}: ${percentage}% (€${value.toLocaleString('it-IT')})`
        }
      }
    },
    datalabels: {
      formatter: (value, ctx) => {
        const datapoints = ctx.chart.data.datasets[0].data;
        const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
        return percentage + '%';
      },
      color: '#fff',
    }
  }
}
</script>

<template>
  <div class="chart-section">
    <h3>Distribuzione dell'utile</h3>
    <div class="chart-container">
      <Pie :data="chartData" :options="chartOptions" :height="300" />
    </div>
  </div>
</template>

<style scoped>
.chart-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.chart-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.chart-container {
  height: 300px;
  position: relative;
}

@media (max-width: 640px) {
  .chart-container {
    height: 400px;
  }
}
</style>