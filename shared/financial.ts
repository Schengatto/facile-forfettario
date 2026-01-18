export interface FinancialParams {
    maxLiquidity: number;
    maxFunds: number;
    maxBonds: number;
    maxEtf: number;
    maxCrypto: number;
    fundsYield: number;
    bondsYield: number;
    etfYield: number;
    cryptoYield: number;
    monthlyIncome: number;
    targetWealth: number;
    initialLiquidity: number;
    initialFunds: number;
    initialBonds: number;
    initialEtf: number;
    initialCrypto: number;
}

export interface FinancialData {
    month?: string;
    year?: number;
    liquidity: number;
    funds: number;
    bonds: number;
    etf: number;
    crypto: number;
    total: number;
    goalReached: boolean;
    yearlyGrowth?: string;
    fundsYield: number;
    bondsYield: number;
    etfYield: number;
    cryptoYield: number;
    [key: string]: string | number | boolean | undefined;
}

export interface ExternalLink {
    label: string;
    link: string;
}

export interface LiquidityItem {
    instrumentType: string; // e.g. Bank account
    quantity: number;
    currency: string;
    interestGross: number; // default: 0
}

export interface EmergencyFundItem {
    instrumentType: string;
    quantity: number;
    currency: string;
    interestGross: number;
}

export interface BondItem {
    broker: string;
    instrumentType: string; // e.g. Government Bond
    quantity: number;
    currency: string;
    interestGross: number;
    issueDate: string; // ISO Date
    couponDate: string; // ISO Date
    priceCurrent: number; // entered by user
    valueCurrent: number; // = priceCurrent + interestGross
}

export interface EquityItem {
    broker: string;
    name: string;
    quantity: number;
    currency: string;
    priceCost: number;
    priceMarket: number;
    valueCurrent: number; // calculated = quantity * priceMarket
    profitLoss: number; // calculated = (priceMarket - priceCost) * quantity
}

export interface CryptoItem {
    platform: string;
    symbol: string;
    quantity: number;
    priceCost: number;
    priceMarket: number;
    valueCurrent: number; // calculated
    profitLoss: number; // calculated
}

export interface MonthlySnapshot {
    month: string; // e.g. "2025-08"
    liquidity: LiquidityItem[];
    emergencyFund: EmergencyFundItem[];
    bonds: BondItem[];
    equity: EquityItem[];
    crypto: CryptoItem[];
}