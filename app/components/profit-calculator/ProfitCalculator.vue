<template>
    <div>
        <h1 class="page-title">Forfettario - Calcolatore Reddito Netto</h1>
        <div class="card">
            <ProfitCalculatorIncomePlanner @update-income="updateIncomePlanner"
                :initialAnnualIncome="initialAnnualIncome" />
            <hr />
            <ProfitCalculatorTaxInput :percentualeTasse="percentualeTasse"
                :percentualeImponibile="percentualeImponibile" :regimePensionistico="regimePensionistico"
                :riduzioneContributi="riduzioneContributi" @update-tax="updateValues" />
        </div>
        <template v-if="error">
            <div class="warning-message flex-center">
                <img decoding="async" width="80" height="80" alt="error" :src="errImg" data-object-fit="cover"
                    loading="eager" fetchpriority="high" />
                <div class="text-left">
                    {{ error }}
                </div>
            </div>
        </template>
        <template v-else>
            <div :key="refreshToken">
                <ProfitCalculatorResultDetails :totaleFatturato="totalAnnualIncome"
                    :imponibilePrevidenziale="imponibilePrevidenziale" :imponibileFiscale="imponibileFiscale"
                    :tasseDaVersare="tasseDaVersare" :contributiPrevidenziali="contributiPrevidenziali"
                    :totaleTasseContributi="totaleTasseContributi" :netto="netto" :giorniLavorati="workDays"
                    :giorniLiberi="freeDays" />
            </div>
        </template>
    </div>
    <div>
        <Accordion title="📘 Cosa è il regime forfettario?" short-text="Il regime forfettario è un regime fiscale agevolato per le partite IVA con ricavi
                        fino a...">
            <p class="description">
                Il regime forfettario è un regime fiscale agevolato per le partite IVA con ricavi
                fino a <strong>85.000 € annui</strong>. Prevede una tassazione semplificata e ridotta
                rispetto al regime ordinario.
            </p>

            <div class="columns">
                <div class="box advantages">
                    <h3 class="box-title">
                        <span class="icon success">✔</span>
                        Vantaggi
                    </h3>

                    <ul>
                        <li>Tassazione agevolata al 15% (o 5% per startup)</li>
                        <li>Esenzione IVA (non si addebita né si detrae)</li>
                        <li>Contabilità semplificata</li>
                        <li>No ritenuta d'acconto per alcune categorie</li>
                        <li>Esenzione IRAP</li>
                    </ul>
                </div>

                <div class="box limits">
                    <h3 class="box-title">
                        <span class="icon danger">⛔</span>
                        Limiti e requisiti
                    </h3>

                    <ul>
                        <li>Ricavi massimi: 85.000 €/anno</li>
                        <li>Non si può detrarre l'IVA sugli acquisti</li>
                        <li>Limite spese per collaboratori: 20.000 €/anno</li>
                        <li>Incompatibile con alcune attività</li>
                        <li>Non utilizzabile se si percepisce reddito da lavoro dipendente oltre 35.000 €</li>
                    </ul>
                </div>
            </div>
        </Accordion>
        <Accordion title="📘 Come funziona il calcolo?">
            <div class="calc-steps">

                <div class="step">
                    <div class="circle">1</div>
                    <div>
                        <div><strong>Reddito imponibile</strong> = Fatturato × Coefficiente redditività</div>
                        <small>Il coefficiente varia dal 40% all'86% in base alla categoria professionale</small>
                    </div>
                </div>

                <div class="step">
                    <div class="circle">2</div>
                    <div>
                        <div><strong>Contributi INPS</strong> = Reddito imponibile × Aliquota INPS</div>
                        <small>L'aliquota varia tra il 24.35% e il 26.35% in base alla cassa previdenziale</small>
                    </div>
                </div>

                <div class="step">
                    <div class="circle">3</div>
                    <div>
                        <div><strong>Base imponibile</strong> = Reddito imponibile - Contributi INPS</div>
                        <small>I contributi sono deducibili dal reddito per il calcolo delle tasse</small>
                    </div>
                </div>

                <div class="step">
                    <div class="circle">4</div>
                    <div>
                        <div><strong>Tasse sostitutive</strong> = Base imponibile × Aliquota (5% o 15%)</div>
                        <small>L'aliquota è del 5% per i primi 5 anni (startup), poi 15%</small>
                    </div>
                </div>

                <div class="step">
                    <div class="circle final">5</div>
                    <div>
                        <div><strong>Netto finale</strong> = Fatturato - Contributi INPS - Tasse</div>
                        <small>Questo è quanto ti rimane effettivamente in tasca</small>
                    </div>
                </div>

            </div>
        </Accordion>
        <ProfitCalculatorTaxPaymentInfo />
    </div>
    <div>
        <UsefulLinks :links="externalLinks" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { MINIMALE_2024, MAX_RAL_FORFETTARIO } from '~/utils/net-profit';
import errImg from "~/assets/images/err-calculator.webp";

type RegimePensionistico = 'inps' | 'artigiani';
type TipoAttivita = 'libero-professionista' | 'ditta-individuale';

interface TaxInputValues {
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
}

const hoursPerDay = ref<number>(8);
const daysPerYear = ref<number>(220);
const hourlyRate = ref<number>(0);
const totalAnnualIncome = ref<number>(0);
const workDays = ref<number>(0);
const freeDays = ref<number>(0);
const refreshToken = ref("");
const initialAnnualIncome = ref<number | null>(null);
const error = ref<string>("");

const hasEmployment = ref<boolean>(false);
const employmentRAL = ref<number>(0);
const isFullTime = ref<boolean>(false);
const isPublicEmployee = ref<boolean>(false);
const hasAuthorization = ref<boolean>(false);

const percentualeTasse = ref<number>(15);
const percentualeImponibile = ref<number>(67);
const regimePensionistico = ref<RegimePensionistico>('inps');
const riduzioneContributi = ref<string>("none");
const tipoAttivita = ref<TipoAttivita>('libero-professionista');

onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fatturato = urlParams.get('fatturato');
    if (fatturato) {
        initialAnnualIncome.value = parseFloat(fatturato);
        totalAnnualIncome.value = initialAnnualIncome.value;
    }
});

const updateIncomePlanner = (values: {
    hoursPerDay: number,
    daysPerYear: number,
    hourlyRate: number,
    totalAnnualIncome: number;
    freeDays: number;
    workDays: number;
    error: string;
}) => {
    hoursPerDay.value = values.hoursPerDay;
    daysPerYear.value = values.daysPerYear;
    hourlyRate.value = values.hourlyRate;
    totalAnnualIncome.value = values.totalAnnualIncome;
    workDays.value = values.workDays;
    freeDays.value = values.freeDays;
    error.value = values.error || "";
    updateRefreshToken();
};

const updateValues = (values: TaxInputValues) => {
    percentualeTasse.value = values.percentualeTasse;
    percentualeImponibile.value = values.percentualeImponibile;
    tipoAttivita.value = values.tipoAttivita;
    regimePensionistico.value = values.regimePensionistico;
    riduzioneContributi.value = values.riduzioneContributi;
    hasEmployment.value = values.hasEmployment;
    employmentRAL.value = values.employmentRAL;
    isFullTime.value = values.isFullTime;
    isPublicEmployee.value = values.isPublicEmployee;
    hasAuthorization.value = values.hasAuthorization;
    error.value = values.error || "";
    updateRefreshToken();
};

const updateRefreshToken = () => {
    refreshToken.value = [
        totalAnnualIncome.value,
        percentualeTasse.value,
        percentualeImponibile.value,
        tipoAttivita.value,
        regimePensionistico.value,
        riduzioneContributi.value,
        hasEmployment.value,
        employmentRAL.value,
        isFullTime.value,
        isPublicEmployee.value,
        hasAuthorization.value
    ].map(s => String(s)).join("-");
};

const isForfettarioCompatibile = computed((): boolean => {
    if (hasEmployment.value && employmentRAL.value > MAX_RAL_FORFETTARIO) return false;
    if (isPublicEmployee.value && !hasAuthorization.value) return false;
    return true;
});

const imponibilePrevidenziale = computed((): number => {
    if (!isForfettarioCompatibile.value) return 0;
    return totalAnnualIncome.value * (percentualeImponibile.value / 100);
});

const contributiPrevidenziali = computed((): number => {
    // Verifichiamo prima la compatibilità col regime forfettario
    if (!isForfettarioCompatibile.value) return 0;

    let baseContributi = 0;

    // Se è ditta individuale/artigiano
    if (tipoAttivita.value === 'ditta-individuale') {
        if (isFullTime.value) {
            baseContributi = Math.max(imponibilePrevidenziale.value - MINIMALE_2024, 0) * 0.24;
        } else {
            // Se non full-time, calcola contributo minimo + parte eccedente
            const quotaFissa = 4427; // contributo minimo 2024
            const imponibileEccedente = Math.max(imponibilePrevidenziale.value - MINIMALE_2024, 0);
            baseContributi = quotaFissa + (imponibileEccedente * 0.24);
        }
    } else {
        // Per i liberi professionisti
        const aliquota = hasEmployment.value ? 0.24 : 0.26;
        baseContributi = imponibilePrevidenziale.value * aliquota;
    }

    // Applica riduzione se prevista
    const riduzionePercentuale = riduzioneContributi.value === 'none' ? 1 :
        riduzioneContributi.value === '35' ? 0.65 : 0.5;
    return baseContributi * riduzionePercentuale;
});

const imponibileFiscale = computed((): number => {
    if (!isForfettarioCompatibile.value) return 0;
    return Math.max(0, imponibilePrevidenziale.value - contributiPrevidenziali.value);
});

const tasseDaVersare = computed((): number => {
    if (!isForfettarioCompatibile.value) return 0;
    return imponibileFiscale.value * (percentualeTasse.value / 100);
});

const totaleTasseContributi = computed((): number => {
    return tasseDaVersare.value + contributiPrevidenziali.value;
});

const netto = computed((): number => {
    if (!isForfettarioCompatibile.value) return 0;
    return totalAnnualIncome.value - totaleTasseContributi.value;
});

const externalLinks = ref([
    {
        label: "Agenzia delle entrate: Regime forfetario - Che cos'è",
        link: "https://www.agenziaentrate.gov.it/portale/web/guest/regime-forfetario-le-regole-2020-/infogen-regime-forfetario-le-regole-2020-"
    },
    {
        label: "Agenzia delle entrate: Coefficienti di redditività",
        link: "https://www.agenziaentrate.gov.it/portale/documents/20143/241208/allegato%2B4.pdf/d69be7fc-b18a-3c73-bd2e-b0f3c1970218"
    },
    {
        label: "INPS: Aliquote e minimali",
        link: "https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2024.02.circolare-numero-33-del-07-02-2024_14468.html"
    },
    {
        label: "TechCompenso: Fatturati partita iva",
        link: "https://www.techcompenso.com/fatturati-partita-iva#lista"
    },
    {
        label: "LiberiPro: statistiche Freelance IT 2025 Italia",
        link: "https://www.liberipro.it/statistiche"
    }
]);
</script>

<style scoped>
#page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: Arial, sans-serif;
    max-width: 1280px;
    margin: 0 auto;
}

.warning-message {
    font-weight: bold;
    width: 100%;
    text-align: center;
    color: var(--color-danger);
    font-size: 1rem;
    margin: 12px 0;
    padding: 8px;
    background-color: #efd9d9;
    border-radius: 4px;
}

.forfettario-container {
    padding: 8px;
    font-family: system-ui, sans-serif;
}

.description {
    margin-bottom: 24px;
}

/* LAYOUT A DUE COLONNE */
.columns {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
}

/* BOX */
.box {
    flex: 1;
    min-width: 280px;
}

.box-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    font-weight: 600;
}


.success {
    color: #2e9d55;
}

.danger {
    color: #d03030;
}

/* LISTE */
ul {
    padding-left: 20px;
}

ul li {
    margin-bottom: 8px;
    line-height: 1.4;
}

.calc-steps {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 6px 0;
}

.step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.circle {
    min-width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #3B82F6;
    /* blu stile screenshot */
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
}

.final {
    background-color: var(--color-success);
}

.step strong {
    font-size: 16px;
}

.step small {
    font-size: 13px;
    color: #666;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .columns {
        flex-direction: column;
        gap: 24px;
    }
}
</style>