import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { StorageAccessFramework } = FileSystem as any;
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset'; // Import Asset module
import { RetirementInputs, BaselineResult, StressTestResult } from '../store/useRetirementStore';
import { runStressTest } from './retirementCalculator';

export const generateRetirementReport = async (
    inputs: RetirementInputs,
    baseline: BaselineResult,
    stressTestResult: StressTestResult | null,
    settings: any
) => {

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const formatCurrency = (val: number) => {
        return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
    };

    const formatCr = (val: number) => {
        return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    };

    // Prepare dynamic values
    const resilienceScore = stressTestResult?.successRate || 0;
    const isSafe = resilienceScore >= 85;
    const isModerate = resilienceScore >= 70 && resilienceScore < 85;

    let riskLabel = "High Risk";
    let riskColor = "#D32F2F"; // Red
    if (isSafe) { riskLabel = "Strong"; riskColor = "#388E3C"; } // Green
    else if (isModerate) { riskLabel = "Moderate"; riskColor = "#FBC02D"; } // Yellow

    // Correction: SWR based on Simple Corpus
    const swr = ((baseline.annualExpenseAtRetirement / baseline.simpleCorpus) * 100).toFixed(1);

    // Calculate Basic Resilience Score (for Simple Corpus)
    // We create a temporary inputs/baseline object for the simple corpus simulation
    // Actually, runStressTest needs the baseline result. We can modify the baseline.baselineCorpus temporarily 
    // or better, just pass the simple corpus as the value to test.
    // Looking at runStressTest in retirementCalculator.ts, it uses `baseline.baselineCorpus`.
    // So we can clone the baseline and swap the corpus.
    const simpleBaseline = { ...baseline, baselineCorpus: baseline.simpleCorpus };
    const simpleStressTest = runStressTest(simpleBaseline, inputs);
    const simpleResilienceScore = simpleStressTest.successRate;

    // Load Logo Asset
    let logoBase64 = "";
    try {
        const logoAsset = Asset.fromModule(require('../assets/guidefin_logo_pdf.png'));
        await logoAsset.downloadAsync(); // Ensure it's downloaded/available
        // Read file contents as base64
        const fileContent = await FileSystem.readAsStringAsync(logoAsset.localUri || logoAsset.uri, { encoding: 'base64' });
        logoBase64 = `data:image/png;base64,${fileContent}`;
    } catch (e) {
        console.warn("Error loading logo:", e);
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GuideFin Retirement Report</title>
        <style>
            body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #1F2937; background: #fff; }
            * { box-sizing: border-box; }
            h1, h2, h3, p { margin: 0; }
            
            /* Header */
            .header { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #E5E7EB; padding-bottom: 20px; }
            .logo-img { height: 48px; margin-bottom: 8px; object-fit: contain; } 
            .powered-by { font-size: 9px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .report-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 2px; }
            .user-meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
            
            /* Sections */
            .section { margin-bottom: 24px; page-break-inside: avoid; }
            .section-title { font-size: 12px; font-weight: 700; color: #6B7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            /* Cards */
            .card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .hero-card { background: #EFF6FF; border: 1px solid #BFDBFE; text-align: center; } /* Blue tint for hero */
            .bg-gray { background: #F9FAFB; }
            
            /* Grids */
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; row-gap: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            /* Typography */
            .label { font-size: 10px; color: #6B7280; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
            .value { font-size: 16px; font-weight: 700; color: #111827; }
            .value-large { font-size: 28px; font-weight: 800; color: #1E40AF; letter-spacing: -0.5px; }
            .sub-value { font-size: 11px; color: #6B7280; margin-top: 2px; line-height: 1.4; }
            
            /* Executive Summary Specifics */
            .exec-summary-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; text-align: left; }
            .gauge-wrapper { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
            .gauge-circle { width: 100%; height: 100%; border-radius: 50%; border: 8px solid #fff; box-shadow: 0 0 0 1px #DBEAFE; display: flex; align-items: center; justify-content: center; background: #fff; }
            .gauge-value { font-size: 20px; font-weight: 800; color: ${riskColor}; }
            .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 8px; background: #fff; border: 1px solid #E5E7EB; }
            
            /* Graph */
            .graph-container { display: flex; flex-direction: column; align-items: center; margin-top: 10px; }
            .bar-chart { display: flex; align-items: flex-end; gap: 60px; height: 120px; padding-bottom: 0; margin-top: 25px; border-bottom: 1px solid #E5E7EB; width: 100%; justify-content: center; }
            .bar-group { display: flex; flex-direction: column; align-items: center; width: 50px; position: relative; }
            .bar { width: 100%; background: #93C5FD; border-radius: 4px 4px 0 0; }
            .bar.highlight { background: #1E40AF; }
            .bar-label { margin-top: 8px; font-size: 10px; font-weight: 600; color: #4B5563; }
            .bar-value { position: absolute; bottom: 100%; width: 120px; text-align: center; font-size: 11px; font-weight: 700; padding-bottom: 6px; color: #1F2937; }
            
            /* Footer */
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9CA3AF; padding-top: 12px; border-top: 1px solid #F3F4F6; }
            
            .text-success { color: #059669; }
            .text-danger { color: #DC2626; }
        </style>
    </head>
    <body>
        <div class="header">
            ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" />` : '<div style="font-size:24px; color:#1E40AF; font-weight:800; margin-bottom:8px;">GuideFin<span>.</span></div>'}
            <div class="powered-by">Powered by finthinkhub</div>
            <div class="report-title">Retirement Readiness Report</div>
            <div class="user-meta">Prepared for <b>${settings.name || 'User'}</b> | ${currentDate}</div>
        </div>

        <!-- 1. Executive Summary (Recommended Corpus) -->
        <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="card hero-card">
                <div class="exec-summary-row">
                    <div style="flex: 1;">
                        <div class="label" style="color: #1E40AF;">Recommended Corpus</div>
                        <div class="value-large">${formatCr(baseline.baselineCorpus)}</div>
                        <div class="sub-value" style="margin-top: 8px;">
                            This <b>High Resilience Plan</b> is designed to survive <b>${resilienceScore.toFixed(0)}%</b> of market scenarios (3,000 simulations), including extreme market crashes and high inflation periods.
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div class="gauge-wrapper">
                            <div class="gauge-circle" style="border-color: ${riskColor};">
                                <span class="gauge-value">${resilienceScore.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div class="status-badge" style="color: ${riskColor}; border-color: ${riskColor}40;">${riskLabel} Plan</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. Profile Summary -->
        <div class="section">
            <div class="section-title">Profile Summary</div>
            <div class="card bg-gray" style="padding: 16px;">
                <div class="grid-3">
                    <div>
                        <div class="label">Current Age</div>
                        <div class="value">${inputs.currentAge} Years</div>
                    </div>
                    <div>
                        <div class="label">Annual Expense</div>
                        <div class="value">${formatCurrency(inputs.monthlyExpense * 12)}</div>
                    </div>
                    <div>
                        <div class="label">Retirement Age</div>
                        <div class="value">${inputs.retirementAge} Years</div>
                    </div>
                    <div>
                        <div class="label">Life Expectancy</div>
                        <div class="value">${inputs.lifeExpectancy} Years</div>
                    </div>
                    <div>
                        <div class="label">Inflation Rate</div>
                        <div class="value">${(inputs.inflationRate * 100).toFixed(1)}%</div>
                    </div>
                     <div>
                        <div class="label">Future Expense</div>
                         <div class="value" style="color: #1E40AF;">${formatCurrency(baseline.annualExpenseAtRetirement)}</div>
                        <div class="sub-value">At age ${inputs.retirementAge}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. Lifestyle Cost Over Time -->
        <div class="section">
            <div class="section-title">Lifestyle Cost Impact</div>
            <div class="card">
                <div class="graph-container">
                    <div style="font-size: 11px; color: #6B7280; text-align:center;">
                        To maintain your current lifestyle, you will need <b>${formatCurrency(baseline.annualExpenseAtRetirement)}/yr</b> at retirement due to inflation.
                    </div>
                    <div class="bar-chart">
                        <div class="bar-group">
                            <div class="bar-value">${formatCurrency(inputs.monthlyExpense * 12)}</div>
                            <div class="bar" style="height: 40px; background: #9CA3AF;"></div> <!-- Grey for current -->
                            <div class="bar-label">Today</div>
                        </div>
                        <div class="bar-group">
                            <div class="bar-value" style="color: #1E40AF;">${formatCurrency(baseline.annualExpenseAtRetirement)}</div>
                            <div class="bar highlight" style="height: 100px;"></div>
                            <div class="bar-label">Age ${inputs.retirementAge}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. Minimum Requirement (Comparison) -->
        <div class="section">
            <div class="section-title">Minimum vs Recommended</div>
            <div class="card bg-gray">
                <div class="grid-2">
                    <div>
                        <div class="label">Minimum Corpus Needed</div>
                        <div class="value">${formatCr(baseline.simpleCorpus)}</div>
                        <p class="sub-value">Assumes stable returns (Risky).</p>
                        <div class="status-badge" style="margin-top:6px; color: #DC2626; border-color: #FECACA;">${simpleResilienceScore.toFixed(0)}% Success Probability</div>
                    </div>
                    <div style="border-left: 1px solid #E5E7EB; padding-left: 20px;">
                        <div class="label">Safe Withdrawal Rate</div>
                        <div class="value">${swr}%</div>
                        <div class="sub-value" style="color: ${Number(swr) > 4 ? '#DC2626' : '#059669'}; font-weight: 600;">
                            ${Number(swr) > 4 ? 'Aggressive (>4%)' : 'Sustainable (<4%)'}
                        </div>
                         <p class="sub-value">Higher withdrawal rates deplete capital faster in bad markets.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 5. Stress Test Result (Explanation) -->
        <div class="section">
            <div class="section-title">Why the Higher Corpus?</div>
            <div style="font-size: 11px; color: #4B5563; line-height: 1.6; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">
                <p style="margin-bottom: 8px;">
                    <b>Market Reality:</b> Financial markets are volatile. A retirement plan based on average returns (the "Minimum" plan) fails in nearly ${100 - Number(simpleResilienceScore.toFixed(0))}% of historical scenarios.
                </p>
                <p>
                    <b>The GuideFin Advantage:</b> The recommended <b>${formatCr(baseline.baselineCorpus)}</b> corpus acts as a safety shield. It creates a buffer that ensures your income continues even if the market crashes right after you retire (Sequence of Returns Risk). This increases your plan's reliability to <b>${resilienceScore.toFixed(0)}%</b>.
                </p>
            </div>
        </div>

        <div class="footer">
            Generated by GuideFin • Detailed financial simulation engine • Not investment advice
        </div>
    </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        console.log("PDF Generated Internal Path:", uri);

        // Construct filename
        const safeName = (settings.name || 'User').replace(/[^a-zA-Z0-9]/g, '');
        const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const fileName = `GuideFin_Retirement_Report_${safeName}_${dateStr}_${randomNum}.pdf`;

        if (Platform.OS === 'android') {
            // Android: Use Sharing.shareAsync which enables "Open with", "Share to", "Save to" etc.
            // This is cleaner and less error-prone than the manual StorageAccessFramework flow
            // and allows the user to decide how they want to handle the file (view it or share it).
            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Share or Open Report`
            });
        } else {
            // iOS: Rename and Share
            const newUri = (FileSystem as any).documentDirectory + fileName;
            await FileSystem.moveAsync({ from: uri, to: newUri });
            await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
