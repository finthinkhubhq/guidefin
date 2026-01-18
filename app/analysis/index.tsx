import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';
import { calculateRetirementCorpus } from '../../src/utils/financialEngine';
import { runMonteCarloSimulation } from '../../src/utils/monteCarloEngine';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function RealityCheckScreen() {
    const router = useRouter();
    const { expenses } = useExpensesStore();
    const { settings } = useSettingsStore();

    // State for Simulation Results
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Run Simulation on Mount
        // Fix: expenses array might be empty if coming from new calculator. Use settings.monthlyExpenses.
        const currentMonthly = settings.monthlyExpenses || expenses.reduce((sum, item) => sum + item.monthly, 0);

        // 1. Get Baseline Corpus (What we have on dashboard)
        const baseline = calculateRetirementCorpus({
            currentAge: settings.currentAge,
            retirementAge: settings.retirementAge,
            lifeExpectancy: settings.lifeExpectancy || 90,
            currentMonthlyExpense: currentMonthly,
            inflationRate: (settings.inflation || 6) / 100,
            postRetirementReturn: 0.085,
            safetyBufferPercent: 0.10,
        });

        // 2. Run Stress Test on this Baseline Corpus
        setTimeout(() => {
            const simResult = runMonteCarloSimulation({
                currentCorpus: baseline.corpus.bufferedCorpus,
                annualWithdrawal: baseline.expenses.expenseAtRetirementAnnual,
                durationYears: (settings.lifeExpectancy || 90) - settings.retirementAge,
                equityRatio: 0.60
            });
            setResult(simResult);
            setLoading(false);
        }, 500); // Fake delay for UX
    }, []);

    // Color Logic
    const getStatusColor = (rate: number) => {
        if (rate >= 75) return '#4CAF50'; // Green
        if (rate >= 50) return '#FFC107'; // Amber
        return '#F44336'; // Red
    };

    if (loading || !result) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '700', color: theme.colors.text.secondary, marginBottom: 16 }}>Running 3,000 Scenarios...</Text>
                    <ProgressBar indeterminate color={theme.colors.text.accent} style={{ width: 200, height: 4, borderRadius: 2 }} />
                </View>
            </SafeAreaView>
        );
    }

    const color = getStatusColor(result.successRate);
    const lifeExpectancy = settings.lifeExpectancy || 90;
    const worstCaseAge = settings.retirementAge + result.worstCaseDuration;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.secondary} />
                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: theme.colors.text.secondary }}>Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                {/* HERO CARD: RETIREMENT RESILIENCE */}
                <Card style={[styles.heroCard, { borderTopColor: color, borderTopWidth: 4 }]}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>RETIREMENT RESILIENCE</Text>
                        <Text style={[styles.heroValue, { color: color }]}>{result.successRate.toFixed(0)}%</Text>
                        <View style={styles.heroDivider} />
                        <Text style={styles.heroSub}>
                            Chance your money lasts till age <Text style={{ fontWeight: '800', color: theme.colors.text.primary }}>{lifeExpectancy}</Text>
                        </Text>
                        <View style={styles.heroFooter}>
                            <MaterialCommunityIcons name="robot-outline" size={14} color={theme.colors.text.muted} style={{ marginRight: 6 }} />
                            <Text style={styles.heroFooterText}>Based on {result.simulationCount.toLocaleString()} simulated market scenarios</Text>
                        </View>
                    </View>
                </Card>

                {/* CONTEXT CARD: What does this mean? */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>What does this mean?</Text>
                        <MaterialCommunityIcons name="help-circle-outline" size={16} color={theme.colors.text.muted} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.contextText}>
                            In <Text style={{ fontWeight: '800', color: color }}>{result.successRate.toFixed(0)} out of 100</Text> possible futures, this amount lasts till age {lifeExpectancy}.
                        </Text>
                    </View>
                </Card>

                {/* SCENARIO CARD: Possible Outcomes */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Possible Outcomes</Text>
                        <MaterialCommunityIcons name="chart-bell-curve" size={16} color={theme.colors.text.muted} />
                    </View>
                    <View style={styles.scenarios}>

                        {/* Worst Case */}
                        <View style={styles.scenarioRow}>
                            <View style={styles.scenarioIconRed}>
                                <MaterialCommunityIcons name="alert-outline" size={18} color="#D32F2F" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.scenarioLabel}>Worst Case</Text>
                                <Text style={styles.scenarioDesc}>Money runs out by <Text style={{ fontWeight: '700', color: '#D32F2F' }}>Age {worstCaseAge.toFixed(0)}</Text></Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Typical Case */}
                        <View style={styles.scenarioRow}>
                            <View style={styles.scenarioIconGreen}>
                                <MaterialCommunityIcons name="check" size={18} color="#388E3C" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.scenarioLabel}>Typical Case</Text>
                                <Text style={styles.scenarioDesc}>Money lasts till <Text style={{ fontWeight: '700', color: '#388E3C' }}>Age {lifeExpectancy}+</Text> with surplus</Text>
                            </View>
                        </View>

                    </View>
                </Card>

                <View style={{ flex: 1 }} />

                {/* CTA */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/analysis/optimizer')}>
                    <LinearGradient
                        colors={theme.colors.gradient.button as unknown as string[]}
                        style={styles.ctaButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.ctaText}>See Recommended Safer Corpus</Text>
                        <MaterialCommunityIcons name="shield-star" size={20} color="#FFD700" />
                    </LinearGradient>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

// Theme Import
import { theme } from '../../src/theme';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    content: { flex: 1, padding: 20, paddingTop: 10 },

    // Hero
    heroCard: { backgroundColor: theme.colors.background.secondary, borderRadius: 20, marginBottom: 16, elevation: 4 }, // Removed border
    heroContent: { padding: 24, alignItems: 'center' },
    heroTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.text.secondary, letterSpacing: 1.5, marginBottom: 8 },
    heroValue: { fontSize: 48, fontWeight: '800', marginBottom: 16 },
    heroDivider: { width: '100%', height: 1, backgroundColor: theme.colors.border, marginBottom: 16 },
    heroSub: { fontSize: 15, color: theme.colors.text.secondary, marginBottom: 16, textAlign: 'center', lineHeight: 22 },
    heroFooter: { flexDirection: 'row', alignItems: 'center' },
    heroFooterText: { fontSize: 10, color: theme.colors.text.muted, fontStyle: 'italic' },

    // Card Styles
    card: { backgroundColor: theme.colors.background.surface, borderRadius: 16, marginBottom: 16, elevation: 2 }, // Removed border
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    cardTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
    cardContent: { padding: 20 },
    contextText: { fontSize: 16, color: theme.colors.text.primary, lineHeight: 24 },

    scenarios: { padding: 16 },
    scenarioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },

    scenarioIconRed: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    scenarioIconGreen: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },

    scenarioLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 2 },
    scenarioDesc: { fontSize: 13, color: theme.colors.text.secondary },

    // CTA
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8, elevation: 4, marginBottom: 8 },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
