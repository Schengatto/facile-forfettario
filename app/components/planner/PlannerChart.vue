<template>
    <div class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useI18n } from 'vue-i18n';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { t } = useI18n();

const props = defineProps({
    monthlyRevenue: {
        type: Object,
        required: true
    },
    monthlyInvoicedRevenue: {
        type: Object,
        required: true
    },
    selectedYear: {
        type: Number,
        required: true
    }
});

const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const chartData = computed(() => ({
    labels: months.map(month => t(`planner.months.${month}`)),
    datasets: [
        {
            label: t('planner.plannerChart.invoicedRevenue', { year: props.selectedYear }),
            data: months.map((month) => props.monthlyInvoicedRevenue[month] || 0),
            borderColor: 'rgb(16, 224, 155)',
            backgroundColor: 'rgba(16, 224, 155, 0.2)',
            tension: 0.01,
            fill: true,
        },
        {
            label: t('planner.plannerChart.totalRevenue', { year: props.selectedYear }),
            data: months.map((month) => props.monthlyRevenue[month] || 0),
            borderColor: 'rgb(242, 201, 114)',
            backgroundColor: 'rgba(242, 201, 114, 0.2)',
            tension: 0.01,
            fill: false,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: false,
            title: {
                display: true,
                text: t('planner.plannerChart.yAxisLabel')
            },
        },
    },
    elements: {
        point: {
            radius: 5,
            hoverRadius: 10,
            backgroundColor: 'white',
            borderWidth: 2,
            pointStyle: 'circle'
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
        },
        tooltip: {
            enabled: true,
            callbacks: {
                label: function (context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        },
        datalabels: {
            formatter: () => {
                return "";
            },
            color: '#000',
        },
        filler: {
            propagate: true,
        }
    }
}));
</script>

<style scoped>
.chart-container {
    margin: 20px 0;
    height: 400px;
    background-color: white;
}
</style>