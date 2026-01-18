export interface DepositInputs {
    depositAmount: number;
    startDate: string;
    interestRate: number;
    interestFrequency: 1 | 4 | 12;
    depositDuration: number;
    constraintMonths: number;
    reinvestInterest: boolean;
}

export interface CashFlow {
    date: string;
    description: string;
    value: number;
    balance: number;
}

export interface CalculationResults {
    initialCapital: string;
    totalGrossInterest: string;
    totalNetInterest: string;
    totalTax: string;
    finalCapital: string;
    effectiveGrossYield: string;
    effectiveNetYield: string;
    cashFlows: CashFlow[];
}