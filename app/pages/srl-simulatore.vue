<template>
    <div class="container">
        <h1>SRL Simulator</h1>

        <div class="card">
            <h2 class="mh-2">Costituzione</h2>
            <div class="input-section">
                <InputText id="numeroSoci" label="Numero Soci" v-model="numeroSoci" type="number" :min="1" :max="20"
                    :tooltipText="tooltips.numeroSoci" />
                <FieldText id="capitaleSociale" label="Capitale Sociale" :value="parsedCapitaleSociale" />
            </div>
            <div v-for="(socio, i) of soci" :key="i" class="input-section">
                <FieldText :id="`quotaSocio${i + 1}`" :value="`Socio`" />
                <InputText :id="`capitaleSocio${i + 1}`" :label="`Capitale`"
                    v-model="socio.capitaleSociale" :min="0" type="number" />

                <FieldText :id="`quotaSocio${i + 1}`" :label="`Quota`" :value="socio.quota" />
                <InputText :id="`compenso${i + 1}`" :label="`Compenso`" v-model="socio.compenso" type="number"
                    :min="0" />
                <FieldText :id="`quotaSocio${i + 1}`" :label="`Compenso Netto`"
                    :value="compensoNetto(socio.compenso)" prefix="€" />
                <FieldText :id="`costoSocio${i + 1}`" :label="`Costo per la società`" prefix="€"
                    :value="(Number(socio.compenso) / 100 * (contributiCaricoSocietà)) + Number(socio.compenso)" />
            </div>

            <hr />

            <h2 class="mh-2">Esercizio</h2>
            <div class="input-section">
                <InputText id="fatturato" label="Fatturato Annuale" v-model="fatturatoAnnuale" type="number" :min="0" />
                <InputText id="costiEsercizio" label="Costi d'esercizio" v-model="costiEsercizio" type="number"
                    :min="0" />
            </div>
            <div v-for="(socio, i) of soci" :key="i" class="input-section">
                <InputText :id="`compenso${i + 1}`" :label="`Compenso Socio ${i + 1}`" v-model="socio.compenso"
                    type="number" :min="0" />
                <FieldText :id="`quotaSocio${i + 1}`" :label="`Compenso Netto ${socio.nome}`"
                    :value="compensoNetto(socio.compenso)" />
                <FieldText :id="`costoSocio${i + 1}`" :label="`Costo per la società`"
                    :value="(Number(socio.compenso) / 100 * (contributiCaricoSocietà)) + Number(socio.compenso)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

useHead({
    title: 'Finance Toolbox - Simulatore Tasse SRL | Calcola IRES, IRAP, TFM e Tassazione Personale',
    meta: [
        { name: 'description', content: 'Simula facilmente tasse e utili della tua SRL: IRES, IRAP, compenso amministratore, TFM e dividendi. Simulatore gratuito per pianificazione fiscale e calcolo del netto personale.' },
        { name: 'keywords', content: 'simulatore tasse srl, calcolo ires, calcolo irap, tfm amministratore, tassazione dividendi srl, simulatore fiscale srl, calcolo utile netto srl, tassazione amministratore srl, compenso amministratore, pianificazione fiscale srl, calcolo tasse società, tassazione effettiva srl, gestione fiscale srl, ottimizzazione fiscale srl, calcolo netto amministratore' },
    ],
    link: [
        { rel: 'canonical', href: 'https://finance-toolbox.it/srl-simulator' }
    ]
});

const tooltips = {
    numeroSoci: `Il numero di soci con cui verrà costituita la società`,
};

interface Socio {
    nome: string;
    quota: string;
    capitaleSociale: number;
    compenso: number;
}

const numeroSoci = ref(1);
const fatturatoAnnuale = ref(0);
const costiEsercizio = ref(0);
const contributiCaricoSocietà = ref<number>(23.35);

const soci = ref<Socio[]>([
    { nome: "Socio 1", quota: "100 %", capitaleSociale: 10000, compenso: 0 }
]);

const capitaleSociale = computed(() => soci?.value.reduce((output, s) => Number(output) + Number(s.capitaleSociale), 0) || 0);
const parsedCapitaleSociale = computed(() => `€ ${capitaleSociale.value.toFixed(2)}`);

const compensoNetto = (compenso: number): number => {
    const contributiINPS = compenso * 0.1168;
    const imponibile = compenso - contributiINPS;

    let irpef = 0;

    // Calcolo IRPEF a scaglioni
    if (imponibile <= 28000) {
        irpef = imponibile * 0.23;
    } else if (imponibile <= 50000) {
        irpef = (28000 * 0.23) + ((imponibile - 28000) * 0.35);
    } else {
        irpef =
            (28000 * 0.23) +
            (22000 * 0.35) +
            ((imponibile - 50000) * 0.43);
    }
    const netto = compenso - contributiINPS - irpef;
    return Number(netto.toFixed(2));
};

const aggiornaSoci = () => {
    const numSoci = Math.min(numeroSoci.value, 20);

    const delta = numSoci - soci.value.length;
    if (delta === 0) return;

    const _soci = [];
    for (let i = 0; i < numSoci; i++) {
        const _capitaleSociale = soci.value[i]?.capitaleSociale ?? 0;
        const _socio = {
            nome: soci.value[i]?.nome ?? `Socio ${i + delta}`,
            capitaleSociale: _capitaleSociale,
            quota: soci.value[i]?.quota ?? `${(_capitaleSociale / capitaleSociale.value * 100).toFixed(2)} %`,
            compenso: soci.value[i]?.compenso ?? 0,
        };
        _soci.push(_socio);
    }
    soci.value = _soci;
}

const aggiornaQuoteSoci = () => {
    soci.value = soci.value.map((s) => ({ ...s, quota: `${(s.capitaleSociale / capitaleSociale.value * 100).toFixed(2)} %` }));
}

watch([numeroSoci], () => {
    if (!numeroSoci) return;
    numeroSoci.value = Math.min(numeroSoci.value, 20);
    aggiornaSoci();
});

watch([capitaleSociale], () => {
    aggiornaQuoteSoci();
});

</script>

<style>
.input-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
    gap: 32px;
}

.section {
    margin-bottom: 2rem;
}

input:disabled {
    border-color: rgba(204, 204, 204, 0.3);
}
</style>