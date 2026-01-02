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

                {/* CARD 1: LIFESTYLE COST INCREASE */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>LIFESTYLE COST INCREASE</Text>
                    </View>

                    <View style={styles.lifestyleContainer}>
                        {/* Start Node */}
                        <View style={styles.lsNode}>
                            <Text style={styles.lsLabel}>Today</Text>
                            <AgeBadge age={settings.currentAge} color="#546E7A" />
                            <Text style={styles.lsValue}>{formatLakhs(result.expenses.currentAnnualExpense)}</Text>
                        </View>

                        {/* Connector */}
                        <View style={styles.lsConnector}>
                            <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#CFD8DC" />
                            <Text style={styles.lsGrowthText}>Inflation Effect</Text>
                        </View>

                        {/* End Node */}
                        <View style={styles.lsNodeRight}>
                            <Text style={styles.lsLabel}>At Age {settings.retirementAge}</Text>
                            <AgeBadge age={settings.retirementAge} color="#E65100" />
                            <Text style={[styles.lsValue, { color: '#E65100' }]}>{formatLakhs(result.expenses.expenseAtRetirementAnnual)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>Your same lifestyle will cost significantly more due to inflation.</Text>
                    </View>
                </Card>

                {/* Spacer */}
                <View style={{ height: 16 }} />

                {/* CARD 2: HERO CORPUS */}
                <Card style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroLabel}>MINIMUM RETIREMENT REQUIREMENT</Text>
                        <Text style={styles.heroValue}>{formatValue(result.corpus.simpleCorpus)}</Text>

                        <View style={styles.pillContainer}>
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>Safe Withdrawal Rate: {(result.corpus.simpleWithdrawalRate * 100).toFixed(1)}%</Text>
                            </View>
                        </View>

                        <View style={styles.heroDivider} />
                        <Text style={styles.heroSub}>Minimum corpus needed to maintain your lifestyle (Time-Adjusted Rule).</Text>
                    </View>
                </Card>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* CARD 3: ASSUMPTIONS (Refined) */}
                <Card style={styles.slimCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>ASSUMPTIONS USED (POST-TAX)</Text>
                    </View>

                    <View style={styles.assumptionsGrid}>
                        <View style={styles.assumptionItem}>
                            <MaterialCommunityIcons name="chart-line" size={16} color="#4CAF50" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.assumptionLabel}>Equity Growth</Text>
                                <Text style={styles.assumptionValue}>~10%</Text>
                            </View>
                        </View>

                        <View style={styles.verticalLine} />

                        <View style={styles.assumptionItem}>
                            <MaterialCommunityIcons name="bank" size={16} color="#FFC107" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.assumptionLabel}>Debt Growth</Text>
                                <Text style={styles.assumptionValue}>~6%</Text>
                            </View>
                        </View>

                        <View style={styles.verticalLine} />

                        <View style={styles.assumptionItem}>
                            <MaterialCommunityIcons name="chart-pie" size={16} color="#29B6F6" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.assumptionLabel}>Blended Return</Text>
                                <Text style={styles.assumptionValue}>8.5%</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.slimFooter}>Based on historical long-term averages.</Text>
                </Card>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* CTA */}
                <View style={styles.ctaWrapper}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/calculator/baseline')}>
                        <LinearGradient
                            colors={['#2196F3', '#1976D2']}
                            style={styles.ctaButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.ctaText}>Check Market Volatility</Text>
                            <MaterialCommunityIcons name="shield-search" size={20} color="#E3F2FD" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.ctaHelper}>See how real market volatility affects this plan</Text>
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
    card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 0, elevation: 1, borderWidth: 1, borderColor: '#ECEFF1' },
    cardHeader: { paddingHorizontal: 20, paddingTop: 16, marginBottom: 12 },
    cardTitle: { fontSize: 11, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 0.5 },

    lifestyleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 24 },
    lsNode: { alignItems: 'flex-start' },
    lsNodeRight: { alignItems: 'flex-end' },
    lsLabel: { fontSize: 13, color: '#546E7A', fontWeight: '500', marginBottom: 6 },
    lsValue: { fontSize: 20, fontWeight: '700', color: '#37474F', marginTop: 8 },
    lsConnector: { alignItems: 'center', flex: 1 },
    lsGrowthText: { fontSize: 9, color: '#CFD8DC', marginTop: -2 },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    cardFooter: { backgroundColor: '#F9FAFB', paddingVertical: 10, paddingHorizontal: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    footerText: { fontSize: 11, color: '#78909C', textAlign: 'center' },

    // Card 2: Hero
    heroCard: { backgroundColor: '#FFF', borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, borderWidth: 1, borderColor: '#ECEFF1' },
    heroContent: { padding: 24, alignItems: 'center' },
    heroLabel: { fontSize: 11, fontWeight: '700', color: '#B0BEC5', letterSpacing: 1, marginBottom: 12, textAlign: 'center' },
    heroValue: { fontSize: 48, fontWeight: '800', color: '#263238', letterSpacing: -1, marginBottom: 16 },

    pillContainer: { flexDirection: 'row', marginBottom: 20 },
    pill: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    pillText: { fontSize: 11, color: '#2E7D32', fontWeight: '600' },

    heroDivider: { width: 40, height: 4, backgroundColor: '#ECEFF1', borderRadius: 2, marginBottom: 16 },
    heroSub: { fontSize: 14, color: '#546E7A', textAlign: 'center', lineHeight: 20 },
    heroInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    heroFooterText: { fontSize: 11, color: '#B0BEC5', fontStyle: 'italic' },

    // Card 3: Assumptions
    slimCard: { backgroundColor: '#FFF', borderRadius: 16, elevation: 1, borderWidth: 1, borderColor: '#ECEFF1' },
    assumptionsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
    assumptionItem: { flexDirection: 'row', alignItems: 'center' },
    assumptionLabel: { fontSize: 10, color: '#90A4AE', marginBottom: 2 },
    assumptionValue: { fontSize: 13, fontWeight: '700', color: '#455A64' },
    verticalLine: { width: 1, height: 24, backgroundColor: '#ECEFF1' },
    slimFooter: { fontSize: 10, color: '#B0BEC5', padding: 12, textAlign: 'center', fontStyle: 'italic', backgroundColor: '#F9FAFB', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },

    // CTA
    ctaWrapper: { paddingBottom: 4 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, gap: 8, elevation: 4, shadowColor: '#2196F3', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 } },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    ctaHelper: { textAlign: 'center', marginTop: 12, fontSize: 11, color: '#90A4AE' },
});
