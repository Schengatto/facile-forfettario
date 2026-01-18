import { addMonths, differenceInDays, format, parse } from "date-fns";
import type { BondInputs, CashFlow } from "./bonds";

const getLastCouponDate = (date: Date, inputs: BondInputs) => {
    const issueDate = parse(inputs.issueDate, 'yyyy-MM-dd', new Date());
    const purchaseDate = date;

    // Se la data di acquisto è precedente alla prima cedola, usa la data di emissione
    const firstCouponDate = addMonths(issueDate, 12 / inputs.couponFrequency);
    if (purchaseDate < firstCouponDate) {
        return issueDate;
    }

    // Altrimenti trova l'ultima cedola pagata
    let lastCouponDate = issueDate;
    let nextDate = addMonths(issueDate, 12 / inputs.couponFrequency);

    while (nextDate <= purchaseDate) {
        lastCouponDate = nextDate;
        nextDate = addMonths(lastCouponDate, 12 / inputs.couponFrequency);
    }

    return lastCouponDate;
};

export const calculateBondYield = (inputs: BondInputs) => {
    const {
        unitPrice,
        purchaseCommission,
        saleCommission,
        couponRate,
        nominalValue,
        issueDate,
        maturityDate,
        purchaseDate,
        isGovernmentBond,
        couponFrequency,
        saleOption,
        saleDate,
        saleUnitPrice
    } = inputs;

    const taxRate = isGovernmentBond ? 0.125 : 0.26;
    const parseDate = (dateString: string) => parse(dateString, 'yyyy-MM-dd', new Date());

    const issueDateTime = parseDate(issueDate);
    const maturityDateTime = parseDate(maturityDate);
    const purchaseDateTime = parseDate(purchaseDate);
    const saleDateTime = saleOption === 'early' ? parseDate(saleDate) : maturityDateTime;

    const numberOfUnits = Math.floor(parseFloat(nominalValue) / 100);
    const actualInvestedCapital = numberOfUnits * unitPrice;

    const couponAmount = (parseFloat(couponRate) / 100 * 100) / couponFrequency;

    // Calcolo del rateo all'acquisto
    const lastCouponOrIssueDate = getLastCouponDate(purchaseDateTime, inputs);
    const nextCouponDate = addMonths(lastCouponOrIssueDate, 12 / couponFrequency);

    // Calcola i giorni trascorsi dall'ultima cedola (o emissione) fino all'acquisto
    const daysSinceLastCoupon = differenceInDays(purchaseDateTime, lastCouponOrIssueDate);
    const daysInPeriod = differenceInDays(nextCouponDate, lastCouponOrIssueDate);

    // Calcola il rateo all'acquisto in base ai giorni effettivi
    const accruedInterest = (couponAmount * daysSinceLastCoupon) / daysInPeriod * numberOfUnits;

    // Inizializza flussi di cassa
    const cashFlows: CashFlow[] = [
        {
            date: format(purchaseDateTime, 'dd/MM/yyyy'),
            description: 'Acquisto Obbligazione',
            value: -actualInvestedCapital,
            base100Value: -100
        }
    ];

    if (accruedInterest > 0) {
        cashFlows.push({
            date: format(purchaseDateTime, 'dd/MM/yyyy'),
            description: `Rateo all'acquisto (${daysSinceLastCoupon}/${daysInPeriod} giorni)`,
            value: -accruedInterest,
            base100Value: (-accruedInterest / numberOfUnits) * (100 / unitPrice)
        });
    }

    if (purchaseCommission > 0) {
        cashFlows.push({
            date: format(purchaseDateTime, 'dd/MM/yyyy'),
            description: 'Commissioni di acquisto',
            value: -purchaseCommission,
            base100Value: (-purchaseCommission / numberOfUnits) * (100 / unitPrice)
        });
    }

    // Genera date cedole
    const couponDates = new Array();
    let currentDate = issueDateTime;
    while (currentDate <= saleDateTime) {
        couponDates.push(currentDate);
        currentDate = addMonths(currentDate, 12 / couponFrequency);
    }

    // Genera flussi di cassa per cedole
    const couponCashFlows = couponDates
        .filter(date => date > purchaseDateTime && date <= saleDateTime)
        .flatMap(date => {
            const grossValue = couponAmount * numberOfUnits;
            let taxableAmount = grossValue;
            let description = 'Percezione Cedola (Lordo)';

            // Se è la prima cedola dopo l'acquisto
            if (date === couponDates.find(d => d > purchaseDateTime)) {
                // Per la prima cedola, tassiamo solo la parte non coperta dal rateo
                const daysToNextCoupon = differenceInDays(date, purchaseDateTime);
                const totalDaysInCouponPeriod = differenceInDays(date, lastCouponOrIssueDate);
                taxableAmount = (grossValue * daysToNextCoupon) / totalDaysInCouponPeriod;
                description = `Prima Cedola (${daysToNextCoupon}/${totalDaysInCouponPeriod} giorni)`;
            }

            const taxAmount = taxableAmount * taxRate;
            const base100Value = (grossValue / numberOfUnits) * (100 / unitPrice);

            return [
                {
                    date: format(date, 'dd/MM/yyyy'),
                    description,
                    value: grossValue,
                    base100Value
                },
                {
                    date: format(date, 'dd/MM/yyyy'),
                    description: `Tasse su cedola (${(taxRate * 100).toFixed(1)}%)`,
                    value: -taxAmount,
                    base100Value: -base100Value * (taxableAmount / grossValue) * taxRate
                }
            ];
        });

    cashFlows.push(...couponCashFlows);

    // Calcola il rateo alla vendita
    const lastCouponBeforeSale = getLastCouponDate(saleDateTime, inputs);
    const nextCouponAfterSale = addMonths(lastCouponBeforeSale, 12 / couponFrequency);

    const daysSinceLastCouponSale = differenceInDays(saleDateTime, lastCouponBeforeSale);
    const daysInPeriodSale = differenceInDays(nextCouponAfterSale, lastCouponBeforeSale);
    const accruedInterestAtSale = (couponAmount * daysSinceLastCouponSale) / daysInPeriodSale * numberOfUnits;

    // Gestione vendita/scadenza con rateo
    if (saleCommission > 0) {
        cashFlows.push({
            date: format(saleDateTime, 'dd/MM/yyyy'),
            description: 'Commissioni di vendita',
            value: -saleCommission,
            base100Value: (-saleCommission / numberOfUnits) * (100 / unitPrice)
        });
    }

    const finalUnitPrice = saleOption === 'early' ? saleUnitPrice : 100;
    const finalPayment = numberOfUnits * finalUnitPrice;

    // Rimborso capitale + rateo
    cashFlows.push({
        date: format(saleDateTime, 'dd/MM/yyyy'),
        description: `${saleOption === 'early' ? 'Vendita' : 'Scadenza'} Obbligazione (Capitale)`,
        value: finalPayment,
        base100Value: (finalPayment / numberOfUnits) * (100 / unitPrice)
    });

    if (accruedInterestAtSale > 0) {
        // Rateo cedola alla vendita
        cashFlows.push({
            date: format(saleDateTime, 'dd/MM/yyyy'),
            description: `Rateo cedola alla ${saleOption === 'early' ? 'vendita' : 'scadenza'} (${daysSinceLastCouponSale}/${daysInPeriodSale} giorni)`,
            value: accruedInterestAtSale,
            base100Value: (accruedInterestAtSale / numberOfUnits) * (100 / unitPrice)
        });

        // Tassazione del rateo
        const rateoTax = accruedInterestAtSale * taxRate;
        cashFlows.push({
            date: format(saleDateTime, 'dd/MM/yyyy'),
            description: `Tasse su rateo cedola (${(taxRate * 100).toFixed(1)}%)`,
            value: -rateoTax,
            base100Value: (-rateoTax / numberOfUnits) * (100 / unitPrice)
        });
    }

    // Calcola plusvalenza e relative tasse
    const capitalGain = Math.max(0, (finalUnitPrice - unitPrice) * numberOfUnits);
    const capitalGainTax = capitalGain * taxRate;

    if (capitalGainTax > 0) {
        cashFlows.push({
            date: format(saleDateTime, 'dd/MM/yyyy'),
            description: `Tassa sulla plusvalenza (${(taxRate * 100).toFixed(1)}%)`,
            value: -capitalGainTax,
            base100Value: (-capitalGainTax / numberOfUnits) * (100 / unitPrice)
        });
    }

    const totalCommissions = purchaseCommission + (saleOption === 'early' ? saleCommission : 0);

    // Calcolo TIR
    const xirrCashFlows = cashFlows.map(cf => ({
        date: parse(cf.date, 'dd/MM/yyyy', new Date()),
        value: cf.value
    }));

    // TIR lordo (escludendo le tasse)
    const grossCashFlows = cashFlows
        .filter(cf => !cf.description.includes('Tasse'))
        .map(cf => ({
            date: parse(cf.date, 'dd/MM/yyyy', new Date()),
            value: cf.value
        }));

    const irrGross = calculateXIRR(grossCashFlows);
    const irrNet = calculateXIRR(xirrCashFlows);

    // Calcola rendimenti totali
    const totalNetYield = cashFlows.reduce((sum, flow) => sum + flow.value, 0);
    const totalGrossYield = totalNetYield + cashFlows
        .filter(flow => flow.description.includes('Tasse'))
        .reduce((sum, flow) => sum - flow.value, 0);

    // Calcola rendimenti annuali basati su TIR
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
        finalNetValue: (finalPayment + accruedInterestAtSale - capitalGainTax - (accruedInterestAtSale * taxRate)).toFixed(2),
        totalCommissions: totalCommissions.toFixed(2),
        irrGross: (irrGross * 100).toFixed(2),
        irrNet: (irrNet * 100).toFixed(2)
    };
};