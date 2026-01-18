<template>
    <div class="monthly-details">
        <h4>{{ title }}</h4>
        <table>
            <thead>
                <tr>
                    <th>{{ t('planner.plannerConfig.monthlyDetailsHeaders.month') }}</th>
                    <th v-if="showWorkDays">{{ t('planner.plannerConfig.monthlyDetailsHeaders.workDays') }}</th>
                    <th v-if="showFreeDays">{{ t('planner.plannerConfig.monthlyDetailsHeaders.freeDays') }}</th>
                    <th>{{ t('planner.plannerConfig.monthlyDetailsHeaders.estimatedRevenue') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="month in monthlyData" :key="month.name">
                    <td>{{ t(`planner.months.${month.name}`) }}</td>
                    <td v-if="showWorkDays" class="num-column">{{ month.workDays }}</td>
                    <td v-if="showFreeDays" class="num-column">{{ month.freeDays }}</td>
                    <td class="num-column">{{ formatCurrency(month.estimatedRevenue) }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td><strong>{{ t('planner.plannerConfig.total') }}</strong></td>
                    <td v-if="showWorkDays" class="num-column"><strong>{{ totalWorkDays }}</strong></td>
                    <td v-if="showFreeDays" class="num-column"><strong>{{ totalFreeDays }}</strong></td>
                    <td class="num-column"><strong>{{ formatCurrency(totalAnnualIncome) }}</strong></td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface MonthData {
    name: number;
    workDays?: number;
    freeDays?: number;
    estimatedRevenue: number;
}

const props = defineProps<{
    title: string;
    monthlyData: MonthData[];
    showWorkDays?: boolean;
    showFreeDays?: boolean;
}>();

const totalWorkDays = computed(() =>
    props.monthlyData.reduce((sum, month) => sum + (month.workDays || 0), 0)
);

const totalFreeDays = computed(() =>
    props.monthlyData.reduce((sum, month) => sum + (month.freeDays || 0), 0)
);

const totalAnnualIncome = computed(() =>
    props.monthlyData.reduce((sum, month) => sum + month.estimatedRevenue, 0)
);
</script>

<style scoped>
.monthly-details {
    margin-top: 20px;
}

.monthly-details table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.monthly-details th,
.monthly-details td {
    border: 1px solid #e2e8f0;
    padding: 8px;
    text-align: left;
}

.monthly-details tfoot {
    font-weight: bold;
    background-color: #c0c4c89d;
    color: black;
}

.num-column {
    text-align: right !important;
}

@media (max-width: 768px) {
    .monthly-details table {
        font-size: 0.9rem;
    }
}
</style>