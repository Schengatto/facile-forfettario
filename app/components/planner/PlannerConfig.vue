<template>
    <div>
        <div class="planner-header">
            <h1 class="page-title">{{ t('planner.plannerConfig.title') }}</h1>
            <div class="header-actions">
                <button @click="loadConfiguration" class="btn-secondary">{{ t('planner.plannerConfig.loadButton', {
                    year:
                        selectedYear
                }) }}</button>
                <button @click="generatePlanner" :disabled="!isValid" class="btn">{{ t('planner.plannerConfig.generateButton')
                    }}</button>
            </div>
        </div>

        <div class="calculator-card">
            <div class="input-group">
                <div class="input-field" v-for="field in inputFields" :key="field.id">
                    <label :for="field.id">{{ t(field.label) }}</label>
                    <input :id="field.id" v-model.number="field.model" :type="field.type" :placeholder="t(field.label)"
                        :min="field.min" @input="validateInputs">
                </div>
            </div>
        </div>

        <div v-if="validationError" class="error-message">{{ validationError && t(validationError) }}</div>

        <div class="daily-hours-config">
            <h4>{{ t('planner.plannerConfig.dailyHoursTitle') }}</h4>
            <div class="daily-hours-inputs">
                <div v-for="day in [1, 2, 3, 4, 5, 6, 0]" :key="day" class="daily-hour-input">
                    <label :for="'hours-' + day">{{ t(`planner.weekDays.long.${day}`) }}</label>
                    <input :id="'hours-' + day" v-model.number="dailyHours[day]" type="number" min="0" max="24" step="1"
                        @input="validateInputs">
                </div>
            </div>
        </div>

        <MonthlyRevenueTable :title="t('planner.plannerConfig.monthlyDetailsTitle', { year: selectedYear })"
            :monthlyData="monthlyDetailsWithRevenue" :showWorkDays="true" :showFreeDays="true" />

        <div v-if="totalAnnualIncome > 85000" class="warning-message">
            {{ t('planner.warningMessage') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n';
import MonthlyRevenueTable from './MonthlyRevenueTable.vue';

const { t } = useI18n();

const emit = defineEmits<{
    (e: 'generate', values: {
        selectedYear: number;
        hourlyRate: number;
        totalAnnualIncome: number;
        totalWorkDays: number;
        totalFreeDays: number;
        dailyHours: Record<string, number>;
        monthlyDetails: Array<{ name: number; workDays: number; freeDays: number; estimatedRevenue: number; }>;
        previousIncome: number;
    }): void,
    (e: "loadConfig", selectedYear: number): void,
}>();

const props = defineProps<{
    selectedYear: number;
    hourlyRate: number;
    dailyHours: Record<string, number>;
}>();

const selectedYear = ref(props.selectedYear ?? new Date().getFullYear());
const hourlyRate = ref(props.hourlyRate ?? 0);
const validationError = ref('');
const previousIncome = ref(0);

const inputFields = reactive([
    { id: 'yearSelect', label: 'planner.plannerConfig.inputFields.year', model: selectedYear, type: 'number', min: new Date().getFullYear() },
    { id: 'hourlyRate', label: 'planner.plannerConfig.inputFields.hourlyRate', model: hourlyRate, type: 'number', min: 1 },
    { id: 'previousIncome', label: 'planner.plannerConfig.inputFields.previousIncome', model: previousIncome, type: 'number', min: 0 }
]);

const dailyHours = reactive<Record<string, number>>({
    '1': props?.dailyHours!['1'] ?? 8, // Monday
    '2': props?.dailyHours!['2'] ?? 8, // Tuesday
    '3': props?.dailyHours!['3'] ?? 8, // Wednesday
    '4': props?.dailyHours!['4'] ?? 8, // Thursday
    '5': props?.dailyHours!['5'] ?? 8, // Friday
    '6': props?.dailyHours!['6'] ?? 0, // Saturday
    '0': props?.dailyHours!['0'] ?? 0, // Sunday
});

const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const calculateWorkdaysInMonth = (year: number, month: number): number => {
    const endDate = new Date(year, month + 1, 0);
    return Array.from({ length: endDate.getDate() }, (_, i) => new Date(year, month, i + 1))
        .filter(date => {
            const dayName = date.getDay().toString();
            return Number(dailyHours[dayName]) > 0;
        })
        .length;
};

const monthlyDetails = computed(() =>
    months.map((month) => {
        const workDays = calculateWorkdaysInMonth(selectedYear.value, month);
        const totalDays = new Date(selectedYear.value, month + 1, 0).getDate();
        return { name: month, workDays, freeDays: totalDays - workDays };
    })
);

const monthlyDetailsWithRevenue = computed(() =>
    monthlyDetails.value.map(month => ({
        ...month,
        estimatedRevenue: calculateMonthRevenue(month)
    }))
);

const calculateMonthRevenue = (month: { name: number }) => {
    const daysInMonth = new Date(selectedYear.value, month.name + 1, 0).getDate();
    let revenue = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear.value, month.name, day);
        const dayName = date.getDay().toString();
        revenue += dailyHours[dayName] * hourlyRate.value;
    }

    return revenue;
};

const totalWorkDays = computed(() =>
    monthlyDetails.value.reduce((sum, month) => sum + month.workDays, 0)
);

const totalFreeDays = computed(() =>
    monthlyDetails.value.reduce((sum, month) => sum + month.freeDays, 0)
);

const totalAnnualIncome = computed(() =>
    monthlyDetailsWithRevenue.value.reduce((sum, month) => sum + month.estimatedRevenue, 0)
);

const validateInputs = () => {
    if (hourlyRate.value < 1) {
        validationError.value = 'planner.plannerConfig.validationErrors.invalidHourlyRate';
    } else {
        validationError.value = '';
    }
};

const isValid = computed(() => validationError.value === '');

const generatePlanner = () => {
    if (isValid.value) {
        emit('generate', {
            selectedYear: selectedYear.value,
            hourlyRate: hourlyRate.value,
            totalAnnualIncome: totalAnnualIncome.value,
            totalWorkDays: totalWorkDays.value,
            totalFreeDays: totalFreeDays.value,
            monthlyDetails: monthlyDetailsWithRevenue.value,
            dailyHours,
            previousIncome: previousIncome.value,
        });
    }
};

const loadConfiguration = () => {
    emit('loadConfig', selectedYear.value);
}

validateInputs();
</script>

<style scoped>
.planner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.calculator-card {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
}

.input-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-field label {
    font-size: 0.875rem;
    font-weight: 600;
}

.daily-hours-config {
    margin-top: 20px;
}

.daily-hours-inputs {
    display: flex;
    flex-wrap: wrap;
    justify-content: safe;
    gap: 3%;
    margin-top: 10px;
}

.daily-hour-input {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.daily-hour-input label {
    margin-bottom: 5px;
    font-weight: bold;
}

.daily-hour-input input {
    width: 60px;
    padding: 5px;
    text-align: center;
}

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

.warning-message {
    color: #b7791f;
    font-weight: bold;
    margin-top: 10px;
    padding: 10px;
    background-color: #fefcbf;
    border: 1px solid #d69e2e;
    border-radius: 4px;
}

.error-message {
    color: #c53030;
    font-weight: bold;
    margin-top: 10px;
    padding: 10px;
    background-color: #fed7d7;
    border: 1px solid #e53e3e;
    border-radius: 4px;
}

.action-button {
    padding: 10px 20px;
    background-color: hsl(160, 87%, 47%);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.action-button:hover {
    background-color: #45a049;
}

.generate-button {
    padding: 10px 20px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.generate-button:hover:not(:disabled) {
    background-color: #7278f6;
}

.generate-button:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .planner-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        margin-top: 10px;
        width: 100%;
        flex-direction: row-reverse;
    }

    .input-group {
        grid-template-columns: 1fr;
    }

    .daily-hours-inputs {
        flex-direction: column;
        gap: 12px;
    }

    .daily-hour-input {
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
    }

    .monthly-details table {
        font-size: 0.9rem;
    }
}
</style>