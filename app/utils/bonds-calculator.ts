import { CashFlow } from '@webcarrot/xirr';
import { addMonths, differenceInDays } from 'date-fns';

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

export interface BondCalculationResults {
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

export function calculateBondYield(inputs: BondInputs): BondCalculationResults {
  // Parse delle date
  const issueDate = parseISODate(inputs.issueDate);
  const maturityDate = parseISODate(inputs.maturityDate);
  const purchaseDate = parseISODate(inputs.purchaseDate);
  const saleDate = inputs.saleOption === 'early' ?
    parseISODate(inputs.saleDate) :
    maturityDate;

  // Calcoli base
  const numberOfUnits = Math.floor(parseFloat(inputs.nominalValue) / 100);
  const actualInvestedCapital = numberOfUnits * inputs.unitPrice;
  const couponAmount = (parseFloat(inputs.couponRate) / 100 * 100) / inputs.couponFrequency;

  // Calcolo del rateo
  const lastCouponDate = findLastPaymentDate(purchaseDate, issueDate, inputs.couponFrequency);
  const nextCouponDate = addMonths(lastCouponDate, 12 / inputs.couponFrequency);

  const accruedInterest = calculateAccruedAmount(
    couponAmount * numberOfUnits,
    purchaseDate,
    nextCouponDate,
    lastCouponDate
  );

  // Inizializza i flussi di cassa
  const cashFlows: CashFlow[] = [
    {
      date: formatItalianDate(purchaseDate),
      description: 'Acquisto Obbligazione',
      value: -actualInvestedCapital
    }
  ];

  if (accruedInterest > 0) {
    cashFlows.push({
      date: formatItalianDate(purchaseDate),
      description: `Rateo cedola`,
      value: -accruedInterest
    });
  }

  if (inputs.purchaseCommission > 0) {
    cashFlows.push({
      date: formatItalianDate(purchaseDate),
      description: 'Commissioni di acquisto',
      value: -inputs.purchaseCommission
    });
  }

  // Genera date cedole e relativi flussi
  const couponDates = calculatePaymentDates(issueDate, saleDate, inputs.couponFrequency);

  // Filtra e aggiungi solo le cedole dopo la data di acquisto
  const validCouponDates = couponDates.filter(date => date > purchaseDate && date <= saleDate);

  validCouponDates.forEach(date => {
    const isFirstCoupon = date === validCouponDates[0];
    let grossValue = couponAmount * numberOfUnits;
    let taxableAmount = grossValue;

    if (isFirstCoupon) {
      const ownershipDays = differenceInDays(date, purchaseDate);
      const periodDays = differenceInDays(date, lastCouponDate);
      taxableAmount = (grossValue * ownershipDays) / periodDays;
    }

    const taxAmount = calculateTax(taxableAmount, inputs.isGovernmentBond);

    cashFlows.push(
      {
        date: formatItalianDate(date),
        description: isFirstCoupon ? 'Prima Cedola' : 'Cedola',
        value: grossValue
      },
      {
        date: formatItalianDate(date),
        description: 'Tasse su cedola',
        value: -taxAmount
      }
    );
  });

  // Aggiungi flussi di vendita
  const finalUnitPrice = inputs.saleOption === 'early' ? inputs.saleUnitPrice : 100;
  const finalPayment = numberOfUnits * finalUnitPrice;

  if (inputs.saleOption === 'early' && inputs.saleCommission > 0) {
    cashFlows.push({
      date: formatItalianDate(saleDate),
      description: 'Commissioni di vendita',
      value: -inputs.saleCommission
    });
  }

  const capitalGain = Math.max(0, (finalUnitPrice - inputs.unitPrice) * numberOfUnits);
  const capitalGainTax = calculateTax(capitalGain, inputs.isGovernmentBond);

  cashFlows.push({
    date: formatItalianDate(saleDate),
    description: inputs.saleOption === 'early' ? 'Vendita Obbligazione' : 'Rimborso Obbligazione',
    value: finalPayment
  });

  if (capitalGainTax > 0) {
    cashFlows.push({
      date: formatItalianDate(saleDate),
      description: 'Tassa sulla plusvalenza',
      value: -capitalGainTax
    });
  }

  // Calcolo rendimenti
  const totalCommissions = inputs.purchaseCommission +
    (inputs.saleOption === 'early' ? inputs.saleCommission : 0);

  // Conversione per calcolo XIRR
  const xirrCashFlows: XIRRCashFlow[] = cashFlows.map(cf => ({
    date: parseISODate(cf.date),
    value: cf.value
  }));

  // Calcolo XIRR lordo (escludendo le tasse)
  const grossCashFlows = cashFlows
    .filter(cf => !cf.description.includes('Tasse'))
    .map(cf => ({
      date: parseISODate(cf.date),
      value: cf.value
    }));

  const irrGross = calculateXIRR(grossCashFlows);
  const irrNet = calculateXIRR(xirrCashFlows);

  // Calcola rendimenti totali
  const totalNetYield = cashFlows.reduce((sum, flow) => sum + flow.value, 0);
  const totalGrossYield = totalNetYield + cashFlows
    .filter(flow => flow.description.includes('Tasse'))
    .reduce((sum, flow) => sum - flow.value, 0);

  // Calcola rendimenti annuali
  const years = differenceInDays(saleDate, purchaseDate) / 365;
  const annualGrossYieldPercentage = (Math.pow(1 + irrGross, 1) - 1) * 100;
  const annualNetYieldPercentage = (Math.pow(1 + irrNet, 1) - 1) * 100;
  const annualGrossYieldValue = actualInvestedCapital * annualGrossYieldPercentage / 100;
  const annualNetYieldValue = actualInvestedCapital * annualNetYieldPercentage / 100;

  return {
    cashFlows,
    totalGrossYield: totalGrossYield.toFixed(2),
    totalNetYield: totalNetYield.toFixed(2),
    annualGrossYieldPercentage: annualGrossYieldPercentage.toFixed(2),
    annualNetYieldPercentage: annualNetYieldPercentage.toFixed(2),
    annualGrossYieldValue: annualGrossYieldValue.toFixed(2),
    annualNetYieldValue: annualNetYieldValue.toFixed(2),
    accruedInterest: accruedInterest.toFixed(2),
    actualInvestedCapital: actualInvestedCapital.toFixed(2),
    numberOfUnits,
    capitalGainTax: capitalGainTax.toFixed(2),
    finalNetValue: (finalPayment - capitalGainTax).toFixed(2),
    totalCommissions: totalCommissions.toFixed(2),
    irrGross: (irrGross * 100).toFixed(2),
    irrNet: (irrNet * 100).toFixed(2)
  };
}