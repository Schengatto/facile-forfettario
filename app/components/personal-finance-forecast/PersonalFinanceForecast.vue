<template>
  <div class="financial-dashboard">
    <h1 class="page-title">Previsione Finanze Personali</h1>
    <p>Simulatore di pianificazione patrimoniale che consente di visualizzare la crescita dei propri investimenti dal
      2025 al 2050, ridistribuendo automaticamente gli eccessi oltre i limiti massimi secondo una strategia che alloca
      il 35% in obbligazioni, il 60% in ETF e il 5% in crypto, fino al raggiungimento dei rispettivi limiti massimi
      impostati. L'utente può personalizzare la situazione di partenza, i rendimenti attesi e gli obiettivi finanziari,
      visualizzando l'evoluzione del patrimonio con dettagli mensili e annuali, comprensivi di rendimenti composti per
      ogni forma di investimento.</p>

    <FinancialForecastForm :params="params" @update="updateParams" />

    <FinancialForecastDisplay :monthly-data="calculatedData.monthlyData" :yearly-data="calculatedData.yearlyData"
      :goal-year="calculatedData.goalYear" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import FinancialForecastForm from "./FinancialForecastFrom.vue";
import FinancialForecastDisplay from "./FinancialForecastDisplay.vue";
import type { FinancialParams } from '~/types/financial';

interface FinancialState {
  liquidity: number;
  funds: number;
  bonds: number;
  etf: number;
  crypto: number;
  fundsYield: number;
  bondsYield: number;
  etfYield: number;
  cryptoYield: number;
}

interface CalculatedData {
  monthlyData: Record<number, Array<FinancialState & {
    month: string;
    total: number;
    goalReached: boolean;
  }>>;
  yearlyData: Array<FinancialState & {
    year: number;
    total: number;
    yearlyGrowth: string;
    goalReached: boolean;
  }>;
  goalYear: number | null;
}

const params = ref<FinancialParams>({
  maxLiquidity: 10000,
  maxFunds: 35000,
  maxBonds: 200000,
  maxEtf: Infinity,
  maxCrypto: 0,
  fundsYield: 2,
  bondsYield: 3,
  etfYield: 5,
  cryptoYield: 0,
  monthlyIncome: 2000,
  targetWealth: 1000000,
  initialLiquidity: 5000,
  initialFunds: 15000,
  initialBonds: 20000,
  initialEtf: 20000,
  initialCrypto: 0
})

const calculateFinancialProjection = (parameters: FinancialParams): CalculatedData => {
  const monthlyData: CalculatedData['monthlyData'] = {}
  const yearlyData: CalculatedData['yearlyData'] = []

  const initialState: FinancialState = {
    liquidity: parameters.initialLiquidity,
    funds: parameters.initialFunds,
    bonds: parameters.initialBonds,
    etf: parameters.initialEtf,
    crypto: parameters.initialCrypto,
    fundsYield: parameters.fundsYield,
    bondsYield: parameters.bondsYield,
    etfYield: parameters.etfYield,
    cryptoYield: parameters.cryptoYield
  }

  const monthlyRates = {
    funds: parameters.fundsYield / 100 / 12,
    bonds: parameters.bondsYield / 100 / 12,
    etf: parameters.etfYield / 100 / 12,
    crypto: parameters.cryptoYield / 100 / 12
  }

  let currentState = { ...initialState }
  let goalReached = false
  let goalYear: number | null = null
  const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

  for (let year = 2025; year <= 2050; year++) {
    monthlyData[year] = []

    for (let month = 0; month < 12; month++) {
      // Add monthly income
      currentState.liquidity += parameters.monthlyIncome

      // Apply monthly yields
      currentState.funds *= (1 + monthlyRates.funds)
      currentState.bonds *= (1 + monthlyRates.bonds)
      currentState.etf *= (1 + monthlyRates.etf)
      currentState.crypto *= (1 + monthlyRates.crypto)

      // Handle excesses and redistribute according to limits
      let excessTotal = 0

      // Check liquidity excess
      if (currentState.liquidity > parameters.maxLiquidity) {
        excessTotal += currentState.liquidity - parameters.maxLiquidity
        currentState.liquidity = parameters.maxLiquidity
      }

      // Check funds excess
      if (currentState.funds > parameters.maxFunds) {
        excessTotal += currentState.funds - parameters.maxFunds
        currentState.funds = parameters.maxFunds
      }

      // Check crypto excess
      if (currentState.crypto > parameters.maxCrypto) {
        excessTotal += currentState.crypto - parameters.maxCrypto
        currentState.crypto = parameters.maxCrypto
      }

      // Redistribute excess
      if (excessTotal > 0) {
        // 35% to bonds (up to max)
        const toBonds = Math.min(
          excessTotal * 0.35,
          parameters.maxBonds - currentState.bonds
        )
        currentState.bonds += toBonds

        // Remaining split between ETF (60%) and Crypto (5%)
        const remaining = excessTotal - toBonds
        const toCrypto = Math.min(
          remaining * 0.05,
          parameters.maxCrypto - currentState.crypto
        )
        currentState.crypto += toCrypto
        currentState.etf += (remaining - toCrypto)
      }

      // Ensure no negative values and round to 2 decimals
      Object.keys(currentState).forEach(key => {
        if (key !== 'fundsYield' && key !== 'bondsYield' && key !== 'etfYield' && key !== 'cryptoYield') {
          currentState[key as keyof FinancialState] = Math.max(
            0,
            Math.round(currentState[key as keyof FinancialState] * 100) / 100
          )
        }
      })

      // Calculate total and check goal
      const total = currentState.liquidity + currentState.funds + currentState.bonds + currentState.etf + currentState.crypto

      if (!goalReached && total >= parameters.targetWealth) {
        goalReached = true
        goalYear = year
      }

      monthlyData[year].push({
        ...currentState,
        month: months[month],
        total,
        goalReached
      })
    }

    // Calculate yearly data
    const yearEnd = monthlyData[year][11]
    const previousYearEnd = year > 2025 && monthlyData[year - 1]
      ? monthlyData[year - 1][11]
      : null

    yearlyData.push({
      year,
      ...yearEnd,
      yearlyGrowth: previousYearEnd
        ? ((yearEnd.total - previousYearEnd.total) / previousYearEnd.total * 100).toFixed(2)
        : '0.00',
      goalReached: yearEnd.goalReached
    })
  }

  return { monthlyData, yearlyData, goalYear }
}

const calculatedData = computed((): CalculatedData => {
  return calculateFinancialProjection(params.value)
})

const updateParams = (newParams: FinancialParams) => {
  params.value = newParams
}
</script>

<style scoped>
.financial-dashboard {
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 30px;
}
</style>