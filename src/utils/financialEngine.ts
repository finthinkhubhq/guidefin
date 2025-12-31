/**
 * generic financial calculation engine for GuideFin
 * 
 * OBJECTIVE:
 * Create a reusable backend logic module that calculates:
 * 1) Future expense value
 * 2) Retirement corpus using real-return (inflation-adjusted) method
 */

export interface FinancialInputs {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    currentMonthlyExpense: number;
    inflationRate: number; // decimal (e.g. 0.06 for 6%)
    postRetirementReturn: number; // decimal (e.g. 0.085 for 8.5%)
    safetyBufferPercent: number; // decimal (e.g. 0.10 for 10%)
}

export interface FinancialOutput {
    inputs: FinancialInputs;
    expenses: {
        currentAnnualExpense: number;
        expenseAtRetirementAnnual: number;
        expenseAtRetirementMonthly: number;
    };
    returns: {
        inflationRate: number;
        postRetirementReturn: number;
        realReturn: number;
    };
    corpus: {
        baseCorpus: number;
        bufferedCorpus: number;
        bufferPercent: number;
    };
    disclaimer: string;
}

/**
 * Calculates retirement corpus using real-return method
 */
export const calculateRetirementCorpus = (inputs: FinancialInputs): FinancialOutput => {
    const {
        currentAge,
        retirementAge,
        lifeExpectancy,
        currentMonthlyExpense,
        inflationRate,
        postRetirementReturn,
        safetyBufferPercent,
    } = inputs;

    // DERIVED VARIABLES
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const retirementDuration = Math.max(0, lifeExpectancy - retirementAge);
    const currentAnnualExpense = currentMonthlyExpense * 12;

    // CALCULATION LOGIC

    // 1) Future Annual Expense at Retirement
    const expenseAtRetirementAnnual = currentAnnualExpense * Math.pow(1 + inflationRate, yearsToRetirement);
    const expenseAtRetirementMonthly = expenseAtRetirementAnnual / 12;

    // 2) Real Rate of Return
    // Formula: ((1 + postRetirementReturn) / (1 + inflationRate)) - 1
    const realReturn = ((1 + postRetirementReturn) / (1 + inflationRate)) - 1;

    // 3) Retirement Corpus (Real Return Annuity Formula)
    // Corpus = Expense * (1 - (1 + realReturn) ^ -retirementDuration) / realReturn
    let baseCorpus = 0;
    if (realReturn === 0) {
        // Edge case: if real return is exactly 0, corpus is just expense * duration
        baseCorpus = expenseAtRetirementAnnual * retirementDuration;
    } else {
        baseCorpus = expenseAtRetirementAnnual * (1 - Math.pow(1 + realReturn, -retirementDuration)) / realReturn;
    }

    // 4) Safety Buffer Application
    const bufferedCorpus = baseCorpus * (1 + safetyBufferPercent);

    // OUTPUT OBJECT
    return {
        inputs: { ...inputs },
        expenses: {
            currentAnnualExpense,
            expenseAtRetirementAnnual,
            expenseAtRetirementMonthly,
        },
        returns: {
            inflationRate,
            postRetirementReturn,
            realReturn,
        },
        corpus: {
            baseCorpus,
            bufferedCorpus,
            bufferPercent: safetyBufferPercent,
        },
        disclaimer: "Results are based on assumptions and historical averages. Actual outcomes may vary.",
    };
};
