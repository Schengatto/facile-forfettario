import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface PlannerConfig {
  selectedYear: number;
  currentMonth: number;
  hourlyRate: number;
  dailyHours: Record<string, number>;
  defaultDailyHours: Record<string, number>;
  monthlyInvoiced: Record<number, boolean>;
  monthlyRevenue: Record<number, number>;
  previousIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

export const usePlannerStorage = () => {
  const { $firebase } = useNuxtApp()
  const error = ref<string | null>(null)
  const loading = ref(false)

  const savePlannerConfig = async (configId: string, config: Omit<PlannerConfig, 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      loading.value = true
      error.value = null

      // Verifica se esiste già una configurazione con questo ID
      const existingConfig = await getDoc(doc($firebase.firestore, 'planner-configs', configId))
      if (existingConfig.exists()) {
        throw new Error('Esiste già una configurazione con questo ID')
      }

      const configWithDates: PlannerConfig = {
        ...config,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const configRef = doc($firebase.firestore, 'planner-configs', configId)
      await setDoc(configRef, configWithDates)

      return configId
    } catch (e: any) {
      error.value = e.message || 'Errore durante il salvataggio della configurazione'
      console.error("Errore durante il salvataggio della configurazione", e.message);
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const loadPlannerConfig = async (configId: string): Promise<PlannerConfig | null> => {
    try {
      loading.value = true
      error.value = null

      const configRef = doc($firebase.firestore, 'planner-configs', configId)
      const configSnap = await getDoc(configRef)

      if (!configSnap.exists()) {
        error.value = 'Configurazione non trovata'
        return null
      }

      return configSnap.data() as PlannerConfig
    } catch (e: any) {
      error.value = 'Errore durante il caricamento della configurazione'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    loading,
    savePlannerConfig,
    loadPlannerConfig
  }
}