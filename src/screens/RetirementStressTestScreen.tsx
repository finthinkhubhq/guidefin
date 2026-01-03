import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRetirementStore } from '../store/useRetirementStore';
import { useSettingsStore, useExpensesStore } from '../store/atoms';
import { runStressTest } from '../services/retirementCalculator';
import WizardHeader from '../components/WizardHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { generateRetirementReport } from '../services/pdfGenerator';

export default function RetirementStressTestScreen() {
    const { stressTest, baseline, inputs, setStressTestResult, resetRetirementPlan } = useRetirementStore();
    const [isStressTestRunning, setIsStressTestRunning] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const router = useRouter();
    const { setSettings, settings } = useSettingsStore();
    const { resetExpenses } = useExpensesStore(); // Import resetExpenses

    const handleHome = () => {
        // user expectation: clear all existing records (fresh start).
        resetRetirementPlan(); // clears results
        resetExpenses(); // clears expenses

        // Reset settings completely
        setSettings({
            name: '',
            currentAge: 0, // Default to 0 for empty field
            retirementAge: 60,
            lifeExpectancy: 90,
            inflation: 6,
        });
        router.push('/auth/signin');
    };



    if (!baseline || !inputs) return <Text style={{ padding: 20 }}>Loading...</Text>;

    const handleRunStressTest = () => {
        setIsStressTestRunning(true);
        // Simulate delay for "Calculation" feel
        setTimeout(() => {
            const result = runStressTest(baseline, inputs);
            setStressTestResult(result);
            setIsStressTestRunning(false);
            setShowResults(true);
        }, 1500);
    };

    const handleDownloadReport = async () => {
        setIsStressTestRunning(true);
        try {
            await generateRetirementReport(inputs!, baseline!, stressTest && stressTest.successRate ? stressTest : null, settings);
        } catch (e) {
            console.error(e);
        } finally {
            setIsStressTestRunning(false);
        }
    };

    const formatCurrencyCr = (val: number) => {
        const cr = val / 10000000;
        return `₹ ${cr.toFixed(2)} Cr`;
    };

    const formatCurrencyLakh = (val: number) => {
        const l = val / 100000;
        return `₹ ${l.toFixed(1)} L`;
    };

    const isSuccess = stressTest ? stressTest.successRate >= 80 : false;
    const color = isSuccess ? '#2E7D32' : '#D32F2F';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#37474F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Stress Test Results</Text>
                <TouchableOpacity onPress={handleDownloadReport} disabled={isStressTestRunning} style={{ opacity: isStressTestRunning ? 0.5 : 1 }}>
                    <MaterialCommunityIcons name="file-download-outline" size={24} color="#1565C0" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                <View style={styles.headerSection}>
                    <Text style={styles.title}>A Safer Retirement Plan for You</Text>
                    <Text style={styles.subtitle}>This plan is designed to survive market ups and downs and protect your lifestyle.</Text>
                </View>

                <View style={styles.comparisonStrip}>
                    <View style={styles.stripItem}>
                        <Text style={styles.stripLabel}>Basic Estimate</Text>
                        <Text style={styles.stripSubLabel}>(No market shocks)</Text>
                        <Text style={styles.stripValue}>{formatCurrencyCr(baseline.simpleCorpus)}</Text>
                    </View>
                    <View style={styles.stripDivider} />
                    <View style={styles.stripItem}>
                        <Text style={styles.stripLabel}>Safer Plan</Text>
                        <Text style={styles.stripSubLabel}>(Handles volatility)</Text>
                        <Text style={styles.stripValueHighlight}>{formatCurrencyCr(baseline.baselineCorpus)}</Text>
                    </View>
                </View>
                <Text style={styles.stripHelper}>
                    The safer plan adds a buffer for bad market years and inflation surprises.
                </Text>

                {/* Main Result Card */}
                <View style={[styles.heroCard, { marginTop: 20 }]}>
                    <Text style={styles.heroValue}>{formatCurrencyCr(baseline.baselineCorpus)}</Text>
                    <Text style={styles.heroLabel}>Recommended Retirement Corpus</Text>
                    <Text style={styles.heroSubLabel}>Designed for long-term reliability</Text>

                    <View style={styles.divider} />

                    <View style={styles.heroRow}>
                        <View style={styles.heroItem}>
                            <Text style={styles.heroItemLabel}>Annual Expense (At Retirement)</Text>
                            <Text style={styles.heroItemValue}>{formatCurrencyLakh(baseline.annualExpenseAtRetirement)} /yr</Text>
                        </View>
                    </View>
                </View>

                {/* Warning / Explanation */}
                <View style={styles.warningCard}>
                    <MaterialCommunityIcons name="information-outline" size={20} color="#0D47A1" />
                    <Text style={styles.warningText}>
                        Markets can be unpredictable. This plan prepares you for bad years — not just good ones.
                    </Text>
                </View>

                {/* Stress Test Section */}
                {!showResults ? (
                    <View style={styles.footer}>
                        <Text style={styles.microHint}>Next: See how this plan performs during market crashes and low-return periods.</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleRunStressTest}
                            style={[styles.button, isStressTestRunning && styles.buttonDisabled]}
                            disabled={isStressTestRunning}
                        >
                            {isStressTestRunning ? (
                                <Text style={styles.buttonText}>Simulating Scenarios...</Text>
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Check How Long This Plan Can Last</Text>
                                    <MaterialCommunityIcons name="shield-search" size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.helperText}>
                            Simulate 3000 market scenarios to test reliability.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.resultsContainer}>
                        {/* Score Card */}
                        {stressTest && (
                            <View style={styles.scoreCard}>
                                <View style={[styles.ring, { borderColor: color }]}>
                                    <Text style={[styles.scoreValue, { color }]}>{stressTest.successRate.toFixed(0)}%</Text>
                                    <Text style={styles.scoreLabel}>Success Rate</Text>
                                </View>
                                <Text style={styles.scoreMessage}>
                                    {isSuccess
                                        ? "Your plan is robust against market volatility."
                                        : "Your plan has a high risk of failure."}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity activeOpacity={0.8} onPress={handleHome} style={styles.outlineButton}>
                            <MaterialCommunityIcons name="home-outline" size={20} color="#546E7A" />
                            <Text style={styles.outlineButtonText}>Home</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },

    headerSection: { marginBottom: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECEFF1' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#263238' },
    backButton: { padding: 4 },
    title: { fontSize: 24, fontWeight: '800', color: '#263238', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#546E7A', lineHeight: 20 },

    comparisonStrip: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ECEFF1', alignItems: 'center' },
    stripItem: { flex: 1 },
    stripLabel: { fontSize: 11, color: '#90A4AE', marginBottom: 4 },
    stripSubLabel: { fontSize: 10, color: '#B0BEC5', marginBottom: 4, fontStyle: 'italic' },
    stripValue: { fontSize: 14, fontWeight: '600', color: '#546E7A' },
    stripValueHighlight: { fontSize: 15, fontWeight: '700', color: '#263238' },
    stripDivider: { width: 1, height: 30, backgroundColor: '#ECEFF1', marginHorizontal: 16 },
    stripHelper: { fontSize: 12, color: '#78909C', marginTop: 8, fontStyle: 'italic', paddingHorizontal: 4 },

    heroCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4 },
    heroValue: { fontSize: 36, fontWeight: '800', color: '#1565C0', marginBottom: 4 },
    heroLabel: { fontSize: 13, fontWeight: '700', color: '#1565C0', letterSpacing: 0, marginTop: 4 },
    heroSubLabel: { fontSize: 11, color: '#90A4AE', marginTop: 2, fontStyle: 'italic' },

    divider: { width: '100%', height: 1, backgroundColor: '#ECEFF1', marginVertical: 20 },

    heroRow: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
    heroItem: { alignItems: 'center' },
    heroItemLabel: { fontSize: 11, color: '#90A4AE', marginBottom: 4, textTransform: 'uppercase' },
    heroItemValue: { fontSize: 16, fontWeight: '700', color: '#455A64' },

    warningCard: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, marginTop: 24, alignItems: 'center', borderColor: '#BBDEFB', borderWidth: 1 },
    warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#1565C0', lineHeight: 18 },

    footer: { marginTop: 32 },
    button: { flexDirection: 'row', backgroundColor: '#2196F3', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#2196F3', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
    buttonDisabled: { backgroundColor: '#90CAF9', shadowOpacity: 0 },
    buttonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
    helperText: { textAlign: 'center', marginTop: 12, fontSize: 12, color: '#90A4AE', lineHeight: 18 },
    microHint: { textAlign: 'center', fontSize: 11, color: '#78909C', marginBottom: 12, fontStyle: 'italic' },

    resultsContainer: { marginTop: 32 },
    scoreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#ECEFF1' },
    ring: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    scoreValue: { fontSize: 28, fontWeight: '800' },
    scoreLabel: { fontSize: 11, color: '#90A4AE', marginTop: 4, textTransform: 'uppercase' },
    scoreMessage: { fontSize: 14, color: '#546E7A', textAlign: 'center', fontWeight: '500' },

    outlineButton: { flexDirection: 'row', backgroundColor: 'transparent', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CFD8DC' },
    outlineButtonText: { fontSize: 16, fontWeight: '600', color: '#546E7A', marginLeft: 8 },
});
