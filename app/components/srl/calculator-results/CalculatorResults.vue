<script lang="ts" setup>
import { defineProps } from 'vue'

interface CalculationResults {
  fatturatoNetto: number
  costiOperativi: number
  iva: number
  tfmAnnuale: number
  ires: number
  irap: number
  utileNetto: number
  utileNettoPreDividendi: number
  compensoAmm: number
  irpefAmministratore: number
  contributiInps: number
  nettoAmministratore: number
  tfmNettoAnnuale: number
  dividendoLordo: number
  ritenutaDividendi: number
  dividendoNetto: number
  totaleNettoPersonale: number
  totaleTasseAziendali: number
  totaleTassePersonali: number
  totaleTasse: number
  tassazioneEffettiva: number
  percentualeNettoSuFatturato: number
  buoniPastoGiornaliero: number
  giorniLavorati: number
  totaleBuoniPasto: number
  totaleBuoniPastoDeducibili: number
  totaleBuoniPastoNonDeducibili: number
}

const props = defineProps<{
  results: CalculationResults,
  tfmWarning: boolean,
  distribuzioneWarning: boolean
}>()

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value || 0)
}
</script>

<template>
  <div class="results-container">
    <div v-if="tfmWarning" class="warning-message">
      <p><strong>Attenzione:</strong> Il TFM impostato supera il 30% del compenso amministratore.</p>
      <p>Per la deducibilità fiscale, è consigliabile che il TFM sia congruo rispetto a:</p>
      <ul>
        <li>Compenso annuo dell'amministratore (generalmente tra il 20-30%)</li>
        <li>Durata del mandato</li>
        <li>Situazione economico-finanziaria della società</li>
      </ul>
      <p>Valutare attentamente la documentazione delle ragioni che giustificano l'importo stabilito.</p>
    </div>

    <div class="chart-container">
      <SrlCalculatorChart :results="results" />
    </div>

    <section class="results-section">
      <h3>Risultati Aziendali</h3>

      <div class="result-row highlight">
        <span>Fatturato netto (senza IVA):</span>
        <span class="text-right">{{ formatCurrency(results.fatturatoNetto) }}</span>
      </div>

      <div class="result-row">
        <span>IVA (22%):</span>
        <span class="text-right">{{ formatCurrency(results.iva) }}</span>
      </div>

      <div class="result-row">
        <span>Accantonamento TFM:</span>
        <span class="text-right">{{ formatCurrency(results.tfmAnnuale) }}</span>
      </div>

      <div class="result-row">
        <span>IRES (24%):</span>
        <span class="text-right">{{ formatCurrency(results.ires) }}</span>
      </div>

      <div class="result-row">
        <span>IRAP (3.9%):</span>
        <span class="text-right">{{ formatCurrency(results.irap) }}</span>
      </div>

      <div class="result-row highlight">
        <span>Utile Netto Prima dei Dividendi:</span>
        <span class="text-right">{{ formatCurrency(results.utileNettoPreDividendi) }}</span>
      </div>

      <div class="result-row">
        <span>Dividendi Distribuiti:</span>
        <span class="text-right negative">{{ formatCurrency(-results.dividendoLordo) }}</span>
      </div>

      <div class="result-row highlight">
        <span>Utile Netto Finale:</span>
        <span class="text-right">{{ formatCurrency(results.utileNetto) }}</span>
      </div>
    </section>

    <section class="results-section">
      <h3>Il Tuo Guadagno Personale</h3>

      <div class="subsection">
        <h4>Da Compenso Amministratore:</h4>
        <div class="result-row">
          <span>Compenso Lordo:</span>
          <span class="text-right">{{ formatCurrency(results.compensoAmm) }}</span>
        </div>
        <div class="result-row">
          <span>IRPEF:</span>
          <span class="negative text-right">{{ formatCurrency(-results.irpefAmministratore) }}</span>
        </div>
        <div class="result-row">
          <span>Contributi INPS:</span>
          <span class="negative text-right">{{ formatCurrency(-results.contributiInps) }}</span>
        </div>
        <div class="result-row">
          <span>Netto Amministratore:</span>
          <span class="text-right">{{ formatCurrency(results.nettoAmministratore) }}</span>
        </div>
      </div>

      <div class="subsection">
        <h4>Da TFM (annuale):</h4>
        <div class="result-row">
          <span>TFM Lordo:</span>
          <span class="text-right">{{ formatCurrency(results.tfmAnnuale) }}</span>
        </div>
        <div class="result-row">
          <span>Ritenuta (23%):</span>
          <span class="negative text-right">{{ formatCurrency(-results.tfmAnnuale * 0.23) }}</span>
        </div>
        <div class="result-row">
          <span>TFM Netto:</span>
          <span class="text-right">{{ formatCurrency(results.tfmNettoAnnuale) }}</span>
        </div>
      </div>

      <div class="subsection">
        <h4>Da Dividendi:</h4>
        <div class="result-row">
          <span>Dividendo Lordo:</span>
          <span class="text-right">{{ formatCurrency(results.dividendoLordo) }}</span>
        </div>
        <div class="result-row">
          <span>Ritenuta (26%):</span>
          <span class="negative text-right">{{ formatCurrency(-results.ritenutaDividendi) }}</span>
        </div>
        <div class="result-row">
          <span>Netto Dividendi:</span>
          <span class="text-right">{{ formatCurrency(results.dividendoNetto) }}</span>
        </div>
      </div>

      <div class="subsection">
        <h4>Da Buoni Pasto:</h4>
        <div class="result-row">
          <span>Valore Giornaliero:</span>
          <span class="text-right">{{ formatCurrency(results.buoniPastoGiornaliero) }}</span>
        </div>
        <div class="result-row">
          <span>Giorni Lavorati:</span>
          <span class="text-right">{{ results.giorniLavorati }}</span>
        </div>
        <div class="result-row">
          <span>Totale Buoni Pasto:</span>
          <span class="text-right">{{ formatCurrency(results.totaleBuoniPasto) }}</span>
        </div>
        <div class="result-row" v-if="results.totaleBuoniPastoNonDeducibili > 0">
          <span>di cui Non Deducibili:</span>
          <span class="text-right negative">{{ formatCurrency(results.totaleBuoniPastoNonDeducibili) }}</span>
        </div>
      </div>

      <div class="total-row">
        <span>TOTALE NETTO PERSONALE:</span>
        <span class="text-right">{{ formatCurrency(results.totaleNettoPersonale) }}</span>
      </div>
    </section>

    <section class="results-section">
      <h3>Analisi Tassazione Effettiva</h3>

      <div class="result-row">
        <span>Tasse aziendali (IRES + IRAP):</span>
        <span class="text-right">{{ formatCurrency(results.totaleTasseAziendali) }}</span>
      </div>

      <div class="result-row">
        <span>Tasse personali (IRPEF + INPS + Ritenute):</span>
        <span class="text-right">{{ formatCurrency(results.totaleTassePersonali) }}</span>
      </div>

      <div class="result-row highlight negative-bg">
        <span>Totale Tasse:</span>
        <span class="text-right">{{ formatCurrency(results.totaleTasse) }}</span>
      </div>

      <div class="result-row">
        <span>Tassazione effettiva sul fatturato netto:</span>
        <span class="text-right">{{ formatPercentage(results.tassazioneEffettiva) }}</span>
      </div>
    </section>

    <footer class="notes">
      <p class="note-title">Note:</p>
      <ul class="note-list">
        <li>Il TFM è un accantonamento annuale che verrà erogato alla fine del mandato</li>
        <li>La tassazione del TFM è agevolata (23%) fino a 1M€</li>
        <li>L'accantonamento TFM deve essere deliberato all'inizio del mandato</li>
        <li>La tassazione totale include imposte aziendali (IRES, IRAP) e personali (IRPEF, INPS, ritenute)</li>
        <li>Le percentuali sono calcolate sul fatturato al netto dell'IVA</li>
        <li>I buoni pasto sono deducibili fino a un massimo di 8€ al giorno</li>
      </ul>
    </footer>
  </div>
</template>

<style scoped>
.results-container {
  margin-top: 2rem;
}

.warning-message {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #856404;
}

.warning-message strong {
  color: #664d03;
}

.warning-message ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.warning-message li {
  margin-bottom: 0.25rem;
}

.results-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
  margin-top: 2rem;
}

.results-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.results-section h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  transition: background-color 0.2s ease-in-out;
}

.highlight {
  background-color: #f3f4f6;
  color: var(--gray-900);
  border-radius: 0.5rem;
  font-weight: 500;
}

.negative {
  color: #dc2626;
}

.negative-bg {
  background-color: #fee2e2;
}

.subsection {
  margin-left: 1rem;
  margin-bottom: 1rem;
}

.total-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #dcfce7;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
  font-size: 1.125rem;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
  color: var(--gray-900);
}

.notes {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 0.875rem;
  color: var(--gray-900);
}

.note-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.note-list {
  list-style-type: disc;
  padding-left: 1.25rem;
}

.note-list li {
  margin-bottom: 0.25rem;
}

.text-right {
  text-align: right;
}

.chart-container {
  margin: 1em 0;
}

@media (max-width: 640px) {

  .result-row,
  .total-row {
    font-size: 0.875rem;
  }

  .subsection {
    margin-left: 0;
  }
}
</style>