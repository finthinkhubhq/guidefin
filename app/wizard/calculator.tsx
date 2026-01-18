import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '../../src/store/atoms';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

// Reusable Input Card Component
const InputCard = ({ label, value, unit, min, max, step, onChange, color }: any) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>{value} <Text style={styles.cardUnit}>{unit}</Text></Text>
        </View>
        <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor={color}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={color}
        />
    </View>
);

export default function CalculatorScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { settings, setSettings } = useSettingsStore();

    // State for inputs
    const [name, setName] = useState(settings.name || '');
    const [age, setAge] = useState(Number(params.initialAge) || settings.currentAge || 25);
    const [retireAge, setRetireAge] = useState(Number(params.initialRetireAge) || settings.retirementAge || 60);
    const [monthlyExpense, setMonthlyExpense] = useState(50000); // Default 50k
    const [inflation, setInflation] = useState(settings.inflation || 6);

    const handleCalculate = () => {
        // Save to store
        setSettings({
            ...settings,
            name: name,
            currentAge: age,
            retirementAge: retireAge,
            monthlyExpenses: monthlyExpense,
            inflation: inflation,
        });

        // Navigate to dashboard/results
        router.push('/dashboard');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={[theme.colors.background.primary, '#000']}
                style={{ display: 'none' }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    {router.canGoBack() ? (
                        <IconButton icon="arrow-left" iconColor={theme.colors.text.primary} size={24} onPress={() => router.back()} />
                    ) : (
                        <View style={{ width: 48 }} /> // Spacer if no back button
                    )}
                    <Text style={styles.headerTitle}>Design Your Future</Text>
                    <View style={{ width: 48 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>About You</Text>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardLabel}>What should we call you?</Text>
                        </View>
                        <TextInput
                            style={styles.textInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Type your name"
                            placeholderTextColor={theme.colors.text.muted}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>The Basics</Text>

                    <InputCard
                        label="Current Age"
                        value={age}
                        unit="y.o"
                        min={18}
                        max={60}
                        step={1}
                        onChange={setAge}
                        color={theme.colors.text.accent}
                    />

                    <InputCard
                        label="Retire At"
                        value={retireAge}
                        unit="y.o"
                        min={age + 1} // Can't retire before now
                        max={80}
                        step={1}
                        onChange={setRetireAge}
                        color={theme.colors.text.highlight}
                    />

                    <Text style={styles.sectionTitle}>Financials</Text>

                    <InputCard
                        label="Monthly Expense"
                        value={monthlyExpense}
                        unit="₹"
                        min={10000}
                        max={500000}
                        step={5000}
                        onChange={setMonthlyExpense}
                        color="#34D399"
                    />

                    <InputCard
                        label="Expected Inflation"
                        value={inflation}
                        unit="%"
                        min={4}
                        max={12}
                        step={0.5}
                        onChange={setInflation}
                        color="#EF4444"
                    />

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleCalculate}>
                        <LinearGradient
                            colors={theme.colors.gradient.button as unknown as string[]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Generate Plan</Text>
                            <IconButton icon="lightning-bolt" iconColor="#FFF" size={24} style={{ margin: 0 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    background: { display: 'none' }, // Remove gradient background
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text.primary },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text.muted, marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },

    card: {
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.borderRadius.l,
        padding: 20,
        marginBottom: 16,
        elevation: 2, // Standard shadow
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    cardLabel: { fontSize: 16, color: theme.colors.text.secondary, fontWeight: '500' },
    cardValue: { fontSize: 24, color: theme.colors.text.primary, fontWeight: '700' },
    cardUnit: { fontSize: 14, color: theme.colors.text.muted, fontWeight: '400' },
    slider: { width: '105%', marginLeft: '-2.5%' }, // Slight adjustment for visual alignment

    textInput: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: 8,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#FFFFFF', // Solid White Footer
        borderTopWidth: 1,
        borderTopColor: theme.colors.border
    },
    button: {
        borderRadius: theme.borderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: theme.colors.text.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginRight: 8 },
});
