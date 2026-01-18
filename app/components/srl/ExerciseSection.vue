<template>
  <form @submit.prevent="emitUpdate" class="section">
    <h2>2️⃣ Esercizio Annuale</h2>

    <div class="grid">
      <div>
        <label>Fatturato Totale Annuale (€)</label>
        <input type="number" v-model.number="state.revenue" min="0" />
      </div>

      <div>
        <label>Compenso Amministratore (€)</label>
        <input type="number" v-model.number="state.adminPay" min="0" />
      </div>

      <div>
        <label>Costi d'esercizio (€)</label>
        <input type="number" v-model.number="state.expenses" min="0" />
      </div>
    </div>

    <div class="card" style="margin-top:1rem;">
      <p>Utile Lordo Stimato: <strong>{{ formatEuro(grossProfit) }}</strong></p>
      <p>Margine Netto Stimato (stima tasse 25%): <strong>{{ formatEuro(netProfit) }}</strong></p>

      <div style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="primary" @click="emitUpdate">Applica</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({ partners: { type: Array, default: () => [] } })
const emit = defineEmits(['updateExercise'])

const state = reactive({ revenue: 0, adminPay: 0, expenses: 0 })

function formatEuro(v) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)
}

const grossProfit = computed(() => {
  // Utile lordo = ricavi - (compenso admin + costi)
  const val = Number(state.revenue || 0) - (Number(state.adminPay || 0) + Number(state.expenses || 0))
  return Math.round(val * 100) / 100
})

const netProfit = computed(() => {
  // Semplice stima: tolgo il 25% per tasse (IRES+IRAP semplificata)
  const val = grossProfit.value * (1 - 0.25)
  return Math.round(Math.max(val, 0) * 100) / 100
})

function emitUpdate() {
  const payload = {
    revenue: Number(state.revenue || 0),
    adminPay: Number(state.adminPay || 0),
    expenses: Number(state.expenses || 0),
    grossProfit: grossProfit.value,
    netProfit: netProfit.value
  }
  emit('updateExercise', payload)
}
</script>