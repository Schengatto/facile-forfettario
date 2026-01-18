<template>
    <div class="invoice-preview">
        <div class="preview-container">
            <!-- Header -->
            <div class="header">
                <h1 class="title">{{ t('planner.invoiceGenerator.invoiceTitle', { number: placeholders.invoiceNumber })
                    }}</h1>
                <p class="date">{{ t('planner.invoiceGenerator.date') }}: {{ formatDate(new
                    Date(placeholders.invoiceDate)) }}</p>
            </div>

            <!-- Company Details -->
            <div class="section">
                <h2 class="section-title">{{ t('planner.invoiceGenerator.companyDetails') }}</h2>
                <p>{{ placeholders.yourCompany }}</p>
                <p>{{ placeholders.yourAddress }}</p>
                <p>{{ t('planner.invoiceGenerator.vatNumber') }}: {{ placeholders.yourVAT }}</p>
            </div>

            <!-- Client Details -->
            <div class="section">
                <h2 class="section-title">{{ t('planner.invoiceGenerator.clientDetails') }}</h2>
                <p>{{ placeholders.clientName }}</p>
                <p>{{ placeholders.clientAddress }}</p>
            </div>

            <!-- Invoice Table -->
            <div class="table-container">
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th class="text-left">{{ t('planner.invoiceGenerator.description') }}</th>
                            <th class="text-right">{{ t('planner.invoiceGenerator.date') }}</th>
                            <th class="text-right">{{ t('planner.invoiceGenerator.hours') }}</th>
                            <th class="text-right">{{ t('planner.invoiceGenerator.amount') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(entry, index) in dailyEntries" :key="index">
                            <td>{{ t('planner.invoiceGenerator.consultingServices') }}</td>
                            <td class="text-right">{{ entry.date }}</td>
                            <td class="text-right">{{ entry.hours }}</td>
                            <td class="text-right">€{{ formatAmount(entry.amount) }}</td>
                        </tr>
                        <tr class="total-row">
                            <td>{{ t('planner.invoiceGenerator.total') }}</td>
                            <td></td>
                            <td class="text-right">{{ totalHoursWorked }}</td>
                            <td class="text-right">€{{ formatAmount(totalRevenue) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Payment Instructions -->
            <div class="section">
                <h2 class="section-title">{{ t('planner.invoiceGenerator.paymentInstructions') }}</h2>
                <div class="separator"></div>
                <p>{{ placeholders.paymentMethods }}</p>
                <p>{{ t('planner.invoiceGenerator.paymentReference', { number: placeholders.invoiceNumber }) }}</p>
                <p>{{ t('planner.invoiceGenerator.paymentDue') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface DailyEntry {
    date: string;
    hours: number;
    amount: number;
}

interface Placeholders {
    invoiceNumber: string;
    yourCompany: string;
    yourAddress: string;
    yourVAT: string;
    clientName: string;
    clientAddress: string;
    paymentMethods: string;
    invoiceDate: string;
}

const props = defineProps({
    selectedYear: {
        type: Number,
        required: true
    },
    currentMonth: {
        type: Number,
        required: true
    },
    dailyHours: {
        type: Object as PropType<Record<string, number>>,
        required: true
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    totalHoursWorked: {
        type: Number,
        required: true
    },
    totalRevenue: {
        type: Number,
        required: true
    },
    placeholders: {
        type: Object as PropType<Placeholders>,
        required: true
    },
});

const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
};

const formatAmount = (amount: number): string => {
    return amount.toFixed(2);
};

const dailyEntries = computed<DailyEntry[]>(() => {
    return Object.entries(props.dailyHours)
        .filter(([dateKey, hours]) => {
            const [year, month] = dateKey.split('-').map(Number);
            return year === props.selectedYear && month === props.currentMonth && hours > 0;
        })
        .sort(([dateKeyA], [dateKeyB]) => {
            const dayA = parseInt(dateKeyA.split('-')[2]);
            const dayB = parseInt(dateKeyB.split('-')[2]);
            return dayA - dayB;
        })
        .map(([dateKey, hours]) => {
            const [, , day] = dateKey.split('-');
            const amount = hours * props.hourlyRate;
            return {
                date: `${day}/${props.currentMonth + 1}/${props.selectedYear}`,
                hours,
                amount
            };
        });
});
</script>

<style scoped>
.invoice-preview {
    background-color: inherit;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-container {
    max-width: 800px;
    margin: 0 auto;
}

.header {
    margin-bottom: 2rem;
}

.title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.date {
    color: #666;
}

.section {
    margin-bottom: 1.5rem;
}

.section-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.table-container {
    margin: 2rem 0;
    overflow-x: auto;
}

.invoice-table {
    width: 100%;
    border-collapse: collapse;
}

.invoice-table th,
.invoice-table td {
    padding: 0.75rem;
    border: 1px solid #ddd;
}

.invoice-table th {
    background-color: var(--color-secondary-background);
    color: var(--color-secondary-text);
    font-weight: bold;
}

.text-right {
    text-align: right;
}

.text-left {
    text-align: left;
}

.total-row {
    font-weight: bold;
    background-color: inherit;
}

.separator {
    height: 1px;
    background-color: #ddd;
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .invoice-preview {
        padding: 1rem;
    }

    .title {
        font-size: 1.25rem;
    }
}
</style>