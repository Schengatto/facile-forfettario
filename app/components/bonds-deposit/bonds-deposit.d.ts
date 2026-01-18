// Interfaccia CashFlow comune
export interface CashFlow {
    date: string;
    description: string;
    value: number;
}

// Interfaccia per i risultati del Conto Deposito
export interface DepositResults {
    initialCapital: string;         // Capitale iniziale investito
    totalGrossInterest: string;     // Totale interessi lordi
    totalNetInterest: string;       // Totale interessi netti
    totalTax: string;               // Totale tasse pagate
    finalCapital: string;           // Capitale finale
    effectiveGrossYield: string;    // Rendimento effettivo lordo (%)
    effectiveNetYield: string;      // Rendimento effettivo netto (%)
    cashFlows: CashFlow[];         // Flussi di cassa
}

// Estensione dell'interfaccia CashFlow per le obbligazioni
export interface BondCashFlow extends CashFlow {
    base100Value: number;           // Valore rapportato a base 100
}

// Interfaccia per i risultati delle Obbligazioni
export interface BondResults {
    cashFlows: BondCashFlow[];      // Flussi di cassa con valori base 100
    totalGrossYield: string;        // Rendimento totale lordo
    totalNetYield: string;          // Rendimento totale netto
    annualGrossYieldPercentage: string;  // Rendimento annuo lordo (%)
    annualNetYieldPercentage: string;    // Rendimento annuo netto (%)
    annualGrossYieldValue: string;       // Valore rendimento annuo lordo
    annualNetYieldValue: string;         // Valore rendimento annuo netto
    accruedInterest: string;        // Rateo maturato
    actualInvestedCapital: string;  // Capitale effettivamente investito
    numberOfUnits: number;          // Numero di unità acquistate
    capitalGainTax: string;         // Tasse su plusvalenza
    finalNetValue: string;          // Valore finale netto
    totalCommissions: string;       // Totale commissioni
    irrGross: string;              // TIR lordo (%)
    irrNet: string;                // TIR netto (%)
}

// Interfaccia per i dati di input del Conto Deposito
export interface DepositInputs {
    depositAmount: number;          // Ammontare da depositare
    startDate: string;             // Data inizio deposito
    interestRate: number;          // Tasso di interesse
    interestFrequency: 1 | 4 | 12; // Frequenza interessi (annuale, trimestrale, mensile)
    depositDuration: number;        // Durata deposito in mesi
    constraintMonths: number;       // Mesi di vincolo
    reinvestInterest: boolean;      // Flag reinvestimento interessi
}

// Interfaccia per i dati di input delle Obbligazioni
export interface BondInputs {
    unitPrice: number;             // Prezzo unitario
    purchaseCommission: number;     // Commissioni di acquisto
    saleCommission: number;         // Commissioni di vendita
    couponRate: string;            // Tasso cedola
    nominalValue: string;          // Valore nominale
    issueDate: string;             // Data emissione
    maturityDate: string;          // Data scadenza
    purchaseDate: string;          // Data acquisto
    isGovernmentBond: boolean;      // Flag titolo di stato
    couponFrequency: 1 | 2;        // Frequenza cedole (annuale, semestrale)
    saleOption: 'maturity' | 'early'; // Opzione di vendita
    saleDate: string;              // Data vendita
    saleUnitPrice: number;         // Prezzo unitario di vendita
}