import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRetirementStore, BaselineResult } from '../store/useRetirementStore';
import { useSettingsStore, useExpensesStore } from '../store/atoms';
import { calculateBaseline, runStressTest } from '../services/retirementCalculator';
import { runMonteCarloSimulation } from '../utils/monteCarloEngine';
import WizardHeader from '../components/WizardHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RetirementBaselineScreen() {
    const router = useRouter();
    const { inputs, baseline, setInputs, setBaselineResult, setStressTestResult } = useRetirementStore();
    const { settings } = useSettingsStore();
    const { expenses } = useExpensesStore();

    const [resilienceScore, setResilienceScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Auto-Calculate Baseline if missing or stale (Self-Healing)
    useEffect(() => {
        const initScreen = async () => {
            setLoading(true);

            // Re-construct inputs from global settings
            const freshInputs = {
                currentAge: settings.currentAge || 30,
                retirementAge: settings.retirementAge || 60,
                lifeExpectancy: settings.lifeExpectancy || 85,
                monthlyExpense: expenses.reduce((sum, item) => sum + item.monthly, 0) || 50000,
                inflationRate: (settings.inflation || 6) / 100,
                equityRatio: 0.6,
            };

            // Calculate Baseline (Minimum)
            const freshBaseline = calculateBaseline(freshInputs);
            setInputs(freshInputs);
            setBaselineResult(freshBaseline);

            // 2. Run Stress Test on MINIMUM Corpus (3000 simulations)
            // We want to see if this "Simple Rule" actually works
            const yearsInRetirement = freshInputs.lifeExpectancy - freshInputs.retirementAge;

            // Artificial delay for effect
            await new Promise(r => setTimeout(r, 800));

            const simResult = runMonteCarloSimulation({
                currentCorpus: freshBaseline.simpleCorpus,
                annualWithdrawal: freshBaseline.annualExpenseAtRetirement,
                durationYears: yearsInRetirement,
                equityRatio: freshInputs.equityRatio,
            });

            setResilienceScore(simResult.successRate);
            setLoading(false);
        };

        initScreen();
    }, [settings, expenses]);

    const handleSeeDetailedPlan = () => {
        if (baseline && inputs) {
            // Run the optimization for the next screen
            // The next screen (StressTest) usually re-runs it or we pass it
            const optimizedResult = runStressTest(baseline, inputs);
            setStressTestResult(optimizedResult);
            router.push('/calculator/stress');
        }
    };

    const formatCurrencyCr = (val: number) => `₹ ${(val / 10000000).toFixed(2)} Cr`;
    const formatCurrencyLakh = (val: number) => `₹ ${(val / 100000).toFixed(1)} L`;

    if (loading || !baseline) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 16, color: '#546E7A' }}>Analyzing Market Scenarios...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header hidden or modified as we are skipping input? Keeping WizardHeader for context. */}
            <WizardHeader currentStep="BASELINE" />

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                <View style={styles.headerSection}>
                    <Text style={styles.title}>Your Retirement Safety Check</Text>
                    <Text style={styles.subtitle}>We tested your plan against market ups and downs to see how resilient it is.</Text>
                </View>

                {/* Lifestyle Cost Insight Card */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>How your lifestyle cost changes over time</Text>

                    <View style={styles.insightRow}>
                        <View>
                            <Text style={styles.insightLabel}>Today (Age {inputs?.currentAge})</Text>
                            <Text style={styles.insightValue}>{formatCurrencyLakh((inputs?.monthlyExpense || 0) * 12)} / year</Text>
                        </View>

                        <View style={styles.insightArrow}>
                            <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#B0BEC5" />
                        </View>

                        <View>
                            <Text style={styles.insightLabel}>At Retirement (Age {inputs?.retirementAge})</Text>
                            <Text style={styles.insightValueHighlight}>{formatCurrencyLakh(baseline.annualExpenseAtRetirement)} / year</Text>
                        </View>
                    </View>
                    <Text style={styles.insightHelper}>Calculated assuming the same lifestyle, adjusted only for inflation.</Text>
                </View>

                {/* Main Result Card */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroValue}>{formatCurrencyCr(baseline.simpleCorpus)}</Text>
                    <Text style={styles.heroLabel}>MINIMUM ESTIMATE</Text>

                    <View style={styles.swrBadge}>
                        <Text style={styles.swrText}>Safe Withdrawal Rate: 4.0%</Text>
                    </View>

                    {/* Resilience Score Section */}
                    <View style={styles.resilienceContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.resilienceTitle}>MARKET RESILIENCE SCORE</Text>
                        <View style={styles.scoreRow}>
                            <MaterialCommunityIcons
                                name={resilienceScore! > 80 ? "shield-check" : "shield-alert"}
                                size={24}
                                color={resilienceScore! > 80 ? "#4CAF50" : "#FF5252"}
                            />
                            <Text style={[styles.scoreValue, { color: resilienceScore! > 80 ? "#4CAF50" : "#FF5252" }]}>
                                {resilienceScore?.toFixed(0)}%
                            </Text>
                        </View>
                        <Text style={styles.resilienceDesc}>
                            {resilienceScore! < 90
                                ? "This amount has a high chance of running out during market crashes."
                                : "This amount is very safe against market crashes."}
                        </Text>
                    </View>
                </View>

                {/* Secondary Cards */}
                <View style={styles.grid}>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>At Retirement</Text>
                        <Text style={styles.cardValueHighlight}>{formatCurrencyLakh(baseline.annualExpenseAtRetirement)} /yr</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Inflation Impact</Text>
                        <Text style={styles.cardValueHighlight}>{(inputs?.inflationRate ? inputs.inflationRate * 100 : 6).toFixed(1)}% /yr</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handleSeeDetailedPlan} style={styles.button}>
                        <Text style={styles.buttonText}>See High Resilience Plan</Text>
                        <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <Text style={styles.buttonSubtext}>Get &gt;90% Success Probability</Text>
                    <Text style={styles.helperText}>
                        Calculated using 3,000 market simulations
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    contentContainer: { padding: 20 },

    headerSection: { marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '800', color: '#263238', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#546E7A', lineHeight: 20 },

    heroCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4 },
    heroValue: { fontSize: 40, fontWeight: '800', color: '#1B5E20', marginBottom: 4 },
    heroLabel: { fontSize: 11, fontWeight: '700', color: '#90A4AE', letterSpacing: 1, textTransform: 'uppercase' },

    swrBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
    swrText: { fontSize: 11, color: '#2E7D32', fontWeight: '700' },

    resilienceContainer: { width: '100%', alignItems: 'center', marginTop: 16 },
    divider: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 16 },
    resilienceTitle: { fontSize: 10, fontWeight: '700', color: '#78909C', marginBottom: 8, letterSpacing: 0.5 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    scoreValue: { fontSize: 24, fontWeight: '800' },
    resilienceDesc: { fontSize: 13, color: '#546E7A', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 16 },

    grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    card: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ECEFF1', alignItems: 'center' },

    cardLabel: { fontSize: 11, color: '#90A4AE', marginBottom: 4 },
    cardValue: { fontSize: 15, fontWeight: '600', color: '#546E7A' },
    cardValueHighlight: { fontSize: 16, fontWeight: '700', color: '#263238' },

    footer: { marginTop: 8, alignItems: 'center' },
    button: { flexDirection: 'row', backgroundColor: '#2196F3', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2196F3', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4, width: '100%' },
    buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    buttonSubtext: { fontSize: 11, color: '#1976D2', marginTop: 8, fontWeight: '600', textAlign: 'center' },
    helperText: { textAlign: 'center', marginTop: 4, fontSize: 12, color: '#90A4AE', lineHeight: 18 },

    insightCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ECEFF1' },
    insightTitle: { fontSize: 11, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
    insightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    insightArrow: { paddingHorizontal: 8 },
    insightLabel: { fontSize: 12, color: '#546E7A', marginBottom: 4 },
    insightValue: { fontSize: 16, fontWeight: '700', color: '#263238' },
    insightValueHighlight: { fontSize: 16, fontWeight: '700', color: '#E65100' },
    insightHelper: { fontSize: 11, color: '#B0BEC5', fontStyle: 'italic' },
});
