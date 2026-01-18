import { addMonths, format, parse } from "date-fns";
import type { CashFlow, DepositInputs } from "./deposit";

export const calculateDepositYield = (inputs: DepositInputs) => {
    const {
        depositAmount,
        startDate,
        interestRate,
        interestFrequency,
        depositDuration,
        reinvestInterest
    } = inputs;

    const taxRate = 0.26;
    const startDateTime = parse(startDate, 'yyyy-MM-dd', new Date());

    // Initialize cash flows with initial deposit
    const cashFlows: CashFlow[] = [{
        date: format(startDateTime, 'dd/MM/yyyy'),
        description: 'Deposito iniziale',
        value: depositAmount,
        balance: depositAmount
    }];

    let currentBalance = depositAmount;
    let totalGrossInterest = 0;
    let periodInterestRate = interestRate / 100 / interestFrequency;

    // Calculate interest payments
    for (let month = 1; month <= depositDuration; month++) {
        if (month % (12 / interestFrequency) === 0) {
            const interestDate = addMonths(startDateTime, month);
            let interest = currentBalance * periodInterestRate;
            const tax = interest * taxRate;
            totalGrossInterest += interest;

            // Add gross interest to cash flows
            cashFlows.push({
                date: format(interestDate, 'dd/MM/yyyy'),
                description: 'Interessi lordi',
                value: interest,
                balance: currentBalance + interest
            });

            // Add tax deduction
            cashFlows.push({
                date: format(interestDate, 'dd/MM/yyyy'),
                description: 'Tasse sugli interessi (26%)',
                value: -tax,
                balance: currentBalance + interest - tax
            });

            if (reinvestInterest) {
                currentBalance += (interest - tax);
            }
        }
    }

    // Calculate final withdrawal
    const endDate = addMonths(startDateTime, depositDuration);
    cashFlows.push({
        date: format(endDate, 'dd/MM/yyyy'),
        description: 'Prelievo capitale finale',
        value: -currentBalance,
        balance: 0
    });

    const totalNetInterest = totalGrossInterest * (1 - taxRate);
    const totalTax = totalGrossInterest * taxRate;
    const finalCapital = depositAmount + totalNetInterest;

    // Calculate effective annual yield
    const yearsInvested = depositDuration / 12;
    const effectiveGrossYield = (Math.pow(1 + totalGrossInterest / depositAmount, 1 / yearsInvested) - 1) * 100;
    const effectiveNetYield = (Math.pow(1 + totalNetInterest / depositAmount, 1 / yearsInvested) - 1) * 100;

    return {
        initialCapital: depositAmount.toFixed(2),
        totalGrossInterest: totalGrossInterest.toFixed(2),
        totalNetInterest: totalNetInterest.toFixed(2),
        totalTax: totalTax.toFixed(2),
        finalCapital: finalCapital.toFixed(2),
        effectiveGrossYield: effectiveGrossYield.toFixed(2),
        effectiveNetYield: effectiveNetYield.toFixed(2),
        cashFlows
    };
};