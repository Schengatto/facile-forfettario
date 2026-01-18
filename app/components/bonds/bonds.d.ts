export interface BondInputs {
    unitPrice: number;
    purchaseCommission: number;
    saleCommission: number;
    couponRate: string;
    nominalValue: string;
    issueDate: string;
    maturityDate: string;
    purchaseDate: string;
    isGovernmentBond: boolean;
    couponFrequency: 1 | 2;
    saleOption: 'maturity' | 'early';
    saleDate: string;
    saleUnitPrice: number;
}

export interface CashFlow {
    date: string;
    description: string;
    value: number;
    base100Value: number;
}

export interface CalculationResults {
    cashFlows: CashFlow[];
    totalGrossYield: string;
    totalNetYield: string;
    annualGrossYieldPercentage: string;
    annualNetYieldPercentage: string;
    annualGrossYieldValue: string;
    annualNetYieldValue: string;
    accruedInterest: string;
    actualInvestedCapital: string;
    numberOfUnits: number;
    capitalGainTax: string;
    finalNetValue: string;
    totalCommissions: string;
    irrGross: string;
    irrNet: string;
}

export interface OwnershipPeriod {
    daysOwned: number;
    totalDays: number;
}