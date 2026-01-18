<template>
  <form @submit.prevent="emitUpdate" class="section">
    <h2>1️⃣ Costituzione</h2>

    <div class="grid">
      <div>
        <label>Capitale sociale (€)</label>
        <input type="number" v-model.number="capital" min="0" />
        <p v-if="capitalWarning" class="error">{{ capitalWarning }}</p>
      </div>

      <div>
        <label>Numero soci</label>
        <input type="number" v-model.number="numPartners" min="1" max="50" />
      </div>

      <div>
        <label>&nbsp;</label>
        <button type="button" class="primary" @click="addPartner">Aggiungi socio</button>
      </div>
    </div>

    <div v-for="(p, idx) in partners" :key="p.id" class="card">
      <div class="grid">
        <div>
          <label>Nome</label>
          <input v-model="p.name" />
        </div>

        <div>
          <label>Ruolo</label>
          <select v-model="p.role">
            <option value="only">Solo socio</option>
            <option value="worker">Socio lavoratore</option>
            <option value="admin">Amministratore</option>
          </select>
        </div>

        <div>
          <label>Quota (%)</label>
          <input type="number" v-model.number="p.percent" min="0" max="100" step="0.01" />
        </div>
      </div>

      <div style="margin-top:0.5rem;">
        <small>Quota in €: <strong>{{ formatEuro(partCapital(p.percent)) }}</strong></small>
      </div>

      <div style="text-align:right; margin-top:0.5rem;">
        <button type="button" class="danger" @click="removePartner(idx)">Rimuovi socio</button>
      </div>
    </div>

    <div class="card">
      <p>Totale quote: <strong>{{ totalPercent.toFixed(2) }}%</strong></p>
      <p v-if="percentWarning" class="error">{{ percentWarning }}</p>
      <p>Capitale distribuito: <strong>{{ formatEuro(totalCapitalFromPercent) }}</strong></p>
      <p>Capitale impostato: {{ formatEuro(capital) }}</p>
      <p v-if="capitalMismatch" class="error">{{ capitalMismatch }}</p>

      <div style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="primary" @click="emitUpdate">Applica</button>
        <button type="button" class="secondary" @click="autoNormalize">Normalizza quote</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

function createEmptyPartner(n) {
  return { id: Date.now() + Math.random(), name: `Socio ${n}`, role: 'only', percent: +(100 / n).toFixed(2) }
}

const emit = defineEmits(['updateCompany'])
const state = reactive({ capital: 10000, numPartners: 1, partners: [createEmptyPartner(1)] })

function addPartner() {
  const n = state.partners.length + 1
  state.partners.push(createEmptyPartner(n))
  state.numPartners = state.partners.length
}

function removePartner(idx) {
  state.partners.splice(idx, 1)
  state.numPartners = state.partners.length
}

function partCapital(percent) { return (percent / 100) * state.capital }
function formatEuro(v) { return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v) }

const totalPercent = computed(() => state.partners.reduce((s, p) => s + (Number(p.percent) || 0), 0))
const totalCapitalFromPercent = computed(() => state.partners.reduce((s, p) => s + partCapital(Number(p.percent) || 0), 0))

const capitalWarning = computed(() => {
  if (state.partners.length === 1 && state.capital < 10000) return 'Capitale minimo per SRL con socio unico: €10.000.'
  return ''
})

const percentWarning = computed(() => {
  if (totalPercent.value === 0) return 'Inserisci le quote dei soci.'
  if (totalPercent.value < 100) return 'Le quote totali sono inferiori al 100%.'
  if (totalPercent.value > 100) return 'Le quote totali superano il 100%.'
  return ''
})

const capitalMismatch = computed(() => {
  const diff = Math.abs(totalCapitalFromPercent.value - state.capital)
  if (diff > 0.01) return `Differenza di ${formatEuro(diff)} tra somma quote e capitale impostato.`
  return ''
})

function autoNormalize() {
  const n = state.partners.length || 1
  const per = 100 / n
  state.partners.forEach(p => p.percent = +per.toFixed(2))
}

function emitUpdate() {
  const payload = {
    capital: state.capital,
    partners: state.partners.map(p => ({ ...p, capitalShare: partCapital(p.percent) })),
    totalPercent: totalPercent.value,
    totalCapitalFromPercent: totalCapitalFromPercent.value,
  }
  emit('updateCompany', payload)
}

watch(() => state.partners.length, (v) => { state.numPartners = v })

const capital = computed({ get: () => state.capital, set: v => state.capital = Number(v || 0) })
const numPartners = computed({
  get: () => state.numPartners, set: v => {
    const desired = Number(v) || 1
    while (state.partners.length < desired) addPartner()
    while (state.partners.length > desired) state.partners.pop()
    state.numPartners = state.partners.length
  }
})
const partners = state.partners
</script>
