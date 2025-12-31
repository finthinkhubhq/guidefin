
const fs = require('fs');
const path = require('path');

// --- Engine Logic (Mocked for Standalone) ---
const generateGaussian = (mean, stdDev) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const runSimulationAndExport = () => {
    // Inputs (Matches User's Dashboard)
    const currentCorpus = 20000000; // Example: 2 Cr
    const annualWithdrawal = 1200000; // Example: 12L/yr
    const durationYears = 30; // Age 60 to 90
    const equityRatio = 0.6;
    const debtRatio = 0.4;

    const ITERATIONS = 3000;
    let csvContent = "Run_ID,Status,Duration_Years,Ending_Corpus,Avg_Return_Percent,Avg_Inflation_Percent\n";

    console.log(`Running ${ITERATIONS} simulations...`);

    for (let i = 1; i <= ITERATIONS; i++) {
        let balance = currentCorpus;
        let withdrawal = annualWithdrawal;
        let survived = true;
        let failYear = 0;
        let totalReturn = 0;
        let totalInflation = 0;

        for (let year = 1; year <= durationYears; year++) {
            // Generate Rates
            const equityReturn = generateGaussian(0.10, 0.14);
            const debtReturn = generateGaussian(0.06, 0.02);
            const rawInflation = generateGaussian(0.06, 0.015);

            const inflation = clamp(rawInflation, 0.03, 0.10);
            const rawPortfolioReturn = (equityReturn * equityRatio) + (debtReturn * debtRatio);
            const portfolioReturn = clamp(rawPortfolioReturn, -0.25, 0.30);

            // Track Averages
            totalReturn += portfolioReturn;
            totalInflation += inflation;

            // Apply Withdrawal
            balance -= withdrawal;

            if (balance <= 0) {
                survived = false;
                failYear = year;
                break; // Ruin
            }

            // Apply Return
            balance = balance * (1 + portfolioReturn);
            withdrawal = withdrawal * (1 + inflation);
        }

        // Stats for this Run
        const status = survived ? "Success" : "Failed";
        const duration = survived ? durationYears : failYear;
        const avgReturn = ((totalReturn / duration) * 100).toFixed(2);
        const avgInf = ((totalInflation / duration) * 100).toFixed(2);
        const endingCorpus = Math.max(0, balance).toFixed(0);

        csvContent += `${i},${status},${duration},${endingCorpus},${avgReturn}%,${avgInf}%\n`;
    }

    const filePath = path.join(__dirname, 'simulation_results.csv');
    fs.writeFileSync(filePath, csvContent);
    console.log(`Exported 3,000 runs to: ${filePath}`);
};

runSimulationAndExport();
