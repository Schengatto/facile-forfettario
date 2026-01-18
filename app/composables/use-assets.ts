import { ref, watch } from 'vue'

type MonthlySnapshot = {
  month: string
  liquidity: LiquidityItem[]
  emergencyFund: EmergencyItem[]
  bonds: BondItem[]
  equity: EquityItem[]
  crypto: CryptoItem[]
}

interface LiquidityItem {
  instrumentType: string
  quantity: number
  currency: string
  interestGross: number
}

interface EmergencyItem {
  instrumentType: string
  quantity: number
  currency: string
  interestGross: number
}

interface BondItem {
  broker: string
  instrumentType: string
  quantity: number
  currency: string
  interestGross: number
  issueDate: string
  couponDate?: string
  priceCurrent: number
  valueCurrent: number
}

interface EquityItem {
  broker: string
  name: string
  quantity: number
  currency: string
  priceCost: number
  priceMarket: number
  valueCurrent: number
  profitLoss: number
}

interface CryptoItem {
  platform: string
  symbol: string
  quantity: number
  priceCost: number
  priceMarket: number
  valueCurrent: number
  profitLoss: number
}

const STORAGE_KEY = 'wealth_snapshots'

export const useAssets = () => {
  const snapshots = ref<MonthlySnapshot[]>([])

  // Load from localStorage on mount
  if (process.client) {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) snapshots.value = JSON.parse(data)
  }

  // Auto-save to localStorage on changes
  watch(
    snapshots,
    () => {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.value))
      }
    },
    { deep: true }
  )

  function addSnapshot(snapshot: MonthlySnapshot) {
    const existingIndex = snapshots.value.findIndex(s => s.month === snapshot.month)
    if (existingIndex !== -1) {
      snapshots.value[existingIndex] = snapshot // overwrite
    } else {
      snapshots.value.push(snapshot)
    }
  }

  function getSnapshot(month: string): MonthlySnapshot | undefined {
    return snapshots.value.find(s => s.month === month)
  }

  function removeSnapshot(month: string) {
    snapshots.value = snapshots.value.filter(s => s.month !== month)
  }

  return {
    snapshots,
    addSnapshot,
    getSnapshot,
    removeSnapshot
  }
}
