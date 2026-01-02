import { RetirementInputs, BaselineResult, StressTestResult } from '../store/useRetirementStore';
import { findRequiredCorpus, runMonteCarloSimulation } from '../utils/monteCarloEngine';

/**
 * Calculates a simple retirement corpus using a rule of thumb (e.g., Rule of 25)
 * adjusted for inflation.
 */
export function calculateSimpleRetirement(inputs: RetirementInputs): number {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    // FV of monthly expense
    const monthlyExpenseAtRetirement = inputs.monthlyExpense * Math.pow(1 + inputs.inflationRate, yearsToRetirement);
    const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;

    // Dynamic Multiplier based on duration
    // < 30 years: Rule of 25
    // 30-40 years: Rule of 30
    // > 40 years: Rule of 33
    let multiplier = 25;
    if (yearsInRetirement > 40) multiplier = 33;
    else if (yearsInRetirement > 30) multiplier = 30;

    return annualExpenseAtRetirement * multiplier;
}

/**
 * Calculates the baseline retirement corpus needed for a target success rate.
 */
export function calculateBaseline(inputs: RetirementInputs): BaselineResult {
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;

    // Calculate annual expense at retirement (FV of current expense)
    const annualExpenseAtRetirement =
        inputs.monthlyExpense * 12 *
        Math.pow(1 + inputs.inflationRate, inputs.retirementAge - inputs.currentAge);

    // Find corpus needed for 85% success rate
    const baselineCorpus = findRequiredCorpus({
        annualWithdrawal: annualExpenseAtRetirement,
        durationYears: yearsInRetirement,
        equityRatio: inputs.equityRatio,
        targetSuccessRate: 85,
    });

    const simpleCorpus = calculateSimpleRetirement(inputs);

    return {
        annualExpenseAtRetirement,
        baselineCorpus,
        simpleCorpus,
        realReturn: 0.085 - inputs.inflationRate, // Assuming 8.5% nominal return
    };
}

/**
 * Runs a stress test simulation on the calculated baseline corpus.
 */
export function runStressTest(baseline: BaselineResult, inputs: RetirementInputs): StressTestResult {
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;

    return runMonteCarloSimulation({
        currentCorpus: baseline.baselineCorpus,
        annualWithdrawal: baseline.annualExpenseAtRetirement,
        durationYears: yearsInRetirement,
        equityRatio: inputs.equityRatio,
    });
}
