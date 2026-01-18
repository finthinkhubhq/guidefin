import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';
import { calculateRetirementCorpus } from '../../src/utils/financialEngine';
import { findRequiredCorpus, runMonteCarloSimulation } from '../../src/utils/monteCarloEngine';
import { generateRetirementReport } from '../../src/services/pdfGenerator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OptimizerScreen() {
    const router = useRouter();
    const { expenses } = useExpensesStore();
    const { settings } = useSettingsStore();

    const [saferCorpus, setSaferCorpus] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Calculate Safer Corpus
        const currentMonthly = settings.monthlyExpenses || expenses.reduce((sum, item) => sum + item.monthly, 0);

        // Base inputs needed for reverse calculation
        const baseline = calculateRetirementCorpus({
            currentAge: settings.currentAge,
            retirementAge: settings.retirementAge,
            lifeExpectancy: settings.lifeExpectancy || 90,
            currentMonthlyExpense: currentMonthly,
            inflationRate: (settings.inflation || 6) / 100,
            postRetirementReturn: 0.085,
            safetyBufferPercent: 0.10,
        });

        setTimeout(() => {
            const requiredAmount = findRequiredCorpus({
                annualWithdrawal: baseline.expenses.expenseAtRetirementAnnual,
                durationYears: (settings.lifeExpectancy || 90) - settings.retirementAge,
                equityRatio: 0.60,
                targetSuccessRate: 95 // Target 95% Safety
            });
            setSaferCorpus(requiredAmount);
            setLoading(false);
        }, 500);
    }, []);

    const formatValue = (amount: number) => {
        if (!amount || isNaN(amount)) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        return `₹${(amount / 100000).toFixed(0)} L`;
    };

    const handleDownloadReport = async () => {
        try {
            const currentMonthly = settings.monthlyExpenses || expenses.reduce((sum, item) => sum + item.monthly, 0);

            // Re-calculate baseline for report data
            const baseline = calculateRetirementCorpus({
                currentAge: settings.currentAge,
                retirementAge: settings.retirementAge,
                lifeExpectancy: settings.lifeExpectancy || 90,
                currentMonthlyExpense: currentMonthly,
                inflationRate: (settings.inflation || 6) / 100,
                postRetirementReturn: 0.085,
                safetyBufferPercent: 0.10,
            });

            // Map data to expected format for PDF Generator
            const reportInputs = {
                currentAge: settings.currentAge,
                monthlyExpense: currentMonthly,
                retirementAge: settings.retirementAge,
                lifeExpectancy: settings.lifeExpectancy || 90,
                inflationRate: (settings.inflation || 6) / 100,
                postRetirementReturn: 0.085
            };

            // We use 'saferCorpus' as the 'baselineCorpus' in the report to show the optimized value
            const reportBaseline = {
                annualExpenseAtRetirement: baseline.expenses.expenseAtRetirementAnnual,
                simpleCorpus: baseline.corpus.simpleCorpus,
                baselineCorpus: saferCorpus, // <--- Using the Optimized Corpus here
            };

            // Success is 95% for this optimized plan
            const reportStressTest = {
                successRate: 95
            };

            await generateRetirementReport(
                reportInputs as any,
                reportBaseline as any,
                reportStressTest as any,
                settings
            );

        } catch (error) {
            console.error("Report Gen Error:", error);
            alert("Failed to generate report");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '700', color: theme.colors.text.secondary, marginBottom: 16 }}>Calculating Safer Plan...</Text>
                    <ProgressBar indeterminate color={theme.colors.text.highlight} style={{ width: 200, height: 4, borderRadius: 2 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.secondary} />
                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: theme.colors.text.secondary }}>Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                {/* HERO CARD: RECOMMENDED CORPUS - Success Theme */}
                <Card style={styles.heroCard}>
                    <LinearGradient
                        colors={[theme.colors.background.surface, '#E8F5E9']} // Light Green Gradient
                        style={styles.heroContent}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="shield-check" size={40} color="#4CAF50" />
                        </View>
                        <Text style={styles.heroTitle}>OPTIMIZED TARGET CORPUS</Text>
                        <Text style={styles.heroValue}>{formatValue(saferCorpus)}</Text>
                        <View style={styles.heroTag}>
                            <Text style={styles.heroTagText}>95% SUCCESS PROBABILITY</Text>
                        </View>
                    </LinearGradient>
                </Card>

                {/* COMPARISON CARD: Why This Is Better */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Why This Is Better</Text>
                        <MaterialCommunityIcons name="star-circle" size={20} color="#FFD700" />
                    </View>
                    <View style={styles.infoList}>
                        <View style={styles.infoRow}>
                            <View style={styles.checkIcon}>
                                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Bulletproof Reliability</Text>
                                <Text style={styles.infoText}>95% chance your money lasts (vs typical 50-60%)</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.checkIcon}>
                                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Market Crash Protection</Text>
                                <Text style={styles.infoText}>Survives severe market downturns</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.checkIcon}>
                                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Legacy Creation</Text>
                                <Text style={styles.infoText}>Likely to leave a significant inheritance</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                <View style={{ flex: 1 }} />

                {/* ACTIONS */}
                <View style={styles.actionContainer}>

                    {/* Download Report (Secondary) */}
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleDownloadReport}
                    >
                        <MaterialCommunityIcons name="file-download-outline" size={24} color={theme.colors.text.primary} />
                        <Text style={styles.secondaryButtonText}>Download Report</Text>
                    </TouchableOpacity>

                    {/* Back to Home (Primary) */}
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.replace('/')}>
                        <LinearGradient
                            colors={theme.colors.gradient.button as unknown as string[]}
                            style={styles.ctaButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.ctaText}>Back to Home</Text>
                            <MaterialCommunityIcons name="home-outline" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                </View>

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
    heroCard: { borderRadius: 24, marginBottom: 20, elevation: 4, overflow: 'hidden', backgroundColor: '#FFF' },
    heroContent: { padding: 32, alignItems: 'center' },
    iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary, letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' },
    heroValue: { fontSize: 44, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 16 },
    heroTag: { backgroundColor: '#C8E6C9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    heroTagText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },

    // Card
    card: { backgroundColor: theme.colors.background.surface, borderRadius: 16, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    cardTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: 0.5 },

    infoList: { padding: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    checkIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', marginRight: 16, marginTop: 2 },
    infoLabel: { fontSize: 14, color: theme.colors.text.primary, fontWeight: '700', marginBottom: 4 },
    infoText: { fontSize: 13, color: theme.colors.text.secondary, lineHeight: 18 },

    // Actions
    actionContainer: { gap: 12 },

    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, gap: 8, elevation: 4 },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

    secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8, backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border },
    secondaryButtonText: { color: theme.colors.text.primary, fontWeight: '600', fontSize: 16 },
});
