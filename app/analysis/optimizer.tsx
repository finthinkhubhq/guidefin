import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';
import { calculateRetirementCorpus } from '../../src/utils/financialEngine';
import { findRequiredCorpus, runMonteCarloSimulation } from '../../src/utils/monteCarloEngine';
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
        const currentMonthly = expenses.reduce((sum, item) => sum + item.monthly, 0);

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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '700', color: '#90A4AE', marginBottom: 16 }}>Calculating Safer Plan...</Text>
                    <ProgressBar indeterminate color="#1976D2" style={{ width: 200, height: 4, borderRadius: 2 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#546E7A" />
                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#546E7A' }}>Back</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                {/* HERO CARD: RECOMMENDED CORPUS */}
                <Card style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="shield-check" size={32} color="#1976D2" />
                        </View>
                        <Text style={styles.heroTitle}>RECOMMENDED RETIREMENT CORPUS</Text>
                        <Text style={styles.heroValue}>{formatValue(saferCorpus)}</Text>
                        <View style={styles.heroDivider} />
                        <Text style={styles.heroSub}>Designed to improve retirement reliability to <Text style={{ fontWeight: '800', color: '#4CAF50' }}>95%</Text></Text>
                    </View>
                </Card>

                {/* COMPARISON CARD: Why This Is Better */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Why This Is Better</Text>
                        <MaterialCommunityIcons name="star-outline" size={16} color="#90A4AE" />
                    </View>
                    <View style={styles.infoList}>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" style={{ marginRight: 12 }} />
                            <Text style={styles.infoText}>Much higher chance your money lasts (95%)</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" style={{ marginRight: 12 }} />
                            <Text style={styles.infoText}>Better protection against bad market years</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" style={{ marginRight: 12 }} />
                            <Text style={styles.infoText}>Reduced risk of running out early</Text>
                        </View>
                    </View>
                </Card>

                <View style={{ flex: 1 }} />

                {/* CTA */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/dashboard')}>
                    <LinearGradient
                        colors={['#2196F3', '#1976D2']}
                        style={styles.ctaButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.ctaText}>View Full Retirement Plan</Text>
                        <MaterialCommunityIcons name="file-document-outline" size={20} color="#E3F2FD" />
                    </LinearGradient>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    content: { flex: 1, padding: 20, paddingTop: 10 },

    // Hero
    heroCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, elevation: 4 },
    heroContent: { padding: 32, alignItems: 'center' },
    iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    heroTitle: { fontSize: 11, fontWeight: '700', color: '#90A4AE', letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' },
    heroValue: { fontSize: 40, fontWeight: '800', color: '#263238', marginBottom: 16 },
    heroDivider: { width: '100%', height: 1, backgroundColor: '#F5F5F5', marginBottom: 16 },
    heroSub: { fontSize: 15, color: '#546E7A', textAlign: 'center', lineHeight: 22 },

    // Card
    card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    cardTitle: { fontSize: 12, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 0.5 },

    infoList: { padding: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoText: { fontSize: 14, color: '#455A64', fontWeight: '500' },

    // CTA
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8, elevation: 4, marginBottom: 8 },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
