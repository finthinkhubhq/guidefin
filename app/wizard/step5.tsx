import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/store/atoms';

const { width } = Dimensions.get('window');

const InflationOption = ({ value, label, selected, onSelect }: any) => (
    <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.8}
        style={[styles.option, selected && styles.optionSelected]}
    >
        <Text style={[styles.optionValue, selected && styles.optionValueSelected]}>{value}%</Text>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
    </TouchableOpacity>
);

export default function WizardStep5() {
    const router = useRouter();
    const { settings, setSettings } = useSettingsStore();
    const [inflation, setInflation] = useState(settings.inflation || 6);

    const handleFinish = () => {
        setSettings({
            ...settings,
            inflation: inflation
        });
        router.push('/wizard/summary');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <Text style={styles.stepLabel}>Step 5 of 5</Text>
                    <ProgressBar progress={1.0} color="#1976D2" style={styles.progressBar} />
                </View>

                {/* Question */}
                <Text style={styles.question}>One last thing.</Text>
                <Text style={styles.helper}>How much do you think costs will rise each year (Inflation)?</Text>

                {/* Input: Chips */}
                <View style={styles.optionsContainer}>
                    <InflationOption
                        value={6}
                        label="Historical"
                        selected={inflation === 6}
                        onSelect={() => setInflation(6)}
                    />
                    <InflationOption
                        value={7}
                        label="Recommended"
                        selected={inflation === 7}
                        onSelect={() => setInflation(7)}
                    />
                    <InflationOption
                        value={8}
                        label="Conservative"
                        selected={inflation === 8}
                        onSelect={() => setInflation(8)}
                    />
                </View>

                <View style={{ flex: 1 }} />

                {/* CTA */}
                <Button
                    mode="contained"
                    onPress={handleFinish}
                    style={styles.nextButton}
                    contentStyle={styles.btnContent}
                    labelStyle={styles.btnLabel}
                >
                    Calculate My Plan
                </Button>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, padding: 24 },

    progressContainer: { marginBottom: 32 },
    stepLabel: { fontSize: 12, fontWeight: '700', color: '#90A4AE', marginBottom: 8, textTransform: 'uppercase' },
    progressBar: { borderRadius: 4, height: 6, backgroundColor: '#F5F7FA' },

    question: { fontSize: 28, fontWeight: '800', color: '#263238', marginBottom: 8, lineHeight: 36 },
    helper: { fontSize: 16, color: '#546E7A', lineHeight: 24, marginBottom: 40 },

    optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    option: { flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16, backgroundColor: '#F5F7FA', borderWidth: 2, borderColor: '#F5F7FA' },
    optionSelected: { backgroundColor: '#E3F2FD', borderColor: '#1976D2' },

    optionValue: { fontSize: 24, fontWeight: '800', color: '#546E7A', marginBottom: 4 },
    optionValueSelected: { color: '#1976D2' },

    optionLabel: { fontSize: 10, fontWeight: '700', color: '#90A4AE', textTransform: 'uppercase' },
    optionLabelSelected: { color: '#1976D2' },

    nextButton: { borderRadius: 16, backgroundColor: '#1976D2', marginTop: 20 },
    btnContent: { height: 56 },
    btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
