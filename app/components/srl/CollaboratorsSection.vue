<template>
  <form @submit.prevent="emitUpdate" class="section">
    <h2>3️⃣ Collaboratori in Partita IVA</h2>

    <div class="grid">
      <div>
        <label>Numero collaboratori</label>
        <input type="number" v-model.number="state.numCollabs" min="0" />
      </div>
      <div>
        <label>Fatturato generato dai collaboratori (€)</label>
        <input type="number" v-model.number="state.revenueIn" min="0" />
      </div>
      <div>
        <label>Costi verso collaboratori (€)</label>
        <input type="number" v-model.number="state.revenueOut" min="0" />
      </div>
    </div>

    <div class="card" style="margin-top:1rem;">
      <p>Margine generato dai collaboratori: <strong>{{ formatEuro(margin) }}</strong></p>
      <p v-if="margin < 0" class="error">⚠️ Margine negativo, verificare i costi.</p>

      <div style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button type="button" class="primary" @click="emitUpdate">Applica</button>
        <button type="button" class="secondary" @click="resetForm">Reset</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'

const emit = defineEmits(['updateCollaborators'])

const state = reactive({ numCollabs: 0, revenueIn: 0, revenueOut: 0 })

function formatEuro(v) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)
}

const margin = computed(() => {
  const result = Number(state.revenueIn || 0) - Number(state.revenueOut || 0)
  return Math.round(result * 100) / 100 * state.numCollabs
})

function emitUpdate() {
  const payload = {
    numCollabs: state.numCollabs,
    revenueIn: state.revenueIn,
    revenueOut: state.revenueOut,
    margin: margin.value
  }
  emit('updateCollaborators', payload)
}

function resetForm() {
  state.numCollabs = 0
  state.revenueIn = 0
  state.revenueOut = 0
}
</script>
