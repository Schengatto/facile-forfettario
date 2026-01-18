<template>
    <div>
        <div>
            <h2>Previsione Fatturato Annuale</h2>
            <div class="text-instructions">Indica l'importo del fatturato che prevedi di generare nell’arco di un anno.
            </div>
        </div>
        <div class="card-section">
            <div class="label">Modalità di calcolo</div>
            <div class="flex rate-option-container">
                <div class="rate-option" :class="{ active: !ratePlanner }" @click="setAnnualRateMode">Fatturato annuo
                </div>
                <div class="rate-option" :class="{ active: !!ratePlanner }" @click="setHourlyRateMode">Rate giornaliero
                </div>
            </div>
        </div>
        <div class="calculator-card">
            <div class="input-group">
                <template v-if="ratePlanner">
                    <div class="input-field">
                        <label for="hourlyRate">Tariffa oraria (€)</label>
                        <input id="hourlyRate" v-model.number="hourlyRate" type="number" placeholder="Tariffa oraria"
                            :min="0" @input="updateValues">
                    </div>
                    <div class="input-field">
                        <label for="hoursPerDay">Ore lavorate al giorno</label>
                        <input id="hoursPerDay" v-model.number="hoursPerDay" type="number" :max="24" :min="0"
                            placeholder="Ore al giorno" @input="updateValues">
                    </div>
                    <div class="input-field">
                        <label for="holidays">Giorni di riposo</label>
                        <input id="holidays" v-model.number="holidays" type="number" :max="365" :min="0"
                            placeholder="Giorni liberi" @input="updateValues">
                    </div>
                </template>
                <template v-else>
                    <div class="input-field">
                        <label for="hourlyRate">Fatturato annuo</label>
                        <input id="annualIncome" v-model.number="annualIncome" type="number" :min="0"
                            placeholder="Fatturato Annuo" @input="updateValues">
                    </div>
                </template>
            </div>
        </div>
        <template v-if="ratePlanner">
            <div class="mh-2">
                <WorkdaySelector @update="updateWorkdays" />
            </div>
            <div v-if="ratePlanner">Tariffa giornaliera: <strong>{{ formatCurrency(dailyRate) }}</strong></div>
            <div>Giorni lavorati: <strong>{{ workDays }}</strong></div>
            <div>Giorni liberi: <strong>{{ freeDays }}</strong></div>
        </template>
        <div class="income-amount">
            Previsione fatturato incassato annuo:
            <b :class="{ 'green-text': totalAnnualIncome <= 85000, 'red-text': totalAnnualIncome > 85000 }">
                {{ formatCurrency(totalAnnualIncome) }}
            </b>
        </div>
        <div v-if="totalAnnualIncome > 85000" class="warning-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    initialAnnualIncome: number | null
}>();

const emit = defineEmits<{
    (e: 'update-income', values: {
        hoursPerDay: number;
        daysPerYear: number;
        hourlyRate: number;
        totalAnnualIncome: number;
        workDays: number;
        freeDays: number;
    }): void
}>();

const hoursPerDay = ref<number>(8);
const hourlyRate = ref<number>(0);
const annualIncome = ref<number>(props.initialAnnualIncome || 0);
const ratePlanner = ref<boolean>(false);
const holidays = ref<number>(0);

const error = computed<string>(() => totalAnnualIncome.value > 85000
    ? "Attenzione: Incassare un fatturato superiore a 85.000€ comporterà automaticamente l'esclusione dal regime forfettario. Per esser certo di restare entro il limite del regime prova a ridurre la tua tariffa oraria o il numero di ore o giorni lavorati."
    : ""
);

const workdays = ref<number[]>([1, 2, 3, 4, 5]); // 1 = lunedì, 2 = martedì, ..., 7 = domenica

const calculateWorkdaysInYear = (selectedDays: number[]): number => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    let workdaysCount = 0;

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay() || 7; // getDay() restituisce 0 per domenica, lo convertiamo in 7
        if (selectedDays.includes(dayOfWeek)) {
            workdaysCount++;
        }
    }

    return workdaysCount;
};

const updateWorkdays = (selectedDays: number[]) => {
    workdays.value = selectedDays;
    updateValues();
};

const workDays = computed((): number => {
    return Math.max(calculateWorkdaysInYear(workdays.value) - holidays.value, 0);
});

const freeDays = computed((): number => {
    const totalDaysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;
    return Math.min(totalDaysInYear - workDays.value, totalDaysInYear);
});

const totalAnnualIncome = computed<number>(() => {
    if (ratePlanner.value) {
        return hourlyRate.value * hoursPerDay.value * workDays.value;
    } else {
        return annualIncome.value;
    }
});

const dailyRate = computed((): number => {
    return ratePlanner.value ? hourlyRate.value * hoursPerDay.value : annualIncome.value / workDays.value;
});

watch(() => props.initialAnnualIncome, (newValue) => {
    if (newValue !== null) {
        annualIncome.value = newValue;
        ratePlanner.value = false;
        updateValues();
    }
}, { immediate: true });

const setAnnualRateMode = () => {
    ratePlanner.value = false;
    updateValues();
}

const setHourlyRateMode = () => {
    ratePlanner.value = true;
    updateValues();
}

const toggleInputMode = () => {
    ratePlanner.value = !ratePlanner.value;
    if (ratePlanner.value) {
        annualIncome.value = 0;
    } else {
        hourlyRate.value = 0;
    }
    updateValues();
}

const updateValues = () => {
    const data = {
        hoursPerDay: Math.max(hoursPerDay.value || 0),
        daysPerYear: Math.max(workDays.value || 0),
        hourlyRate: Math.max(hourlyRate.value || 0),
        totalAnnualIncome: totalAnnualIncome.value || 0,
        workDays: Math.max(workDays.value || 0),
        freeDays: Math.max(freeDays.value || 0),
        error: error.value,
    }
    emit('update-income', data);
};
</script>

<style scoped>
.calculator-card {
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

.results-section {
    background-color: #f8fafc;
    border-radius: 0.5rem;
    padding: 1.5rem;
}

.results-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 1rem;
}

.result-item span:first-child {
    font-weight: 600;
}

.result-item span:last-child {
    font-weight: 700;
}

.income-amount {
    margin-top: 20px;
}

.green-text {
    color: var(--color-success);
}

.red-text {
    color: red;
}

.warning-message {
    color: red;
    font-weight: bold;
    margin-top: 20px;
}

.rate-option-container {
    gap: 8px;
}

.rate-option {
    font-size: 0.875rem;
    padding: 8px 16px;
    border: var(--gray-100) solid 1px;
    cursor: pointer;
}

.active {
    border-color: var(--primary-400);
}

@media (max-width: 960px) {
    .input-group {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
}
</style>