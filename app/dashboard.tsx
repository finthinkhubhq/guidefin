import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore, useSettingsStore } from '../src/store/atoms';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateRetirementCorpus } from '../src/utils/financialEngine';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- Helper: Age Badge (Clean Align) ---
const AgeBadge = ({ age, color }: { age: number, color: string }) => (
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.badgeText, { color: color }]}>Age {age}</Text>
    </View>
);

export default function Dashboard() {
    const router = useRouter();
    const { expenses } = useExpensesStore();
    const { settings } = useSettingsStore();

    const currentMonthly = expenses.reduce((sum, item) => sum + item.monthly, 0);
    const result = calculateRetirementCorpus({
        currentAge: settings.currentAge,
        retirementAge: settings.retirementAge,
        lifeExpectancy: settings.lifeExpectancy || 90,
        currentMonthlyExpense: currentMonthly,
        inflationRate: (settings.inflation || 6) / 100,
        postRetirementReturn: 0.085,
        safetyBufferPercent: 0.10,
    });

    const formatName = (name: string) => (!name) ? 'User' : name.charAt(0).toUpperCase() + name.slice(1);
    const formatValue = (amount: number) => {
        if (!amount || isNaN(amount)) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return `₹${amount.toFixed(0)}`;
    };
    const formatLakhs = (val: number) => (!val || isNaN(val)) ? '₹0' : `₹${(val / 100000).toFixed(1)} L/y`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>

                {/* HEAD: Context */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hi {formatName(settings.name)}</Text>
                    <Text style={styles.pageTitle}>Retirement Planning</Text>
                </View>

                {/* CARD 1: LIFESTYLE COST INCREASE (Clean Align) */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Lifestyle Cost Increase</Text>
                    </View>
                    <View style={styles.comparisonRow}>

                        {/* LEFT: Today */}
                        <View style={styles.colLeft}>
                            <Text style={styles.colLabel}>Today</Text>
                            <AgeBadge age={settings.currentAge} color="#546E7A" />
                            <Text style={styles.colValue}>{formatLakhs(result.expenses.currentAnnualExpense)}</Text>
                        </View>

                        {/* RIGHT: Retirement */}
                        <View style={styles.colRight}>
                            <Text style={styles.colLabel}>At Retirement</Text>
                            <AgeBadge age={settings.retirementAge} color="#E65100" />
                            <Text style={[styles.colValue, { color: '#E65100' }]}>{formatLakhs(result.expenses.expenseAtRetirementAnnual)}</Text>
                        </View>

                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>Same lifestyle costs more over time due to inflation</Text>
                    </View>
                </Card>

                {/* Spacer */}
                <View style={{ height: 16 }} />

                {/* CARD 2: HERO CORPUS */}
                <Card style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroLabel}>BASELINE RETIREMENT CORPUS</Text>
                        <Text style={styles.heroValue}>{formatValue(result.corpus.bufferedCorpus)}</Text>
                        <View style={styles.heroDivider} />
                        <Text style={styles.heroSub}>Minimum amount needed to maintain your lifestyle after retirement</Text>
                        <View style={styles.heroInfoRow}>
                            <Text style={styles.heroFooterText}>Calculated using long-term average returns and inflation</Text>
                        </View>
                    </View>
                </Card>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* CARD 3: ASSUMPTIONS (Visual) */}
                <Card style={styles.slimCard}>
                    <View style={styles.slimContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.slimTitle}>Assumptions Used</Text>
                            <Text style={styles.slimValue}>Expected Return: 8.5% (Blended)</Text>

                            {/* Visual Indicators */}
                            <View style={styles.indicators}>
                                <View style={styles.indicatorRow}>
                                    <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={styles.indicatorText}>Equity: 60% (~10%)</Text>
                                </View>
                                <View style={styles.indicatorRow}>
                                    <View style={[styles.dot, { backgroundColor: '#FFC107' }]} />
                                    <Text style={styles.indicatorText}>Debt: 40% (~6%)</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.slimFooter}>Does not account for market ups and downs</Text>
                </Card>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* CTA */}
                <View style={styles.ctaWrapper}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/analysis/reality')}>
                        <LinearGradient
                            colors={['#2196F3', '#1976D2']}
                            style={styles.ctaButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.ctaText}>Check How Safe This Amount Is</Text>
                            <MaterialCommunityIcons name="shield-search" size={18} color="#E3F2FD" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.ctaHelper}>Stress-test this amount under real market volatility</Text>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    wrapper: { flex: 1, padding: 20 },

    // Header
    header: { marginBottom: 16 },
    greeting: { fontSize: 13, fontWeight: '600', color: '#90A4AE' },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#263238', letterSpacing: -0.5 },

    // Card 1
    card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 0, elevation: 2 },
    cardHeader: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 },
    cardTitle: { fontSize: 11, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 0.5 },

    comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },

    colLeft: { alignItems: 'flex-start' },
    colRight: { alignItems: 'flex-end' },

    colLabel: { fontSize: 13, color: '#546E7A', fontWeight: '600', marginBottom: 4 },
    colValue: { fontSize: 18, fontWeight: '700', color: '#37474F', marginTop: 8 },

    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: '700' },

    cardFooter: { backgroundColor: '#F5F7FA', paddingVertical: 8, paddingHorizontal: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    footerText: { fontSize: 10, color: '#90A4AE', textAlign: 'center' },

    // Card 2: Hero
    heroCard: { backgroundColor: '#FFF', borderRadius: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
    heroContent: { padding: 24, alignItems: 'center' },
    heroLabel: { fontSize: 11, fontWeight: '700', color: '#B0BEC5', letterSpacing: 1.5, marginBottom: 12 },
    heroValue: { fontSize: 44, fontWeight: '800', color: '#263238', letterSpacing: -1, marginBottom: 12 },
    heroDivider: { width: '100%', height: 1, backgroundColor: '#F5F5F5', marginBottom: 12 },
    heroSub: { fontSize: 14, color: '#546E7A', textAlign: 'center', marginBottom: 16, lineHeight: 20 },

    heroInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    heroFooterText: { fontSize: 10, color: '#90A4AE', fontStyle: 'italic' },

    // Card 3: Assumptions
    slimCard: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, elevation: 1, borderWidth: 1, borderColor: '#ECEFF1' },
    slimContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    slimTitle: { fontSize: 10, fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', marginBottom: 4 },
    slimValue: { fontSize: 14, fontWeight: '700', color: '#455A64', marginBottom: 8 },

    indicators: { flexDirection: 'row', gap: 16 },
    indicatorRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    indicatorText: { fontSize: 11, color: '#546E7A', fontWeight: '500' },

    slimFooter: { fontSize: 9, color: '#B0BEC5', marginTop: 4, fontStyle: 'italic' },

    // CTA
    ctaWrapper: { paddingBottom: 4 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8, elevation: 6 },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    ctaHelper: { textAlign: 'center', marginTop: 12, fontSize: 11, color: '#90A4AE' },
});
