import { xirr } from "@webcarrot/xirr";

export interface XIRRCashFlow {
  date: Date;
  value: number;
}

export function calculateXIRR(cashflows: XIRRCashFlow[]): number {
  if (!cashflows.length) return 0;

  try {
    // Ordina i flussi per data
    const sortedCashflows = [...cashflows].sort((a, b) =>
      a.date.getTime() - b.date.getTime()
    );

    // Prepara i dati nel formato richiesto da @webcarrot/xirr
    // Converti le date in timestamp (millisecondi dal 1970)
    const xirrData = sortedCashflows.map(cf => ({
      amount: cf.value,
      date: cf.date // Converti millisecondi in giorni
    }));

    // Calcola XIRR
    const result = xirr(xirrData);

    // Gestisci risultati invalidi
    if (isNaN(result) || !isFinite(result)) {
      return 0;
    }

    return result;
  } catch (error) {
    console.error('Errore nel calcolo XIRR:', error);
    return 0;
  }
}

// Funzione helper per convertire una stringa data in Date
export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}