<template>
  <div class="section flex-column">

    <h1 class="page-title">Calcolatore Mutuo</h1>

    <!-- DATI MUTUO -->
    <div class="card tool-card flex-column">
      <h2>Dati del mutuo</h2>

      <div class="input-grid">
        <div class="input-item">
          <label>Importo mutuo (€)</label>
          <input type="number" v-model.number="inputs.mortageAmount" min="0" />
        </div>

        <div class="input-item">
          <label>Tasso interesse (%)</label>
          <input type="number" v-model.number="inputs.mortageInterestRate" step="0.01" min="0" />
        </div>

        <div class="input-item">
          <label>Durata (anni)</label>
          <input type="number" v-model.number="inputs.mortageTerm" min="1" />
        </div>

        <div class="input-item">
          <label>Data apertura</label>
          <input type="date" v-model="inputs.startDate" />
        </div>
      </div>
    </div>

    <!-- RIEPILOGO -->
    <div class="card tool-card flex-column">
      <h2>Riepilogo iniziale</h2>

      <div class="results">
        <div class="result-card">
          <span class="label">Rata mensile</span>
          <span>{{ formatCurrency(monthlyPayment) }}</span>
        </div>
        <div class="result-card">
          <span class="label">Totale da ripagare</span>
          <span>{{ formatCurrency(totalPayment) }}</span>
        </div>
        <div class="result-card">
          <span class="label">Totale interessi</span>
          <span>{{ formatCurrency(totalInterest) }}</span>
        </div>
        <div class="result-card">
          <span class="label">Numero rate</span>
          <span>{{ totalMonths }}</span>
        </div>
        <div class="result-card">
          <span class="label">Scadenza</span>
          <span>{{ endDate }}</span>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <button class="primary-btn" @click="showAmortization = true">
          Visualizza piano di ammortamento
        </button>
      </div>
    </div>

    <!-- RIMBORSO -->
    <div class="card tool-card flex-column">
      <Checkbox id="partial" label="Simula rimborso parziale / totale" v-model="partial.enabled" />

      <div v-if="partial.enabled" class="input-grid">
        <div class="input-item">
          <label>Rate già pagate</label>
          <input type="number" v-model.number="partial.paidMonths" min="0" :max="totalMonths" />
        </div>

        <div class="input-item">
          <label>Importo rimborso (€)</label>
          <input type="number" v-model.number="partial.amount" min="0" />
        </div>
      </div>
    </div>

    <!-- SCENARI -->
    <div v-if="partial.enabled" class="card tool-card flex-column">
      <h2>Scenari dopo rimborso</h2>

      <div class="partial-options">
        <!-- OPZIONE 1 -->
        <div class="partial-card">
          <div class="partial-title">Opzione 1 – Riduzione rata</div>

          <div v-if="remainingPrincipalAfterRepayment === 0">
            Mutuo estinto con il rimborso.
          </div>

          <div v-else>
            <div>Nuova rata: <strong>{{ formatCurrency(newMonthlyPaymentOption1) }}</strong></div>
            <div>Rate residue: <strong>{{ remainingMonths }}</strong></div>
            <div>Totale da ripagare: <strong>{{ formatCurrency(totalAfterOption1) }}</strong></div>
            <div>Interessi futuri: <strong>{{ formatCurrency(interestOption1) }}</strong></div>
            <div class="saving">
              Risparmio totale: <strong>{{ formatCurrency(savingOption1) }}</strong>
            </div>
          </div>
        </div>

        <!-- OPZIONE 2 -->
        <div class="partial-card">
          <div class="partial-title">Opzione 2 – Riduzione durata</div>

          <div v-if="remainingPrincipalAfterRepayment === 0">
            Mutuo estinto immediatamente.
          </div>

          <div v-else>
            <div>Rata invariata: <strong>{{ formatCurrency(monthlyPayment) }}</strong></div>
            <div>Rate residue: <strong>{{ remainingMonthsOption2 }}</strong></div>
            <div>Totale da ripagare: <strong>{{ formatCurrency(totalAfterOption2) }}</strong></div>
            <div>Interessi futuri: <strong>{{ formatCurrency(interestOption2) }}</strong></div>
            <div class="saving">
              Risparmio totale: <strong>{{ formatCurrency(savingOption2) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALE AMMORTAMENTO -->
    <div v-if="showAmortization" class="modal-overlay" @click.self="showAmortization = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Piano di ammortamento</h2>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mese</th>
                <th>Rata</th>
                <th>Interessi</th>
                <th>Capitale</th>
                <th>Debito residuo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in amortizationSchedule" :key="row.index">
                <td>{{ row.index }}</td>
                <td>{{ row.date }}</td>
                <td>{{ formatCurrency(row.payment) }}</td>
                <td>{{ formatCurrency(row.interest) }}</td>
                <td>{{ formatCurrency(row.principal) }}</td>
                <td>{{ formatCurrency(row.remaining) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" @click="showAmortization = false">
            Chiudi
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Checkbox from '~/components/common/Checkbox.vue';

interface Input {
  mortageAmount: number;
  mortageInterestRate: number;
  mortageTerm: number;
  startDate?: string;
}

useHead({
  title: 'Finance Toolbox - Calcolatore Mutuo',
  meta: [
    { name: 'description', content: 'Calcolatore per mutui con piano ammortamento e rimborso parziale.' },
    { name: 'keywords', content: 'calcolo mutui, mutuo, rimborso parziale, ammortamento mutuo' },
  ],
  link: [
    { rel: 'canonical', href: 'https://finance-toolbox.it/mortage' }
  ]
});

const getYearMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getYearMonthDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate() + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inputs = ref<Input>({
  mortageAmount: 250000,
  mortageInterestRate: 3,
  mortageTerm: 30,
  startDate: getYearMonthDate(),
});

const partial = ref({
  enabled: false,
  paidMonths: 0,
  amount: 0,
});

const showAmortization = ref(false);

const formatCurrency = (v: number): string => {
  const formatted = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(v);

  return `€ ${formatted.replace('€', '').trim()}`;
};

/* BASE */
const totalMonths = computed(() => inputs.value.mortageTerm * 12);
const r = computed(() => inputs.value.mortageInterestRate / 100 / 12);

const monthlyPayment = computed(() => {
  const P = inputs.value.mortageAmount;
  const n = totalMonths.value;
  if (r.value === 0) return P / n;
  return (
    P *
    (r.value * Math.pow(1 + r.value, n)) /
    (Math.pow(1 + r.value, n) - 1)
  );
});

const totalPayment = computed(() => monthlyPayment.value * totalMonths.value);
const totalInterest = computed(() => totalPayment.value - inputs.value.mortageAmount);

/* AMMORTAMENTO */
const amortizationSchedule = computed(() => {
  const rows: {
    index: number;
    date: string;
    payment: number;
    interest: number;
    principal: number;
    remaining: number;
  }[] = [];

  if (!inputs.value.startDate) return rows;

  let remaining = inputs.value.mortageAmount;
  const rate = monthlyPayment.value;
  const monthlyRate = r.value;

  let currentDate = new Date(inputs.value.startDate) ?? new Date();

  for (let i = 1; i <= totalMonths.value; i++) {
    const interest = monthlyRate === 0 ? 0 : remaining * monthlyRate;
    const principal = rate - interest;
    remaining = Math.max(0, remaining - principal);

    rows.push({
      index: i,
      date: `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`,
      payment: rate,
      interest: interest,
      principal: principal,
      remaining: remaining,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return rows;
});

/* DEBITO RESIDUO + OPZIONI (immutate) */
const principalAfterPaidMonths = computed(() => {
  const k = Math.min(Math.max(partial.value.paidMonths, 0), totalMonths.value);
  const P = inputs.value.mortageAmount;
  if (k === 0) return P;

  if (r.value === 0) {
    return Math.max(0, P - monthlyPayment.value * k);
  }

  return (
    P * Math.pow(1 + r.value, k) -
    monthlyPayment.value * ((Math.pow(1 + r.value, k) - 1) / r.value)
  );
});

const remainingPrincipalAfterRepayment = computed(() =>
  Math.max(0, principalAfterPaidMonths.value - partial.value.amount)
);

const remainingMonths = computed(() =>
  totalMonths.value - Math.min(Math.max(partial.value.paidMonths, 0), totalMonths.value)
);

const remainingTotalWithoutRepayment = computed(() =>
  remainingMonths.value * monthlyPayment.value
);

/* OPZIONE 1 */
const newMonthlyPaymentOption1 = computed(() => {
  if (remainingPrincipalAfterRepayment.value === 0) return 0;
  if (r.value === 0) {
    return remainingPrincipalAfterRepayment.value / remainingMonths.value;
  }

  return (
    remainingPrincipalAfterRepayment.value *
    (r.value * Math.pow(1 + r.value, remainingMonths.value)) /
    (Math.pow(1 + r.value, remainingMonths.value) - 1)
  );
});

const totalAfterOption1 = computed(() =>
  newMonthlyPaymentOption1.value * remainingMonths.value
);

const interestOption1 = computed(() =>
  totalAfterOption1.value - remainingPrincipalAfterRepayment.value
);

const totalWithOption1 = computed(() =>
  partial.value.amount + totalAfterOption1.value
);

const savingOption1 = computed(() =>
  remainingTotalWithoutRepayment.value - totalWithOption1.value
);

/* OPZIONE 2 */
const remainingMonthsOption2 = computed(() => {
  if (remainingPrincipalAfterRepayment.value === 0) return 0;
  if (r.value === 0) {
    return Math.ceil(remainingPrincipalAfterRepayment.value / monthlyPayment.value);
  }

  const n =
    Math.log(
      monthlyPayment.value /
      (monthlyPayment.value - remainingPrincipalAfterRepayment.value * r.value)
    ) / Math.log(1 + r.value);

  return Math.round(n);
});

const totalAfterOption2 = computed(() =>
  remainingMonthsOption2.value * monthlyPayment.value
);

const interestOption2 = computed(() =>
  totalAfterOption2.value - remainingPrincipalAfterRepayment.value
);

const totalWithOption2 = computed(() =>
  partial.value.amount + totalAfterOption2.value
);

const savingOption2 = computed(() =>
  remainingTotalWithoutRepayment.value - totalWithOption2.value
);

/* DATA FINE */
const endDate = computed(() => {
  if (!inputs.value.startDate) return new Date();
  const [y, m] = getYearMonth(new Date(inputs.value.startDate) ?? new Date()).split('-').map(Number);
  const _endDate = new Date(y!, m! - 1);
  _endDate.setMonth(_endDate.getMonth() + totalMonths.value);
  return `${String(_endDate.getMonth() + 1).padStart(2, '0')}/${_endDate?.getFullYear()}`;
});
</script>

<style scoped>
.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.results {
  display: grid;
  gap: 10px;
}

.result-card {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  font-weight: bold;
}

.partial-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.partial-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  background-color: var(--color-background);
}

.partial-title {
  font-variant: small-caps;
  font-weight: bold;
}

.saving {
  margin-top: 6px;
  color: #2e7d32;
  font-weight: bold;
}

.primary-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: #1976d2;
  color: white;
  cursor: pointer;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  color: #333;
  border-radius: 10px;
  padding: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  overflow: auto;
  margin: 12px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  text-align: right;
}

th:first-child,
td:first-child {
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: #555;
}

.close-btn:hover {
  color: #000;
}

thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
</style>
