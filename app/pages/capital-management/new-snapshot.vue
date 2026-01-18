<template>
  <div class="p-6 space-y-6 w-full mx-auto">
    <h1 class="text-3xl font-bold mb-4">Patrimonio {{ currentMonth }}</h1>

    <!-- I. Liquidity -->
    <section class="p-4 bg-white rounded-xl shadow-md">
      <div class="caption">
        <h2 class="text-xl font-semibold mb-4">Liquidità</h2>
        <div class="mb-4 text-right font-medium text-gray-700 font-bold">
          <strong>Totale: € {{ totalLiquidityAmount.toFixed(2) }}</strong>
        </div>
      </div>

      <table class="table-fixed w-full text-sm overflow-hidden">
        <thead class="text-gray-700">
          <tr>
            <th class="p-2 w-[50%] text-left">Nome</th>
            <th class="p-2 w-[20%] text-right">Importo</th>
            <th class="p-2 w-[10%] text-center">Valuta</th>
            <th class="p-2 w-[10%] text-right">Interesse (%)</th>
            <th class="p-2 w-[10%] text-center">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in liquidity" :key="index"
            class="h-[48px] border-t border-gray-200 hover:bg-gray-50 transition-colors">
            <td class="px-2">
              <input v-model="item.instrumentType"
                class="input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </td>
            <td class="px-2">
              <input v-model.number="item.quantity" type="number" step="0.01"
                class="input w-full px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </td>
            <td class="px-2 text-center">
              <input v-model="item.currency"
                class="input w-full px-2 py-1 text-center border border-gray-300 rounded bg-gray-100" readonly />
            </td>
            <td class="px-2">
              <input v-model.number="item.interestGross" type="number" step="0.01"
                class="input w-full px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </td>
            <td class="px-2 text-center">
              <div class="flex items-center justify-start gap-2">
                <div v-if="index > 0" @click="removeLiquidityItem(index)"
                  class="rounded-full p-1.5 border text-black border-transparent hover:text-red-500 transition focus:outline-none clickable"
                  title="Rimuovi">
                  <Icon name="mdi:bin" size="22" />
                </div>
                <div v-if="index === liquidity.length - 1" @click="addLiquidityItem"
                  class="rounded-full p-1.5 border text-black border-transparent hover:text-blue-500 transition focus:outline-none clickable"
                  title="Aggiungi riga">
                  <Icon name="mdi:plus-circle-outline" size="22" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>


    <!-- <section>
      <h2 class="text-xl font-semibold">Emergency Fund</h2>
      <div v-for="(item, index) in emergencyFund" :key="index" class="grid grid-cols-4 gap-2 items-end mb-2">
        <input v-model="item.instrumentType" placeholder="Type" class="input" />
        <input v-model.number="item.quantity" type="number" placeholder="Amount" class="input" />
        <input v-model="item.currency" placeholder="Currency" class="input" />
        <input v-model.number="item.interestGross" type="number" placeholder="Interest (Gross)" class="input" />
        <button @click="removeEmergencyItem(index)" class="text-red-500 hover:text-red-700">🗑️</button>
      </div>
      <button @click="addEmergencyItem" class="btn">+ Add</button>
    </section>

    <section>
      <h2 class="text-xl font-semibold">Bonds</h2>
      <div v-for="(item, index) in bonds" :key="index" class="grid grid-cols-5 gap-2 mb-2 items-end">
        <input v-model="item.broker" placeholder="Broker" class="input" />
        <input v-model="item.instrumentType" placeholder="Type" class="input" />
        <input v-model.number="item.quantity" type="number" placeholder="Quantity" class="input" />
        <input v-model.number="item.priceCurrent" type="number" placeholder="Current Price" class="input" />
        <input v-model.number="item.interestGross" type="number" placeholder="Gross Interest" class="input" />
        <input v-model="item.currency" placeholder="Currency" class="input" />
        <input v-model="item.issueDate" type="date" class="input" />
        <input v-model="item.couponDate" type="date" class="input" />
        <span class="text-sm">Valore attuale: €{{ item.valueCurrent.toFixed(2) }}</span>
        <button @click="removeBondItem(index)" class="text-red-500 hover:text-red-700">🗑️</button>
      </div>
      <button @click="addBondItem" class="btn">+ Add</button>
    </section>

    <section>
      <h2 class="text-xl font-semibold">ETF & Stocks</h2>
      <div v-for="(item, index) in equity" :key="index" class="grid grid-cols-12 gap-2 mb-2 items-end">
        <input v-model="item.broker" placeholder="Broker" class="input" />
        <input v-model="item.name" placeholder="Instrument Name" class="input" />
        <input v-model.number="item.quantity" type="number" placeholder="Qty" class="input" />
        <input v-model.number="item.priceCost" type="number" placeholder="Cost Price" class="input" />
        <input v-model.number="item.priceMarket" type="number" placeholder="Market Price" class="input" />
        <input v-model="item.currency" placeholder="Currency" class="input" />
        <span class="text-sm">Valore: €{{ item.valueCurrent.toFixed(2) }} | P/L: €{{ item.profitLoss.toFixed(2)
        }}</span>
        <button @click="removeEquityItem(index)" class="text-red-500 hover:text-red-700">🗑️</button>
      </div>
      <button @click="addEquityItem" class="btn">+ Add</button>
    </section>

    <section>
      <h2 class="text-xl font-semibold">Crypto</h2>
      <div v-for="(item, index) in crypto" :key="index" class="grid grid-cols-6 gap-2 mb-2 items-end">
        <input v-model="item.platform" placeholder="Platform" class="input" />
        <input v-model="item.symbol" placeholder="Symbol" class="input" />
        <input v-model.number="item.quantity" type="number" placeholder="Qty" class="input" />
        <input v-model.number="item.priceCost" type="number" placeholder="Cost Price" class="input" />
        <input v-model.number="item.priceMarket" type="number" placeholder="Market Price" class="input" />
        <span class="text-sm">Valore: €{{ item.valueCurrent.toFixed(2) }} | P/L: €{{ item.profitLoss.toFixed(2)
          }}</span>
        <button @click="removeCryptoItem(index)" class="text-red-500 hover:text-red-700">🗑️</button>
      </div>
      <button @click="addCryptoItem" class="btn">+ Add</button>
    </section> -->

    <!-- Save Button -->
    <button @click="saveSnapshot" class="btn-primary mt-6">Save Snapshot</button>
  </div>
</template>

<script setup lang="ts">
import { useAssets } from '~/composables/use-assets';
import type { MonthlySnapshot } from '~~/shared/financial';

const { addSnapshot, getSnapshot } = useAssets()

const currentMonth = new Date().toISOString().slice(0, 7)

const currentSnapshot = ref<MonthlySnapshot>({
  month: currentMonth,
  liquidity: [],
  emergencyFund: [],
  bonds: [],
  equity: [],
  crypto: [],
})

const liquidity = computed({
  get: () => currentSnapshot.value.liquidity,
  set: (val) => (currentSnapshot.value.liquidity = val),
})

const emergencyFund = computed({
  get: () => currentSnapshot.value.emergencyFund,
  set: (val) => (currentSnapshot.value.emergencyFund = val),
})

const bonds = computed({
  get: () => currentSnapshot.value.bonds,
  set: (val) => (currentSnapshot.value.bonds = val),
})

const equity = computed({
  get: () => currentSnapshot.value.equity,
  set: (val) => (currentSnapshot.value.equity = val),
})

const crypto = computed({
  get: () => currentSnapshot.value.crypto,
  set: (val) => (currentSnapshot.value.crypto = val),
})

function addLiquidityItem() {
  liquidity.value.push({ instrumentType: '', quantity: 0, currency: 'EUR', interestGross: 0 })
}

const totalLiquidityAmount = computed(() =>
  liquidity.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
)

function removeLiquidityItem(index: number) {
  liquidity.value.splice(index, 1)
}

function saveSnapshot() {
  addSnapshot({
    month: currentMonth,
    liquidity: liquidity.value,
    emergencyFund: emergencyFund.value,
    bonds: bonds.value,
    equity: equity.value,
    crypto: crypto.value,
  })
  alert('Snapshot saved!')
}

onMounted(() => {
  const snapshot = getSnapshot(currentMonth)
  if (snapshot) {
    currentSnapshot.value = snapshot as MonthlySnapshot;
  } else {
    // inizializza un nuovo snapshot se non esiste
    currentSnapshot.value = {
      month: currentMonth,
      liquidity: [],
      emergencyFund: [],
      bonds: [],
      equity: [],
      crypto: []
    }
  }
});
</script>

<style scoped>
.caption {
  display: flex;
  justify-content: space-between;
}
/* .action-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.btn-action {
  padding: 4px;
  width: 34px;
  height: 34px;
  font-size: 1rem;
  margin: 0;
}

.btn-action:hover {
  padding: 4px;
  width: 34px;
  height: 34px;
  font-size: 1rem;
  margin: 0;
} */
</style>
