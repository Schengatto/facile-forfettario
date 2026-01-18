<template>
    <div>
        <div>
            <h2>Tasse e Contributi Previdenziali</h2>
            <div class="text-instructions">Inserisci i tuoi dati per calcolare tasse e contributi </div>
        </div>
        <div class="card-section">
            <SelectOption id="percentualeTasse" label="Percentuale Imposta Sostitutiva" v-model="percentualeTasse"
                :options="[
                    { value: 5, label: '5% (Startup)' },
                    { value: 15, label: '15% (Standard)' }
                ]" :tooltipText="tooltips.tasse" @change="updateValues" />

            <SelectOption id="percentualeImponibile" label="Coefficiente Redditività" v-model="percentualeImponibile"
                :options="[
                    { value: 40, label: '40% (Commercianti/Ristoratori)' },
                    { value: 54, label: '54% (Commercio ambulante di altri prodotti)' },
                    { value: 62, label: '62% (Intermediari del commercio)' },
                    { value: 67, label: '67% (Altre attività economiche/Software Developer)' },
                    { value: 78, label: '78% (Libero professionista)' },
                    { value: 86, label: '86% (Costruzioni e attività immobiliari)' },
                ]" :tooltipText="tooltips.imponibile" @change="updateValues" />

            <SelectOption id="tipoAttivita" label="Tipo di Attività" v-model="tipoAttivita" :options="[
                { value: 'libero-professionista', label: 'Libero Professionista' },
                { value: 'ditta-individuale', label: 'Ditta Individuale' }
            ]" :tooltipText="tooltips.tipoAttivita" @change="updateValues" />

            <SelectOption id="regimePensionistico" label="Contributi Previdenziali" v-model="regimePensionistico"
                :options="regimePensionisticoOptions" :tooltipText="tooltips.pensionistico" @change="updateValues" />

            <div v-if="regimePensionistico === 'artigiani'" class="reduction-options">
                <label class="reduction-label">Riduzione Contributi:</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" v-model="riduzioneContributi" value="none" @change="updateValues">
                        <span>Nessuno sconto</span>
                    </label>

                    <label class="radio-option">
                        <input type="radio" v-model="riduzioneContributi" value="35" @change="updateValues">
                        <span>Sconto 35% (ingresso prima del 2025)</span>
                    </label>

                    <label class="radio-option">
                        <input type="radio" v-model="riduzioneContributi" value="50" @change="updateValues">
                        <span>Sconto 50% (ingresso nel 2025)</span>
                    </label>
                </div>
            </div>

            <div class="employment-section">
                <Checkbox id="hasEmployment" label="Svolgo anche un lavoro da dipendente" v-model="hasEmployment"
                    :tooltipText="tooltips.employment" @change="updateValues" />

                <div v-if="hasEmployment" class="ral-input">
                    <div v-if="hasEmployment && employmentRAL <= MAX_RAL_FORFETTARIO" class="info-box">
                        <p>Con lavoro dipendente (RAL ≤ {{ MAX_RAL_FORFETTARIO.toLocaleString() }}€), verifica le
                            seguenti
                            opzioni:</p>
                    </div>

                    <InputText id="employmentRAL" label="RAL Lavoro Dipendente" v-model="employmentRAL" type="number"
                        :tooltipText="tooltips.ral" @change="updateValues" />

                    <Checkbox id="isFullTime" label="Lavoro Full-Time (40 ore/settimana)" v-model="isFullTime"
                        :tooltipText="tooltips.fullTime" @change="updateValues" />

                    <div v-if="isFullTime && tipoAttivita === 'ditta-individuale'" class="info-box success">
                        <p>Essendo un lavoro full-time, sei esente dal versamento dei contributi minimi sulla partita
                            IVA
                        </p>
                    </div>

                    <Checkbox id="isPublicEmployee" label="Sono un dipendente pubblico" v-model="isPublicEmployee"
                        :tooltipText="tooltips.publicEmployee" @change="updateValues" />

                    <div v-if="isPublicEmployee" class="authorization-section">
                        <Checkbox id="hasAuthorization" label="Ho l'autorizzazione dall'amministrazione"
                            v-model="hasAuthorization" :tooltipText="tooltips.authorization" @change="updateValues" />
                    </div>

                    <div v-if="error" class="warning-message">
                        {{ error }}
                    </div>

                    <div v-if="isFullTime && tipoAttivita === 'ditta-individuale'" class="info-box warning">
                        <p>
                            <strong>Nota importante sui contributi INPS:</strong><br>
                            Anche se sei dipendente full-time, e sei iscritto alla cassa artigiani e commercianti allora
                            puoi chiedere l'esenzione dal versamento dei contributi previdenziali.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { MAX_RAL_FORFETTARIO } from '~/utils/net-profit';

type RegimePensionistico = 'inps' | 'artigiani';
type TipoAttivita = 'libero-professionista' | 'ditta-individuale';

const props = defineProps<{
    percentualeTasse: number;
    percentualeImponibile: number;
    regimePensionistico: RegimePensionistico;
    riduzioneContributi: string;
}>();

const emit = defineEmits<{
    (e: 'update-tax', values: {
        percentualeTasse: number;
        percentualeImponibile: number;
        tipoAttivita: TipoAttivita;
        regimePensionistico: RegimePensionistico;
        riduzioneContributi: string;
        hasEmployment: boolean;
        employmentRAL: number;
        isFullTime: boolean;
        isPublicEmployee: boolean;
        hasAuthorization: boolean;
        error?: string;
    }): void
}>();

// Local state
const percentualeTasse = ref(props.percentualeTasse);
const percentualeImponibile = ref(props.percentualeImponibile);
const tipoAttivita = ref<TipoAttivita>('libero-professionista');
const regimePensionistico = ref<RegimePensionistico>(props.regimePensionistico);
const riduzioneContributi = ref(props.riduzioneContributi);
const hasEmployment = ref(false);
const employmentRAL = ref(0);
const isFullTime = ref(false);
const isPublicEmployee = ref(false);
const hasAuthorization = ref(false);

const error = computed(() => {
    console.log(hasEmployment.value)
    const hasHigherRAL = !!hasEmployment.value && employmentRAL.value > MAX_RAL_FORFETTARIO;
    const isNotAllowed = isPublicEmployee.value && !hasAuthorization.value;
    return hasHigherRAL
        ? `Attenzione: Se svolgi un lavoro come dipendente con una RAL superiore a ${MAX_RAL_FORFETTARIO.toLocaleString()}€ non è possibile accedere al regime forfettario`
        : isNotAllowed ? "È necessaria l'autorizzazione dell'amministrazione pubblica per avere partita IVA" : "";
});

// Tooltips
const tooltips = {
    tasse: `La percentuale di tasse nel regime forfettario è del 5% per i primi 5 anni di attività se si rispettano determinati requisiti, 15% negli altri casi.`,
    imponibile: `La percentuale di fatturato che costituirà la tua base imponibile varia in base al tipo di attività svolta.`,
    tipoAttivita: `La scelta tra libero professionista e ditta individuale influenza il calcolo dei contributi INPS.`,
    employment: `Indica se hai anche un lavoro dipendente. Questo influenzerà il calcolo dei contributi INPS.`,
    ral: `Inserisci la Retribuzione Annua Lorda del tuo lavoro dipendente. Se supera i ${MAX_RAL_FORFETTARIO.toLocaleString()}€ non potrai accedere al regime forfettario.`,
    fullTime: `Se lavori 40 ore settimanali come dipendente e sei iscritto alla cassa artigiani e commercianti puoi chiedere l'esonero dal versamento contributi minimi previdenziali.`,
    pensionistico: `Il regime pensionistico determina come verranno calcolati i tuoi contributi previdenziali. Per artigiani/commercianti con lavoro dipendente full-time, si versano contributi solo sulla parte eccedente il minimale. Per i liberi professionisti si calcola sempre una percentuale sul fatturato.`,
    publicEmployee: `I dipendenti pubblici necessitano di autorizzazione per avere partita IVA.`,
    authorization: `L'autorizzazione dell'amministrazione è necessaria per la compatibilità con il regime forfettario.`
};

// Computed per opzioni regime pensionistico basate sul tipo attività
const regimePensionisticoOptions = computed(() => {
    if (tipoAttivita.value === 'libero-professionista') {
        const baseLabel = isFullTime.value ?
            'INPS Gestione Separata (24%)' :
            hasEmployment.value ?
                'INPS Gestione Separata (24%)' :
                'INPS Gestione Separata (26%)';
        return [{ value: 'inps', label: baseLabel }];
    } else {
        return [{
            value: 'artigiani',
            label: isFullTime.value ?
                'Artigiani e Commercianti (esente da contributi minimi)' :
                'Artigiani e Commercianti (contributo minimo + quota eccedente)'
        }];
    }
});

// Update handler
const updateValues = () => {
    emit('update-tax', {
        percentualeTasse: Number(percentualeTasse.value),
        percentualeImponibile: Number(percentualeImponibile.value),
        tipoAttivita: tipoAttivita.value,
        regimePensionistico: regimePensionistico.value,
        riduzioneContributi: String(riduzioneContributi.value),
        hasEmployment: hasEmployment.value,
        employmentRAL: employmentRAL.value,
        isFullTime: isFullTime.value,
        isPublicEmployee: isPublicEmployee.value,
        hasAuthorization: hasAuthorization.value,
        error: error.value,
    });
};

// Watch changes
watch([hasEmployment, employmentRAL, isFullTime, isPublicEmployee, hasAuthorization], () => {
    updateValues();
});
</script>

<style scoped>
.input-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
}

.reduction-options {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--color-background-alt);
    border-radius: 4px;
}

.reduction-label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.radio-option {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 30px 100%;
    cursor: pointer;
}

.radio-option input[type="radio"] {
    margin: 0;
}

.employment-section {
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: var(--gray-900);
    background-color: #f8fafc;
}

.ral-input {
    margin-top: 15px;
    margin-left: 20px;
}

.warning-message {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 8px;
    padding: 8px;
    background-color: #fff5f5;
    border-radius: 4px;
}

.info-box {
    padding: 15px;
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #ebf8ff;
    border-left: 4px solid #4299e1;
    border-radius: 4px;
}

.info-box.success {
    background-color: #f0fff4;
    border-left-color: #48bb78;
}

.info-box p {
    margin: 0 0 10px 0;
    font-weight: 500;
}

.info-box ul {
    margin: 0;
    padding-left: 20px;
}

.info-box li {
    margin: 5px 0;
}

.authorization-section {
    margin-top: 10px;
    padding: 10px;
    background-color: #f7fafc;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .radio-group {
        gap: 1rem;
    }

    .employment-section {
        padding: 10px;
    }

    .ral-input {
        margin-left: 10px;
    }
}
</style>