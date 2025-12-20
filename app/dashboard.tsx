import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpensesStore, useSettingsStore, ExpenseCategory } from '../src/store/atoms';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- Custom Dual-Pillar Chart Component (Gradient) ---
const DualPillarChart = ({ current, future, currentAge, futureAge }: { current: number, future: number, currentAge: number, futureAge: number }) => {

    // Normalization logic
    const maxValue = Math.max(current, future) * 1.1; // Add 10% buffer
    const currentHeightPct = (current / maxValue) * 100;
    const futureHeightPct = (future / maxValue) * 100;

    const formatShort = (val: number) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        return `₹${(val / 1000).toFixed(0)}k`;
    };

    return (
        <View style={chartStyles.container}>
            {/* Chart Area */}
            <View style={chartStyles.chartArea}>
                {/* Pillar 1: Current */}
                <View style={chartStyles.pillarGroup}>
                    <View style={chartStyles.track}>
                        {/* Gradient Bar */}
                        <View style={[chartStyles.barWrapper, { height: `${currentHeightPct}%` }]}>
                            <LinearGradient
                                colors={['#4A90E2', '#00509E']} // Indigo/Blue Gradient
                                style={chartStyles.gradientBar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />
                        </View>
                    </View>
                    <View style={chartStyles.labelContainer}>
                        <Text style={[chartStyles.labelTitle, { color: '#00509E' }]}>Current</Text>
                        <Text style={chartStyles.labelSub}>Age {currentAge}</Text>
                        <Text style={[chartStyles.labelValue, { color: '#00509E' }]}>{formatShort(current)}</Text>
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ width: 40 }} />

                {/* Pillar 2: Future */}
                <View style={chartStyles.pillarGroup}>
                    <View style={chartStyles.track}>
                        {/* Gradient Bar */}
                        <View style={[chartStyles.barWrapper, { height: `${futureHeightPct}%` }]}>
                            <LinearGradient
                                colors={['#FF6B6B', '#D90429']} // Red/Pink Gradient
                                style={chartStyles.gradientBar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />
                        </View>
                    </View>
                    <View style={chartStyles.labelContainer}>
                        <Text style={[chartStyles.labelTitle, { color: '#D90429' }]}>Future</Text>
                        <Text style={chartStyles.labelSub}>Age {futureAge}</Text>
                        <Text style={[chartStyles.labelValue, { color: '#D90429' }]}>{formatShort(future)}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Legend */}
            <View style={chartStyles.legendContainer}>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.dot, { backgroundColor: '#00509E' }]} />
                    <Text style={chartStyles.legendText}>Current</Text>
                </View>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.dot, { backgroundColor: '#D90429' }]} />
                    <Text style={chartStyles.legendText}>Future</Text>
                </View>
            </View>
        </View>
    );
};

const chartStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 180, // Reduced by 15% (220 -> 180ish)
        marginBottom: 16,
    },
    pillarGroup: {
        alignItems: 'center',
        width: 80,
    },
    track: {
        width: 40,
        height: 130, // Proportional Reduction
        backgroundColor: '#F2F4F8', // Light Grey Track
        borderRadius: 20,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        marginBottom: 8,
    },
    barWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradientBar: {
        flex: 1,
        width: '100%',
    },
    labelContainer: {
        alignItems: 'center',
    },
    labelTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    labelSub: {
        fontSize: 11,
        color: '#8A8A8F',
        fontWeight: '500',
        marginBottom: 1,
    },
    labelValue: {
        fontSize: 15,
        fontWeight: '800', // Heavy Bold
    },
    legendContainer: {
        flexDirection: 'row',
        marginTop: 0,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});


export default function Dashboard() {
    const { expenses } = useExpensesStore();
    const { settings } = useSettingsStore();

    const currentMonthly = expenses.reduce((sum: number, item: ExpenseCategory) => sum + item.monthly, 0);
    const currentAnnual = currentMonthly * 12;

    const yearsToRetirement = Math.max(0, settings.retirementAge - settings.currentAge);
    const futureAnnual = currentAnnual * Math.pow(1 + (settings.inflation / 100), yearsToRetirement);

    // Calculate Corpus Values
    const corpus25 = futureAnnual * 25;
    const corpus30 = futureAnnual * 30;
    const corpus33 = futureAnnual * 33;

    const formatName = (name: string) => {
        if (!name) return 'User';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const formatValue = (amount: number) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${amount.toFixed(0)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text variant="titleMedium" style={styles.greeting}>Hi {formatName(settings.name)} 👋,</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Your Future Expense Value</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Custom Dual-Pillar Chart Card */}
                <View style={styles.chartCard}>
                    <DualPillarChart
                        current={currentAnnual}
                        future={futureAnnual}
                        currentAge={settings.currentAge}
                        futureAge={settings.retirementAge}
                    />
                </View>

                <View style={styles.retirementHeader}>
                    <Text style={styles.sectionTitle}>Retirement Value</Text>
                    <Avatar.Icon size={24} icon="walk" style={styles.sectionIcon} color="#333" />
                </View>

                {/* Compact Premium Cards: Reduced Padding, Floating Badge */}

                {/* 1. Conservative (Recommended) */}
                <View style={styles.cardContainer}>
                    {/* Floating Badge - Overlapping Border */}
                    <View style={styles.floatingBadge}>
                        <Text style={styles.badgeText}>RECOMMENDED</Text>
                    </View>

                    <Card style={[styles.planCard, styles.recommendedCardBorder]}>
                        <Card.Content style={styles.planContent}>
                            <View style={styles.planInfo}>
                                <Text style={styles.planTitle}>Conservative (33x)</Text>
                                <Text style={styles.planSub}>SWR - 3%</Text>
                                <Text style={styles.corpusValue}>{formatValue(corpus33)}</Text>
                            </View>
                            <View style={styles.cardVisual}>
                                <Avatar.Icon size={50} icon="shield-check" style={{ backgroundColor: '#E8F5E9' }} color="#1B5E20" />
                            </View>
                        </Card.Content>
                    </Card>
                </View>

                {/* 2. Moderate */}
                <Card style={styles.planCard}>
                    <Card.Content style={styles.planContent}>
                        <View style={styles.planInfo}>
                            <Text style={styles.planTitle}>Moderate (30x)</Text>
                            <Text style={styles.planSub}>SWR - 3.3%</Text>
                            <Text style={styles.corpusValue}>{formatValue(corpus30)}</Text>
                        </View>
                        <View style={styles.cardVisual}>
                            <Avatar.Icon size={50} icon="scale-balance" style={{ backgroundColor: '#FFF3E0' }} color="#E65100" />
                        </View>
                    </Card.Content>
                </Card>

                {/* 3. Optimistic */}
                <Card style={styles.planCard}>
                    <Card.Content style={styles.planContent}>
                        <View style={styles.planInfo}>
                            <Text style={styles.planTitle}>Optimistic (25x)</Text>
                            <Text style={styles.planSub}>SWR - 4%</Text>
                            <Text style={styles.corpusValue}>{formatValue(corpus25)}</Text>
                        </View>
                        <View style={styles.cardVisual}>
                            <Avatar.Icon size={50} icon="weather-sunny" style={{ backgroundColor: '#E0F2F1' }} color="#00695C" />
                        </View>
                    </Card.Content>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8, // Compressed
        paddingBottom: 2,
        backgroundColor: '#fff',
    },
    headerTextContainer: {
        marginBottom: 4,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '600',
        color: '#536DFE', // Blue from reference
        marginBottom: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 22,
        fontWeight: '800', // ExtraBold
        color: '#1C1C1E',
        flex: 1,
        flexWrap: 'wrap',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 8,
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 12, // Compact
        paddingHorizontal: 16,
        marginBottom: 16, // Compressed
        borderWidth: 1,
        borderColor: '#F5F5F7',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    retirementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 0,
    },
    sectionIcon: {
        backgroundColor: 'transparent',
        margin: 0,
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    cardContainer: {
        position: 'relative',
        marginBottom: 12,
        zIndex: 10,
    },
    planCard: {
        marginBottom: 12, // Compact spacing
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        borderWidth: 0,
    },
    recommendedCardBorder: {
        borderWidth: 1.5,
        borderColor: '#4CAF50', // Highlight border
    },
    floatingBadge: {
        position: 'absolute',
        top: -10, // Floating slightly above
        right: 12,
        backgroundColor: '#4CAF50',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        zIndex: 20, // Check elevation on Android
        elevation: 5,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900', // Boldest
        letterSpacing: 0.5,
    },
    planContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14, // Compact Padding (from 24 -> 14)
        paddingHorizontal: 16,
    },
    planInfo: {
        flex: 1,
        paddingRight: 10,
        justifyContent: 'center',
    },
    cardVisual: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    planTitle: {
        fontWeight: '700',
        fontSize: 15,
        color: '#1C1C1E',
        marginBottom: 2,
    },
    planSub: {
        fontSize: 12,
        color: '#8A8A8F',
        fontWeight: '500',
        opacity: 0.7,
    },
    corpusValue: {
        fontWeight: '800',
        fontSize: 24, // Compact ExtraBold
        color: '#1C1C1E',
        marginTop: 4,
    },
});
