
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RetirementInputs, BaselineResult, StressTestResult } from '../store/useRetirementStore';

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

    const swr = ((baseline.annualExpenseAtRetirement / baseline.simpleCorpus) * 100).toFixed(1);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Retirement Report</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #263238; background: #fff; }
            h1, h2, h3 { margin: 0; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ECEFF1; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #1565C0; letter-spacing: -1px; margin-bottom: 8px; }
            .logo span { color: #fbc02d; }
            .subtitle { font-size: 14px; color: #90A4AE; text-transform: uppercase; letter-spacing: 1px; }
            
            .section { margin-bottom: 30px; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: 700; color: #546E7A; margin-bottom: 12px; border-left: 4px solid #1565C0; padding-left: 12px; }
            
            .card { background: #FAFAFA; border: 1px solid #ECEFF1; border-radius: 12px; padding: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            
            .label { font-size: 11px; color: #90A4AE; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
            .value { font-size: 16px; font-weight: 700; color: #263238; }
            
            /* Expense Chart */
            .bar-chart { display: flex; align-items: flex-end; gap: 24px; margin-top: 20px; height: 120px; padding-bottom: 10px; border-bottom: 1px solid #CFD8DC; }
            .bar-group { display: flex; flex-direction: column; align-items: center; width: 80px; }
            .bar { width: 40px; background: #90CAF9; border-radius: 4px 4px 0 0; transition: height 0.3s; }
            .bar.highlight { background: #1565C0; }
            
            /* Gauge */
            .gauge-container { text-align: center; margin-top: 20px; }
            .score-circle { width: 120px; height: 120px; border-radius: 50%; border: 10px solid #ECEFF1; margin: 0 auto; display: flex; align-items: center; justifyContent: center; position: relative; }
            .score-value { font-size: 32px; font-weight: 800; color: ${riskColor}; text-align: center; display: block; line-height: 120px; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #B0BEC5; border-top: 1px solid #ECEFF1; padding-top: 20px; }
            
            .highlight-box { background: #E3F2FD; color: #1565C0; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 12px; }

            .user-meta { font-size: 12px; color: #78909C; margin-top: 8px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">GuideFin<span>.</span></div>
            <h1>Retirement Readiness Report</h1>
            <div class="subtitle">Built using real market simulations</div>
            <div class="user-meta">Generated for <b>${settings.name || 'User'}</b> (Age ${inputs.currentAge}) on ${currentDate}</div>
        </div>

        <div class="section">
            <div class="section-title">Profile Summary</div>
            <div class="card">
                <div class="grid">
                    <div>
                        <div class="label">Current Annual Expense</div>
                        <div class="value">${formatCurrency(inputs.monthlyExpense * 12)}</div>
                    </div>
                    <div>
                        <div class="label">Assumed Inflation</div>
                        <div class="value">${(inputs.inflationRate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                        <div class="label">Retirement Age</div>
                        <div class="value">${inputs.retirementAge} Years</div>
                    </div>
                    <div>
                        <div class="label">Life Expectancy</div>
                        <div class="value">${inputs.lifeExpectancy} Years</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Lifestyle Cost Over Time</div>
            <div class="card">
                <p style="font-size: 12px; color: #78909C;">How inflation impacts your purchasing power by retirement:</p>
                <div class="bar-chart">
                    <div class="bar-group">
                        <div class="value" style="font-size: 12px; margin-bottom: 4px;">${formatCurrency(inputs.monthlyExpense * 12)}</div>
                        <div class="bar" style="height: 40px;"></div>
                        <div class="label" style="margin-top: 8px;">Today</div>
                    </div>
                    <div class="bar-group">
                        <div class="value" style="font-size: 12px; margin-bottom: 4px; color: #1565C0;">${formatCurrency(baseline.annualExpenseAtRetirement)}</div>
                        <div class="bar highlight" style="height: 100px;"></div>
                        <div class="label" style="margin-top: 8px;">At Age ${inputs.retirementAge}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Investment Requirements</div>
            <div class="card">
                <div class="grid">
                    <div>
                        <div class="label">Minimum Corpus Needed</div>
                        <div class="value">${formatCr(baseline.simpleCorpus)}</div>
                        <div style="font-size: 10px; color: #90A4AE; margin-top: 2px;">Assuming straight-line returns</div>
                    </div>
                    <div>
                        <div class="label">Safe Withdrawal Rate</div>
                        <div class="value">${swr}%</div>
                        <div style="font-size: 10px; color: ${Number(swr) > 4 ? '#ef5350' : '#66BB6A'}; margin-top: 2px;">
                            ${Number(swr) > 4 ? 'Aggressive (Risky)' : 'Sustainable (Safe)'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Market Stress Test Result</div>
            <div class="card" style="text-align: center;">
                <div class="label">Recommended High Resilience Corpus</div>
                <div class="value" style="font-size: 24px; color: #1565C0; margin-bottom: 12px;">${formatCr(baseline.baselineCorpus)}</div>
                
                <div class="gauge-container">
                    <div class="score-circle" style="border-color: ${riskColor}20;">
                         <span class="score-value">${resilienceScore}%</span>
                    </div>
                    <div style="margin-top: 8px; font-weight: 700; color: ${riskColor}; text-transform: uppercase; font-size: 12px;">${riskLabel} Resilience</div>
                </div>

                <div class="highlight-box">
                    This plan was tested against <b>3,000 market scenarios</b> (including crashes like 2008 & 2020) and survived in ${resilienceScore}% of them.
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">What This Means For You</div>
            <div style="font-size: 12px; color: #37474F; line-height: 1.6;">
                <ul>
                    <li><b>Inflation is the silent killer:</b> Your lifestyle cost increases significantly by the time you retire.</li>
                    <li><b>Volatility matters:</b> Just saving the minimum isn't enough. You need a buffer to handle bad market years.</li>
                    <li><b>Recommendation:</b> Aim for the High Resilience Corpus (${formatCr(baseline.baselineCorpus)}) to ensure you don't outlive your money.</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Generated by GuideFin App. Not investment advice. Projections based on historical market data.</p>
        </div>
    </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        // Construct filename: Name_Age_DDMMYY_Random
        const safeName = (settings.name || 'User').replace(/[^a-zA-Z0-9]/g, '');
        const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const fileName = `${safeName}_${inputs.currentAge}_${dateStr}_${randomNum}.pdf`;

        const newUri = FileSystem.documentDirectory + fileName;

        await FileSystem.moveAsync({
            from: uri,
            to: newUri
        });

        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
