<template>
    <div>
        <SaveConfigModal v-model="showSaveModal" @save="handleSaveConfirm" />
        <LoadConfigModal v-model="showLoadModal" @load="handleLoadConfirm" />

        <div class="language-selector">
            <LanguageSelector :isMobile="true" />
        </div>

        <PlannerConfig v-if="!showPlanner" :selected-year="selectedYear" :hourly-rate="hourlyRate"
            :daily-hours="defaultDailyHours" @generate="generatePlanner" @load-config="loadConfiguration" />

        <div v-if="showPlanner">
            <div class="planner-header">
                <h1 class="page-title">{{ t('planner.title', { year: selectedYear }) }}</h1>
                <div class="header-actions">
                    <button @click="saveConfiguration" class="btn-secondary">{{ t('planner.actions.save') }}</button>
                    <button @click="loadConfiguration" class="btn-secondary">{{ t('planner.actions.load') }}</button>
                    <button v-if="isMounted" @click="exportYearlyData" class="btn-secondary">{{
                        t('planner.actions.export') }}</button>
                    <button @click="resetPlanner" class="btn btn-create__mobile">{{ t('planner.actions.new') }}</button>
                    <button @click="createNewPlanner" class="btn btn-create__desktop">{{ t('planner.actions.new')
                        }}</button>
                </div>
            </div>

            <div class="month-selector">
                <button @click="previousMonth" :disabled="currentMonth === 0">&lt;</button>
                <span>{{ t(`planner.months.${currentMonth}`) }} {{ selectedYear }}</span>
                <button @click="nextMonth" :disabled="currentMonth === 11">&gt;</button>
            </div>

            <div class="country-selector">
                <label>{{ t('planner.holidayCountry') }}:</label>
                <select v-model="selectedCountry" @change="updateHolidayCountry(selectedCountry)">
                    <option value="IT">{{ t('planner.countries.italy') }}</option>
                    <option value="GB-ENG">{{ t('planner.countries.uk') }}</option>
                </select>
            </div>

            <table class="calendar">
                <thead>
                    <tr>
                        <th v-for="day in [1, 2, 3, 4, 5, 6, 0]" :key="day">{{ t(`planner.weekDays.short.${day}`) }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="week in calendarDays" :key="week[0].date.toISOString()">
                        <td v-for="day in week" :key="day.date.toISOString()"
                            :class="{ 'non-working-day': !isWorkingDay(day.date) && isCurrentMonth(day.date), 'other-month': !isCurrentMonth(day.date) }">
                            <div class="date">
                                {{ day.date.getDate() }}
                                <span v-if="isCurrentMonth(day.date) && getHolidayInfo(day.date)" class="holiday"
                                    :title="getHolidayInfo(day.date)?.name">
                                    🎉
                                </span>
                            </div>
                            <input v-if="isCurrentMonth(day.date)" v-model.number="dailyHours[getDateKey(day.date)]"
                                type="number" min="0" max="24" step="1" @input="updateMonthData(day.date)"
                                :title="isWorkingDay(day.date) ? t('planner.workingHours') : t('planner.nonWorkingDay')">
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="summary">
                <div class="month-revenue">
                    <p>{{ t('planner.summary.hoursWorked') }} <strong>{{ totalHoursWorked }}</strong></p>
                    <p>{{ t('planner.summary.revenue') }} <strong>{{ formatCurrency(totalRevenue) }}</strong></p>
                </div>

                <div class="month-invoice">
                    <label>
                        <input type="checkbox" v-model="monthlyInvoiced[currentMonth]" @change="updateInvoicedStatus">
                        {{ t('planner.summary.invoiced') }}
                    </label>
                    <PlannerInvoiceGenerator :selectedYear="selectedYear" :currentMonth="currentMonth"
                        :monthlyRevenue="monthlyRevenue" :hourlyRate="hourlyRate" :dailyHours="dailyHours"
                        :totalHoursWorked="totalHoursWorked" :totalRevenue="totalRevenue" :months="months" />
                </div>
            </div>

            <hr />

            <h2>{{ t('planner.yearOverview', { year: selectedYear }) }}</h2>

            <div v-if="totalInvoicedRevenue > 85000" class="error-message">
                {{ t('planner.warningMessage') }}
            </div>

            <div class="summary">
                <p>{{ t('planner.previousYearIncome', { year: selectedYear }) }} <strong>{{
                    formatCurrency(previousIncome) }}</strong></p>
                <p>{{ t('planner.yearlyRevenue', { year: selectedYear }) }} <strong
                        :class="totalYearlyRevenue <= 85000 ? 'green-text' : 'warn-text'">
                        {{ formatCurrency(totalYearlyRevenue) }}
                    </strong>
                </p>
                <div>
                    <p>
                        {{ t('planner.invoicedRevenue', { year: selectedYear }) }}
                        <strong :class="totalInvoicedRevenue <= 85000 ? 'green-text' : 'red-text'">
                            {{ formatCurrency(totalInvoicedRevenue) }}
                        </strong>
                        <button @click="confirmAndNavigate" :title="t('planner.calculateNet')" class="btn-link">
                            🔎
                        </button>
                    </p>
                </div>
            </div>

            <PlannerChart :monthlyRevenue="monthlyRevenue" :monthlyInvoicedRevenue="monthlyInvoicedRevenue"
                :selectedYear="selectedYear" />

            <MonthlyRevenueTable :title="t('planner.plannerConfig.monthlyDetailsTitle', { year: selectedYear })"
                :monthlyData="monthlyRevenueData" :showWorkDays="true" :showFreeDays="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip';
import { computed, onMounted, ref } from 'vue';
import PlannerChart from './PlannerChart.vue';
import PlannerConfig from './PlannerConfig.vue';
import PlannerInvoiceGenerator from './PlannerInvoiceGenerator.vue';
import MonthlyRevenueTable from './MonthlyRevenueTable.vue';
import Holidays from 'date-holidays'

import { useI18n } from 'vue-i18n';
import SaveConfigModal from './SaveConfigModal.vue';
import LoadConfigModal from './LoadConfigModal.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

interface DayData {
    date: Date;
    dayOfWeek: number;
}

const { savePlannerConfig, loadPlannerConfig, error: storageError } = usePlannerStorage();

const selectedCountry = ref('IT');
const hd = ref(new Holidays('IT'));
const currentMonthHolidays = ref<Record<string, { name: string }>>({});

const showPlanner = ref(false);
const selectedYear = ref(new Date().getFullYear());
const currentMonth = ref(0);
const hourlyRate = ref<number>(0);
const dailyHours = ref<Record<string, number>>({});
const defaultDailyHours = ref<Record<string, number>>({});
const monthlyInvoiced = ref<Record<number, boolean>>({});
const monthlyRevenue = ref<Record<number, number>>({});
const previousIncome = ref<number>(0);
const isMounted = ref<boolean>(false);

const showSaveModal = ref(false);
const showLoadModal = ref(false);

const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const calendarDays = ref<DayData[][]>([]);

const initializeFullYear = () => {
    const year = selectedYear.value;
    for (let month = 0; month < 12; month++) {
        const lastDay = new Date(year, month + 1, 0);
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const dateKey = getDateKey(currentDate);
            const dayOfWeek = currentDate.getDay().toString();
            dailyHours.value[dateKey] = defaultDailyHours.value[dayOfWeek] || 0;
        }
    }
};

const updateCurrentMonthHolidays = () => {
    const startDate = new Date(selectedYear.value, currentMonth.value, 1)
    const endDate = new Date(selectedYear.value, currentMonth.value + 1, 0)

    // Get all holidays for the current month
    const holidays = hd.value.getHolidays(startDate, endDate)

    // Create a map of date strings to holiday info
    currentMonthHolidays.value = holidays.reduce((acc: Record<string, { name: string }>, holiday: { date: string, name: string }) => {
        const date = new Date(holiday.date)
        const dateKey = getDateKey(date)
        acc[dateKey] = { name: holiday.name }
        return acc;
    }, {} as Record<string, { name: string }>)
}

// Function to check if a specific date is a holiday
const getHolidayInfo = (date: Date) => {
    const dateKey = getDateKey(date);
    return currentMonthHolidays.value[dateKey] || null;
}

// Update holidays when country changes
const updateHolidayCountry = (country: string) => {
    selectedCountry.value = country;
    const [_country, _region] = country.split("-");
    hd.value = _region ? new Holidays(_country, _region) : new Holidays(_country);
    updateCurrentMonthHolidays();
}

const generatePlanner = (values: {
    selectedYear: number,
    hourlyRate: number,
    dailyHours: Record<string, number>;
    previousIncome: number;
    totalAnnualIncome: number;
    totalWorkDays: number;
    totalFreeDays: number;
    monthlyDetails: Array<{ name: number; workDays: number; freeDays: number; estimatedRevenue: number; }>;
}) => {
    selectedYear.value = values.selectedYear;
    hourlyRate.value = values.hourlyRate;
    defaultDailyHours.value = values.dailyHours;
    previousIncome.value = values.previousIncome;

    // Initialize monthlyRevenue based on the provided monthlyDetails
    values.monthlyDetails.forEach(month => {
        monthlyRevenue.value[month.name] = month.estimatedRevenue;
    });

    showPlanner.value = true;
    initializeFullYear();
    generateCalendarDays();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

const createNewPlanner = () => {
    if (confirm(t('planner.confirmNewPlanner'))) {
        resetPlanner();
    }
};

const resetPlanner = () => showPlanner.value = false;

const generateCalendarDays = () => {
    updateCurrentMonthHolidays();

    const firstDay = new Date(selectedYear.value, currentMonth.value, 1);
    const lastDay = new Date(selectedYear.value, currentMonth.value + 1, 0);

    const weeks: DayData[][] = [];
    let currentDate = new Date(firstDay);

    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    while (currentDate <= lastDay) {
        const week: DayData[] = [];
        for (let i = 0; i < 7; i++) {
            week.push({
                date: new Date(currentDate),
                dayOfWeek: currentDate.getDay() || 7,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }

    calendarDays.value = weeks;
}

const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.value;

const isWorkingDay = (date: Date) => {
    return dailyHours.value[getDateKey(date)] > 0;
};

const getDateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const updateMonthData = (date: Date) => {
    const month = date.getMonth();
    monthlyRevenue.value[month] = calculateMonthRevenue(month);
};

const updateInvoicedStatus = () => {
    // Aggiorna il fatturato totale incassato quando lo stato di incasso di un mese cambia
};

const calculateMonthRevenue = (month: number) => {
    return Object.entries(dailyHours.value).reduce((total, [dateKey, hours]) => {
        const [year, monthNum, _] = dateKey.split('-').map(Number);
        if (year === selectedYear.value && monthNum === month) {
            return total + (Number(hours) || 0) * hourlyRate.value;
        }
        return total;
    }, 0);
};

const totalHoursWorked = computed(() => {
    return Object.entries(dailyHours.value).reduce((total, [dateKey, hours]) => {
        const [year, month, _] = dateKey.split('-').map(Number);
        if (year === selectedYear.value && month === currentMonth.value) {
            return total + (Number(hours) || 0);
        }
        return total;
    }, 0);
});

const totalRevenue = computed(() => monthlyRevenue.value[currentMonth.value] || 0);

const totalYearlyRevenue = computed(() => {
    return Object.values(monthlyRevenue.value).reduce((total, revenue) => Number(total) + Number(revenue), 0);
});

const totalInvoicedRevenue = computed(() => {
    return Object.entries(monthlyInvoiced.value).reduce((total, [month, isInvoiced]) => {
        if (isInvoiced) {
            return total + (monthlyRevenue.value[Number(month)] || 0);
        }
        return total;
    }, previousIncome.value || 0);
});

const previousMonth = () => {
    if (currentMonth.value > 0) {
        currentMonth.value--;
    } else {
        currentMonth.value = 11;
        selectedYear.value--;
    }
    updateCurrentMonthHolidays();
    generateCalendarDays();
}

const nextMonth = () => {
    if (currentMonth.value < 11) {
        currentMonth.value++;
    } else {
        currentMonth.value = 0;
        selectedYear.value++;
    }
    updateCurrentMonthHolidays();
    generateCalendarDays();
}

const saveConfiguration = () => {
    showSaveModal.value = true;
};

const handleSaveConfirm = async ({ saveToCloud, configId = '' }: { saveToCloud: string, configId: string }) => {
    const configuration = {
        selectedYear: selectedYear.value,
        currentMonth: currentMonth.value,
        hourlyRate: hourlyRate.value,
        dailyHours: dailyHours.value,
        defaultDailyHours: defaultDailyHours.value,
        monthlyInvoiced: monthlyInvoiced.value,
        monthlyRevenue: monthlyRevenue.value,
        previousIncome: previousIncome.value,
    };

    if (saveToCloud) {
        try {
            await savePlannerConfig(configId, configuration);
            alert(`Configurazione salvata con successo su cloud con ID: ${configId}`);
        } catch (error) {
            alert('Errore nel salvataggio su cloud: ' + error);
        }
    } else {
        const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: 'application/json' });
        downloadFile(blob, `planner_config_${selectedYear.value}.json`);
    }
};

const loadConfiguration = () => {
    showLoadModal.value = true;
};

const applyConfiguration = (config: any) => {
    selectedYear.value = config.selectedYear;
    currentMonth.value = config.currentMonth;
    hourlyRate.value = config.hourlyRate;
    dailyHours.value = config.dailyHours;
    defaultDailyHours.value = config.defaultDailyHours;
    monthlyInvoiced.value = config.monthlyInvoiced;
    monthlyRevenue.value = config.monthlyRevenue;
    previousIncome.value = config.previousIncome || 0;
    generateCalendarDays();
    showPlanner.value = true;
};

const handleLoadConfirm = async({ source, configId, file }: {source: 'cloud' | "file", configId: string, file: File }) => {
    try {
        if (source === 'cloud') {
            const config = await loadPlannerConfig(configId);
            if (!config) {
                alert(`Nessuna configurazione trovata con questo codice: ${configId}`);
                return;
            }
            applyConfiguration(config);
            alert(t("planner.configLoadSuccess", { year: selectedYear.value }));
        } else if (source === 'file' && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target?.result as string);
                    applyConfiguration(config);
                    alert(t("planner.configLoadSuccess", { year: selectedYear.value }));
                } catch (error) {
                    alert(t("planner.configLoadError"));
                }
            };
            reader.readAsText(file);
        }
    } catch (error) {
        if (error === 'Configurazione non trovata') {
            alert('Nessuna configurazione trovata con questo codice');
        } else {
            alert('Errore nel caricamento della configurazione: ' + error);
        }
    }
};

const exportYearlyData = async () => {
    const zip = new JSZip();

    for (let month = 0; month < 12; month++) {
        let content = 'Date,Hours,Revenue\n';

        const monthName = months[month];
        const monthRevenue = monthlyRevenue.value[month] || 0;
        const daysInMonth = new Date(selectedYear.value, month + 1, 0).getDate();
        let monthHours = 0;
        let workDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear.value, month, day);
            const dateKey = getDateKey(date);
            const hours = dailyHours.value[dateKey] || 0;
            if (hours > 0) {
                const formattedDate = `${selectedYear.value}/${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
                const dayRevenue = hours * hourlyRate.value;
                content += `${formattedDate},${hours},${dayRevenue.toFixed(2)}\n`;
                monthHours += hours;
                workDays++;
            }
        }

        content += `\nTotal,${monthHours},${monthRevenue.toFixed(2)}\n`;
        content += `Working Days,${workDays}\n`;

        zip.file(`${monthName}_${selectedYear.value}.csv`, content);
    }

    // Add a summary file
    let summaryContent = 'Month,Total Hours,Working Days,Revenue\n';
    for (let month = 0; month < 12; month++) {
        const monthName = months[month];
        const monthRevenue = monthlyRevenue.value[month] || 0;
        const monthData = calculateMonthData(month);
        summaryContent += `${monthName},${monthData.totalHours},${monthData.workDays},${monthRevenue.toFixed(2)}\n`;
    }
    zip.file('yearly_summary.csv', summaryContent);

    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `planner_annuale_${selectedYear.value}.zip`);
};

// Helper function to calculate month data
const calculateMonthData = (month: number) => {
    const daysInMonth = new Date(selectedYear.value, month + 1, 0).getDate();
    let totalHours = 0;
    let workDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear.value, month, day);
        const dateKey = getDateKey(date);
        const hours = dailyHours.value[dateKey] ?? 0;
        if (hours > 0) {
            totalHours += hours;
            workDays++;
        }
    }

    return { totalHours, workDays };
};

const monthlyInvoicedRevenue = computed<Record<number, number>>(() => {
    return Object.entries(monthlyRevenue.value).reduce((output, [month, value]) => ({
        ...output,
        [month]: monthlyInvoiced.value[Number(month)] ? value : 0
    }), {});
});

const monthlyRevenueData = computed(() => {
    return Object.entries(monthlyRevenue.value).map(([month, revenue]) => {
        const monthNumber = parseInt(month);
        const daysInMonth = new Date(selectedYear.value, monthNumber + 1, 0).getDate();
        let workDays = 0;
        let freeDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear.value, monthNumber, day);
            const dateKey = getDateKey(date);
            if (dailyHours.value[dateKey] && dailyHours.value[dateKey] > 0) {
                workDays++;
            } else {
                freeDays++;
            }
        }

        return {
            name: monthNumber,
            workDays,
            freeDays,
            estimatedRevenue: revenue
        };
    });
});

const confirmAndNavigate = () => {
    if (confirm(t('planner.confirmNetCalculation'))) {
        router.push({
            name: 'net-calculator',
            query: { fatturato: Math.round(totalInvoicedRevenue.value) }
        });
    }
};

const loadInitialConfig = async () => {
    const configId = route.query.configId as string;
    
    if (configId && configId.length >= 8) {
        try {
            const config = await loadPlannerConfig(configId);
            if (config) {
                applyConfiguration(config);
            } else {
                // Se la configurazione non esiste, mostra planner vuoto
                showPlanner.value = false;
            }
        } catch (error) {
            // In caso di errore, mostra planner vuoto
            showPlanner.value = false;
            console.error('Errore nel caricamento della configurazione:', error);
        }
    }
};

onMounted(() => {
    initializeFullYear();
    updateCurrentMonthHolidays();
    generateCalendarDays();
    isMounted.value = true;
    loadInitialConfig();
});
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

.return-button,
.action-button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 40px;
}

.return-button:hover,
.action-button:hover {
    background-color: #45a049;
}

.month-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.month-selector button {
    border: 1px solid transparent;
    padding: 5px 10px;
    background-color: var(--color-primary-background);
    color: var(--color-primary-text);
    border-radius: 4px;
    cursor: pointer;
}

.month-selector button:hover {
    border-color: var(--color-primary-background);
    background-color: var(--color-primary-alt);
    color: var(--color-primary-background);
}

.month-selector button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.calendar {
    width: 100%;
    border-collapse: collapse;
}

.calendar th {
    border: 1px solid var(--color-border);
    background-color: #201e1e;
    padding: 10px;
    text-align: center;
    color: #fff;
}

.calendar th {
    font-weight: bold;
}

.calendar td {
    height: 60px;
    vertical-align: top;
    border: 1px solid var(--color-border-green);
    background-color: var(--color-bg-green);
    padding: 10px;
    text-align: center;
}

.calendar .date {
    font-weight: bold;
    margin-bottom: 5px;
    /* color: var(--gray-900); */
}

.calendar input {
    width: 60px;
    text-align: center;
}

.other-month {
    border: 1px solid var(--color-border) !important;
    background-color: transparent !important;
    opacity: 0.5;
    color: var(--color-primary-text) !important;
}

.non-working-day {
    opacity: 0.80;
    border: 1px solid var(--color-border) !important;
    background-color: var(--gray-200) !important;
    color: var(--gray-900) !important;
}

.month-invoice {
    margin-top: 20px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.month-invoice label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.month-invoice input[type="checkbox"] {
    margin-right: 10px;
}

.summary {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
}

.error-message {
    color: red;
    font-weight: bold;
    margin-top: 10px;
    padding: 10px;
    background-color: #FED7D7;
    border: 1px solid #E53E3E;
    border-radius: 4px;
}

.green-text {
    color: var(--color-success);
}

.warn-text {
    color: var(--color-warning);
}

.red-text {
    color: var(--color-danger);
}

.language-selector {
    display: flex;
    justify-content: end;
    justify-items: end;
}

.btn-link {
    margin-left: 10px;
    padding: 5px 10px;
    color: white;
    text-decoration: none;
    background-color: transparent;
    border-radius: 4px;
    font-size: 0.9em;
}

.btn-link:hover {
    background-color: var(--color-primary-alt);
}

.btn-create__mobile {
    display: none;
}

.btn-create__desktop {
    display: block;
}

@media (max-width: 768px) {
    .header-actions {
        margin-top: 10px;
        width: 100%;
        flex-direction: row-reverse;
    }

    .planner-header {
        display: flex;
        flex-direction: column;
    }

    .calendar {
        font-size: 0.9rem;
    }

    .calendar td {
        height: 60px;
        padding: 5px;
    }

    .calendar input {
        width: 40px;
    }

    .summary {
        flex-direction: column;
    }

    .btn-link {
        display: none;
    }

    .btn-create__mobile {
        display: block;
    }

    .btn-create__desktop {
        display: none;
    }
}

.country-selector {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .country-selector {
        flex-direction: column;
        align-items: flex-start;
    }

    .country-selector select {
        width: 100%;
    }
}
</style>