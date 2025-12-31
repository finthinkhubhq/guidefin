import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AgeBadge = ({ age, color }: { age: number, color: string }) => (
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.badgeText, { color: color }]}>Age {age}</Text>
    </View>
);

export default function WizardSummary() {
    const router = useRouter();
    const { expenses } = useExpensesStore();
    const { settings } = useSettingsStore();

    // Calculate totals
    const currentMonthly = expenses.reduce((sum, item) => sum + item.monthly, 0);
    const totalAnnual = currentMonthly * 12;

    // Calculate Near-Term Future Cost (5 Years)
    const inflationRate = (settings.inflation || 6) / 100;
    const futureCost5Years = useMemo(() => {
        return totalAnnual * Math.pow(1 + inflationRate, 5);
    }, [totalAnnual, inflationRate]);

    const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(1)} Lakhs`;
    const formatValue = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Summary</Text>
                    <Text style={styles.title}>Your Lifestyle Cost</Text>
                </View>

                {/* VISUAL CARD 1: HERO - CURRENT COST */}
                <Card style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroLabel}>CURRENT LIFESTYLE COST</Text>
                        <Text style={styles.heroValue}>{formatLakhs(totalAnnual)} / year</Text>
                    </View>
                </Card>

                {/* VISUAL CARD 2: INFLATION IMPACT (5 Years) */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Impact of Inflation Over Time</Text>
                    </View>
                    <View style={styles.comparisonRow}>

                        {/* TODAY */}
                        <View style={styles.col}>
                            <View style={styles.colHeader}>
                                <Text style={styles.colLabel}>Today</Text>
                                <AgeBadge age={settings.currentAge} color="#546E7A" />
                            </View>
                            <Text style={styles.colValue}>{formatLakhs(totalAnnual)}</Text>
                        </View>

                        {/* ARROW */}
                        <View style={styles.middle}>
                            <MaterialCommunityIcons name="arrow-right-thin" size={24} color="#CFD8DC" />
                            <Text style={styles.inflationLabel}>Inflation ↑</Text>
                        </View>

                        {/* FUTURE (5 Years) */}
                        <View style={styles.col}>
                            <View style={styles.colHeader}>
                                <Text style={styles.colLabel}>In 5 Years</Text>
                                <AgeBadge age={settings.currentAge + 5} color="#E65100" />
                            </View>
                            <Text style={[styles.colValue, { color: '#E65100' }]}>{formatLakhs(futureCost5Years)}</Text>
                        </View>

                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={styles.footerText}>Even without lifestyle upgrades, costs rise due to inflation</Text>
                    </View>
                </Card>


                <View style={{ flex: 1 }} />

                {/* CTA */}
                <Button
                    mode="contained"
                    onPress={() => router.push('/dashboard')}
                    style={styles.nextButton}
                    contentStyle={styles.btnContent}
                    labelStyle={styles.btnLabel}
                >
                    Plan My Retirement
                </Button>
                <Text style={styles.ctaHelper}>See what this lifestyle means for your retirement</Text>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flex: 1, padding: 24 },

    header: { marginBottom: 24 },
    subtitle: { fontSize: 13, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    title: { fontSize: 32, fontWeight: '800', color: '#263238', marginBottom: 8 },

    // Hero Custom
    heroCard: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 16, elevation: 4 },
    heroContent: { padding: 32, alignItems: 'center' },
    heroLabel: { fontSize: 11, fontWeight: '700', color: '#B0BEC5', letterSpacing: 1.5, marginBottom: 8 },
    heroValue: { fontSize: 24, fontWeight: '700', color: '#263238', marginBottom: 0 },

    // Primary Card
    card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 16, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 10 },
    cardTitle: { fontSize: 11, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: 0.5 },

    comparisonRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 24 },
    col: { flex: 1 },
    colHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    colLabel: { fontSize: 13, color: '#546E7A', fontWeight: '600' },
    colValue: { fontSize: 20, fontWeight: '700', color: '#37474F', marginBottom: 4 },

    middle: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingTop: 30 },
    inflationLabel: { fontSize: 9, color: '#FF7043', fontWeight: '700', marginTop: 4 },

    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: '700' },

    cardFooter: { backgroundColor: '#FAFAFA', paddingVertical: 10, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    footerText: { fontSize: 10, color: '#B0BEC5', textAlign: 'center', fontStyle: 'italic' },


    nextButton: { borderRadius: 16, backgroundColor: '#1976D2', marginTop: 20 },
    btnContent: { height: 56 },
    btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    ctaHelper: { textAlign: 'center', marginTop: 12, fontSize: 11, color: '#90A4AE' },
});
