<script lang="ts" setup>
import { ref, computed } from 'vue'

// Constants
const IVA_RATE = 0.22
const IRES_RATE = 0.24
const IRAP_RATE = 0.039
const RITENUTA_DIVIDENDI = 0.26
const RITENUTA_TFM = 0.23
const INPS_RATE = 0.24
const MAX_BUONO_PASTO = 8

interface FormValues {
  fatturato: string
  costiOperativi: string
  compensoAmministratore: string
  percentualeDividendi: string
  tfmAnnuale: string
  buoniPastoGiornaliero: string
  giorniLavorati: string
}

const values = ref<FormValues>({
  fatturato: "120000",
  costiOperativi: '10000',
  compensoAmministratore: '40000',
  percentualeDividendi: '20',
  tfmAnnuale: '10000',
  buoniPastoGiornaliero: '8',
  giorniLavorati: '240'
})

// Utility functions
const getNumericValue = (value: string): number => {
  return parseFloat(value) || 0
}

const calcolaIrpef = (reddito: number): number => {
  if (reddito <= 15000) return reddito * 0.23
  if (reddito <= 28000) return 3450 + (reddito - 15000) * 0.27
  if (reddito <= 50000) return 6960 + (reddito - 28000) * 0.38
  if (reddito <= 75000) return 14720 + (reddito - 50000) * 0.41
  return 25420 + (reddito - 75000) * 0.43
}

// Computed values
const fatturatoNetto = computed(() =>
  getNumericValue(values.value.fatturato) / (1 + IVA_RATE)
)

const iva = computed(() =>
  getNumericValue(values.value.fatturato) - fatturatoNetto.value
)

const compensoAmm = computed(() =>
  getNumericValue(values.value.compensoAmministratore)
)

const tfmAnnuale = computed(() =>
  getNumericValue(values.value.tfmAnnuale)
)

const tfmWarning = computed(() => {
  const tfmValue = tfmAnnuale.value
  const compensoValue = compensoAmm.value

  if (compensoValue === 0) return false

  return (tfmValue / compensoValue) > 0.3
})

const buoniPastoGiornaliero = computed(() => {
  const valore = getNumericValue(values.value.buoniPastoGiornaliero)
  return Math.min(valore, MAX_BUONO_PASTO)
})

const giorniLavorati = computed(() =>
  getNumericValue(values.value.giorniLavorati)
)

const totaleBuoniPasto = computed(() =>
  getNumericValue(values.value.buoniPastoGiornaliero) * giorniLavorati.value
)

const totaleBuoniPastoDeducibili = computed(() =>
  Math.min(buoniPastoGiornaliero.value, MAX_BUONO_PASTO) * giorniLavorati.value
)

const totaleBuoniPastoNonDeducibili = computed(() =>
  Math.max(0, (getNumericValue(values.value.buoniPastoGiornaliero) - MAX_BUONO_PASTO) * giorniLavorati.value)
)

const margineDifribuibile = computed(() =>
  fatturatoNetto.value - getNumericValue(values.value.costiOperativi)
)

const utileOperativo = computed(() =>
  margineDifribuibile.value -
  compensoAmm.value -
  tfmAnnuale.value -
  totaleBuoniPastoDeducibili.value
)

const ires = computed(() =>
  utileOperativo.value > 0 ? utileOperativo.value * IRES_RATE : 0
)

const irap = computed(() =>
  utileOperativo.value > 0 ? utileOperativo.value * IRAP_RATE : 0
)

const utileNettoPreDividendi = computed(() =>
  utileOperativo.value - ires.value - irap.value
)

const dividendoLordo = computed(() =>
  (utileNettoPreDividendi.value * getNumericValue(values.value.percentualeDividendi)) / 100
)

const utileNetto = computed(() =>
  utileNettoPreDividendi.value - dividendoLordo.value
)

const irpefAmministratore = computed(() =>
  calcolaIrpef(compensoAmm.value)
)

const contributiInps = computed(() =>
  compensoAmm.value * INPS_RATE
)

const nettoAmministratore = computed(() =>
  compensoAmm.value - irpefAmministratore.value - contributiInps.value
)

const ritenutaDividendi = computed(() =>
  dividendoLordo.value * RITENUTA_DIVIDENDI
)

const dividendoNetto = computed(() =>
  dividendoLordo.value - ritenutaDividendi.value
)

const tfmNettoAnnuale = computed(() =>
  tfmAnnuale.value - (tfmAnnuale.value * RITENUTA_TFM)
)

// Modificato per includere correttamente tutti i prelievi dall'azienda
const totaleCompensiLordi = computed(() => {
  const totalePrelievi =
    compensoAmm.value +
    tfmAnnuale.value +
    totaleBuoniPastoDeducibili.value;

  // Aggiungiamo le tasse aziendali e i dividendi
  return totalePrelievi + ires.value + irap.value + dividendoLordo.value;
})

const percentualeUtilizzata = computed(() =>
  margineDifribuibile.value > 0 ? (totaleCompensiLordi.value / margineDifribuibile.value) : 0
)

const distribuzioneWarning = computed(() =>
  percentualeUtilizzata.value > 1
)

const totaleNettoPersonale = computed(() =>
  nettoAmministratore.value +
  dividendoNetto.value +
  tfmNettoAnnuale.value +
  totaleBuoniPasto.value
)

const totaleTassePersonali = computed(() =>
  irpefAmministratore.value +
  contributiInps.value +
  ritenutaDividendi.value +
  (tfmAnnuale.value * RITENUTA_TFM)
)

const totaleTasseAziendali = computed(() =>
  ires.value + irap.value
)

const totaleTasse = computed(() =>
  totaleTassePersonali.value + totaleTasseAziendali.value
)

const tassazioneEffettiva = computed(() =>
  totaleTasse.value / fatturatoNetto.value
)

const percentualeNettoSuFatturato = computed(() =>
  totaleNettoPersonale.value / fatturatoNetto.value
)

// Computed property per passare tutti i risultati come oggetto singolo
const calculationResults = computed(() => ({
  fatturatoNetto: fatturatoNetto.value,
  costiOperativi: getNumericValue(values.value.costiOperativi),
  iva: iva.value,
  tfmAnnuale: tfmAnnuale.value,
  ires: ires.value,
  irap: irap.value,
  utileNetto: utileNetto.value,
  compensoAmm: compensoAmm.value,
  irpefAmministratore: irpefAmministratore.value,
  contributiInps: contributiInps.value,
  nettoAmministratore: nettoAmministratore.value,
  tfmNettoAnnuale: tfmNettoAnnuale.value,
  dividendoLordo: dividendoLordo.value,
  ritenutaDividendi: ritenutaDividendi.value,
  dividendoNetto: dividendoNetto.value,
  totaleNettoPersonale: totaleNettoPersonale.value,
  totaleTasseAziendali: totaleTasseAziendali.value,
  totaleTassePersonali: totaleTassePersonali.value,
  totaleTasse: totaleTasse.value,
  tassazioneEffettiva: tassazioneEffettiva.value,
  percentualeNettoSuFatturato: percentualeNettoSuFatturato.value,
  buoniPastoGiornaliero: buoniPastoGiornaliero.value,
  giorniLavorati: giorniLavorati.value,
  totaleBuoniPasto: totaleBuoniPasto.value,
  totaleBuoniPastoDeducibili: totaleBuoniPastoDeducibili.value,
  totaleBuoniPastoNonDeducibili: totaleBuoniPastoNonDeducibili.value,
  margineDifribuibile: margineDifribuibile.value,
  totaleCompensiLordi: totaleCompensiLordi.value,
  percentualeUtilizzata: percentualeUtilizzata.value,
  utileNettoPreDividendi: utileNettoPreDividendi.value
}))

useHead({
  title: 'Finance Toolbox - Calcolatore Tasse SRL | Calcola IRES, IRAP, TFM e Tassazione Personale',
  meta: [
    {
      name: 'description',
      content: 'Calcola facilmente tasse e utili della tua SRL: IRES, IRAP, compenso amministratore, TFM e dividendi. Simulatore gratuito per pianificazione fiscale e calcolo del netto personale.'
    },
    {
      name: 'keywords',
      content: 'calcolatore tasse srl, calcolo ires, calcolo irap, tfm amministratore, tassazione dividendi srl, simulatore fiscale srl, calcolo utile netto srl, tassazione amministratore srl, compenso amministratore, pianificazione fiscale srl, calcolo tasse società, tassazione effettiva srl, gestione fiscale srl, ottimizzazione fiscale srl, calcolo netto amministratore'
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://finance-toolbox.it/srl-net-calculator'
    }
  ]
})
</script>

<template>
  <div class="container">
    <h1 class="page-title">Calcolo Reddito S.r.l.</h1>

    <div class="content">
      <SrlCalculatorForm v-model:values="values" :margine-difribuibile="margineDifribuibile"
        :totale-compensi-lordi="totaleCompensiLordi" :percentuale-utilizzata="percentualeUtilizzata" />
      <SrlCalculatorResults :results="calculationResults" :tfm-warning="tfmWarning"
        :distribuzione-warning="distribuzioneWarning" />
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.content {
  width: 100%;
}

@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
}
</style>