import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, useExpensesStore } from '../store/atoms';
import { useRetirementStore, RetirementInputs } from '../store/useRetirementStore';
import { calculateBaseline } from '../services/retirementCalculator';
import WizardHeader from '../components/WizardHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

export default function RetirementInputScreen() {
    const router = useRouter(); // <--- Added router
    const { setInputs, setBaselineResult, resetRetirementPlan } = useRetirementStore();

    const { settings } = useSettingsStore();
    const { expenses } = useExpensesStore();

    // 1. Initialize local state
    const [localInputs, setLocalInputs] = useState<RetirementInputs>({
        currentAge: settings.currentAge || 30,
        retirementAge: settings.retirementAge || 60,
        lifeExpectancy: settings.lifeExpectancy || 85,
        monthlyExpense: expenses.reduce((sum, item) => sum + item.monthly, 0) || 50000,
        inflationRate: (settings.inflation || 6) / 100,
        equityRatio: 0.6,
    });

    // 2. Sync with Settings when they change (e.g. returning from Wizard)
    useEffect(() => {
        setLocalInputs({
            currentAge: settings.currentAge || 30,
            retirementAge: settings.retirementAge || 60,
            lifeExpectancy: settings.lifeExpectancy || 85,
            monthlyExpense: expenses.reduce((sum, item) => sum + item.monthly, 0) || 50000,
            inflationRate: (settings.inflation || 6) / 100,
            equityRatio: 0.6,
        });

        // Clear previous results when we are back on the input screen
        // resetRetirementPlan(); // Optional: clears results immediately
    }, [settings, expenses]);

    const handleCalculate = () => {
        const baselineResult = calculateBaseline(localInputs);
        setInputs(localInputs);
        setBaselineResult(baselineResult);
    };

    const handleRestart = () => {
        router.push('/wizard/step2');
    };

    const InputCard = ({ label, value, subtext }: { label: string; value: string; subtext?: string }) => (
        <View style={styles.inputCard}>
            <View style={styles.textContainer}>
                <Text style={styles.inputLabel}>{label}</Text>
                {subtext && <Text style={styles.inputSubtext}>{subtext}</Text>}
            </View>
            <View style={styles.valueContainer}>
                <Text style={styles.inputValue}>{value}</Text>
                {/* Edit Icon Removed per user request */}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <WizardHeader currentStep="INPUT" />

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                <View style={styles.headerSection}>
                    <Text style={styles.title}>Confirm Your Details</Text>
                    <Text style={styles.subtitle}>Review your details before we calculate your retirement needs.</Text>
                </View>

                {/* Section 1: Personal Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <InputCard label="Current Age" value={`${localInputs.currentAge} years`} />
                    <InputCard label="Retirement Age" value={`${localInputs.retirementAge} years`} />
                    <InputCard label="Life Expectancy" value={`${localInputs.lifeExpectancy} years`} />
                </View>

                {/* Section 2: Financial Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Goals</Text>
                    <InputCard label="Monthly Expense (Today)" value={`₹ ${localInputs.monthlyExpense.toLocaleString()}`} />
                    <InputCard label="Expected Inflation" value={`${(localInputs.inflationRate * 100).toFixed(0)}%`} />
                    <InputCard
                        label="Assumed Return (Blended)"
                        value="8.5%"
                        subtext={`Based on ${(localInputs.equityRatio * 100).toFixed(0)}% Equity / ${(100 - localInputs.equityRatio * 100).toFixed(0)}% Debt`}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handleCalculate} style={styles.button}>
                        <Text style={styles.buttonText}>Calculate Retirement Estimate</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
                        <Text style={styles.restartText}>Need to change something? Restart</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },

    headerSection: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#263238', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#546E7A', lineHeight: 22 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#546E7A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

    inputCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ECEFF1',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
    },
    textContainer: { flex: 1, marginRight: 16 },
    inputLabel: { fontSize: 14, color: '#37474F', fontWeight: '500', marginBottom: 2 },
    inputSubtext: { fontSize: 11, color: '#90A4AE' },

    valueContainer: { flexDirection: 'row', alignItems: 'center' },
    inputValue: { fontSize: 16, fontWeight: '700', color: '#263238', marginRight: 8 },
    editIcon: { opacity: 0.5 },

    footer: { marginTop: 8 },
    button: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        paddingVertical: 18,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2196F3',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4
    },
    buttonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },

    restartButton: { marginTop: 16, alignItems: 'center', padding: 12 },
    restartText: { color: '#90A4AE', fontWeight: '600', fontSize: 13, textDecorationLine: 'underline' }
});
