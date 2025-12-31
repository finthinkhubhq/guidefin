/**
 * Monte Carlo Simulation Engine for FinCal
 * 
 * Purpose:
 * Simulate 1000+ market scenarios to determine the probability of a retirement portfolio surviving
 * for a specific duration.
 * 
 * Assumptions (Indian Context - User Modified):
 * - Equity: Mean 10%, StdDev 14%
 * - Debt: Mean 6%, StdDev 2%
 * - Inflation: Mean 6%, StdDev 1.5% (Clamped 3%-10%)
 */

export interface SimulationInputs {
    currentCorpus: number;
    annualWithdrawal: number;
    durationYears: number;
    equityRatio?: number; // Default 0.6 (60%)
}

export interface SimulationResult {
    successRate: number; // 0-100
    medianDuration: number; // median duration in years (NOT age)
    worstCaseDuration: number; // 10th percentile duration
    medianLegacy: number; // Median remaining corpus
    simulationCount: number;
}

// Box-Muller transform for generating normal distribution
const generateGaussian = (mean: number, stdDev: number): number => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
};

// Start Helper: Clamp
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const runMonteCarloSimulation = (inputs: SimulationInputs): SimulationResult => {
    const {
        currentCorpus,
        annualWithdrawal,
        durationYears,
        equityRatio = 0.6,
    } = inputs;

    const ITERATIONS = 3000;
    const debtRatio = 1 - equityRatio;

    let successCount = 0;
    const durations: number[] = [];
    const legacies: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
        let balance = currentCorpus;
        let currentwithdrawal = annualWithdrawal;
        let year = 0;
        let survived = true;

        for (year = 1; year <= durationYears; year++) {
            // 1. Generate Rates (Updated to User's Preferences)
            const equityReturn = generateGaussian(0.10, 0.14); // 10% Mean, 14% Volatility
            const debtReturn = generateGaussian(0.06, 0.02);   // 6% Mean, 2% Volatility

            const rawInflation = generateGaussian(0.06, 0.015);
            const inflation = clamp(rawInflation, 0.03, 0.10); // Clamped Inflation

            // 2. Portfolio Return (Clamped as requested)
            const rawPortfolioReturn = (equityReturn * equityRatio) + (debtReturn * debtRatio);
            const portfolioReturn = clamp(rawPortfolioReturn, -0.25, 0.30); // Max +30%, Min -25%

            // 3. Apply Withdrawal (Start of Year - Conservative)
            balance -= currentwithdrawal;

            if (balance <= 0) {
                survived = false;
                durations.push(year);
                legacies.push(0);
                break;
            }

            // 4. Apply Return
            balance = balance * (1 + portfolioReturn);

            // 5. Update Withdrawal for next year
            currentwithdrawal = currentwithdrawal * (1 + inflation);
        }

        if (survived) {
            successCount++;
            durations.push(durationYears);
            legacies.push(balance);
        }
    }

    // Calculate Statistics
    const successRate = (successCount / ITERATIONS) * 100;

    // Sort for percentiles
    durations.sort((a, b) => a - b);
    legacies.sort((a, b) => a - b);

    const medianEndAge = durations[Math.floor(ITERATIONS * 0.5)];
    const worstCaseDuration = durations[Math.floor(ITERATIONS * 0.1)]; // 10th percentile
    const medianLegacy = legacies[Math.floor(ITERATIONS * 0.5)];

    return {
        successRate,
        medianDuration: medianEndAge,
        worstCaseDuration,
        medianLegacy,
        simulationCount: ITERATIONS,
    };
};

export interface RequiredCorpusInputs {
    annualWithdrawal: number;
    durationYears: number;
    equityRatio?: number;
    targetSuccessRate: number; // e.g. 85, 90, 95
}

/**
 * Reverse Monte Carlo:
 * Finds the corpus required to achieve a specific success rate using Binary Search.
 */
export const findRequiredCorpus = (inputs: RequiredCorpusInputs): number => {
    const {
        annualWithdrawal,
        durationYears,
        equityRatio = 0.6,
        targetSuccessRate
    } = inputs;

    // Bounds for Binary Search
    // Lower bound: 0 (impossible) - 10x Annual (unsafe)
    // Upper bound: 100x Annual (very safe)
    let low = annualWithdrawal * 10;
    let high = annualWithdrawal * 100;
    let iterations = 0;
    let foundCorpus = high;

    // Tolerance
    const tolerance = 0.5; // Within 0.5% success rate
    const maxIterations = 20; // Limit binary search steps

    while (iterations < maxIterations) {
        const mid = (low + high) / 2;

        // Run Sim
        const result = runMonteCarloSimulation({
            currentCorpus: mid,
            annualWithdrawal,
            durationYears,
            equityRatio
        });

        // Check result
        if (Math.abs(result.successRate - targetSuccessRate) <= tolerance) {
            return mid;
        }

        if (result.successRate < targetSuccessRate) {
            low = mid; // Need more money
        } else {
            high = mid; // Can do with less
            foundCorpus = mid; // Keep track of last good value
        }
        iterations++;
    }

    return foundCorpus;
};
