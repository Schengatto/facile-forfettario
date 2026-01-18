<template>
  <form @submit.prevent="emitUpdate" class="section">
    <h2>4️⃣ Tassazione (IRES, IRAP, INPS)</h2>

    <p>Questa sezione usa come base l'utile lordo calcolato in precedenza (Utile Lordo = ricavi - costi - compensi).
    Alcune scelte semplificano la base imponibile — vedi note.</p>

    <div class="grid">
      <div>
        <label>Utile lordo utilizzato (€)</label>
        <input type="number" v-model.number="state.grossProfit" min="-99999999" />
      </div>

      <div>
        <label>Aliquota IRES (%)</label>
        <input type="number" v-model.number="state.iresRate" min="0" step="0.01" />
      </div>

      <div>
        <label>Aliquota IRAP (%)</label>
        <input type="number" v-model.number="state.irapRate" min="0" step="0.01" />
      </div>
    </div>

    <div class="card" style="margin-top:1rem;">
      <p>Imposta IRES stimata: <strong>{{ formatEuro(iresAmount) }}</strong></p>
      <p>Imposta IRAP stimata: <strong>{{ formatEuro(irapAmount) }}</strong></p>

      <div style="margin-top:0.8rem;">
        <h3>INPS per soci lavoratori</h3>
        <p>Se presenti soci lavoratori, scegliere il regime contributivo più appropriato e inserire il compenso lordo annuo del socio lavoratore.</p>

        <div class="grid">
          <div>
            <label>Tipo contribuzione socio</label>
            <select v-model="state.inpsType">
              <option value="gestioneSeparata">Gestione Separata (freelance)</option>
              <option value="artigianiCommercianti">Artigiani/Commercianti</option>
            </select>
          </div>

          <div>
            <label>Aliquota INPS (%)</label>
            <input type="number" v-model.number="state.inpsRate" min="0" step="0.01" />
          </div>

          <div>
            <label>Compenso lordo socio lavoratore (€)</label>
            <input type="number" v-model.number="state.workerPay" min="0" />
          </div>
        </div>

        <p style="margin-top:0.5rem;">Contributo INPS stimato: <strong>{{ formatEuro(inpsAmount) }}</strong></p>
      </div>

      <p style="margin-top:0.8rem;">Utile netto dopo imposte sociali e fiscali: <strong>{{ formatEuro(netAfterTaxes) }}</strong></p>

      <div style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="primary" @click="emitUpdate">Applica</button>
        <button type="button" class="secondary" @click="resetToDefaults">Ripristina valori consigliati</button>
      </div>

      <div style="margin-top:0.8rem; font-size:0.9rem; color:#444;">
        <strong>Note:</strong>
        <ul>
          <li>IRES standard: 24% (valore di riferimento).</li>
          <li>IRAP indicativa: 3.9% (può variare per regione/settore).</li>
          <li>INPS: le aliquote variano a seconda della gestione (Gestione Separata ~25-26%, Artigiani/Commercianti ~24% con variazioni). Consultare INPS per il caso specifico.</li>
        </ul>
      </div>

    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'

const emit = defineEmits(['updateTaxation'])

const state = reactive({
  grossProfit: 0,
  iresRate: 24.0,
  irapRate: 3.9,
  inpsType: 'gestioneSeparata',
  inpsRate: 25.0,
  workerPay: 0
})

function formatEuro(v) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v) }

const iresAmount = computed(() => Math.round((Math.max(0, Number(state.grossProfit || 0)) * (Number(state.iresRate || 0) / 100)) * 100) / 100)
const irapAmount = computed(() => Math.round((Math.max(0, Number(state.grossProfit || 0)) * (Number(state.irapRate || 0) / 100)) * 100) / 100)

const inpsAmount = computed(() => {
  const base = Number(state.workerPay || 0)
  return Math.round(base * (Number(state.inpsRate || 0) / 100) * 100) / 100
})

const netAfterTaxes = computed(() => {
  const gp = Number(state.grossProfit || 0)
  const totalTaxes = iresAmount.value + irapAmount.value + inpsAmount.value
  return Math.round((gp - totalTaxes) * 100) / 100
})

function emitUpdate() {
  const payload = {
    grossProfit: state.grossProfit,
    iresRate: state.iresRate,
    irapRate: state.irapRate,
    iresAmount: iresAmount.value,
    irapAmount: irapAmount.value,
    inpsType: state.inpsType,
    inpsRate: state.inpsRate,
    inpsAmount: inpsAmount.value,
    netAfterTaxes: netAfterTaxes.value
  }
  emit('updateTaxation', payload)
}

function resetToDefaults() {
  state.iresRate = 24.0
  state.irapRate = 3.9
  state.inpsType = 'gestioneSeparata'
  state.inpsRate = 25.0
}
</script>
