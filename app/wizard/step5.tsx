import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/store/atoms';


const { width } = Dimensions.get('window');

const InflationOption = ({ value, description, tag, selected, onSelect }: any) => (
    <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.9}
        style={[styles.option, selected && styles.optionSelected]}
    >
        <View style={styles.optionContent}>
            <View>
                <Text style={[styles.optionValue, selected && styles.optionValueSelected]}>{value}%</Text>
                <Text style={[styles.optionTag, selected && styles.optionTagSelected]}>{tag}</Text>
            </View>
            <Text style={[styles.optionDesc, selected && styles.optionDescSelected]}>{description}</Text>
        </View>
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
        router.push('/calculator/baseline');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <Text style={styles.stepLabel}>Step 4 of 4</Text>
                    <ProgressBar progress={1.0} color="#1976D2" style={styles.progressBar} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>How fast will your expenses grow?</Text>
                    <Text style={styles.subtitle}>This directly affects how much money you’ll need in retirement.</Text>
                    <Text style={styles.helperLine}>Most people underestimate inflation. Choosing a higher value makes your plan safer.</Text>
                </View>

                {/* Vertical Option Cards */}
                <View style={styles.optionsContainer}>
                    <InflationOption
                        value={6}
                        description="Based on long-term inflation averages"
                        tag="Historical"
                        selected={inflation === 6}
                        onSelect={() => setInflation(6)}
                    />
                    <InflationOption
                        value={7}
                        description="Safer for long-term retirement planning"
                        tag="Recommended"
                        selected={inflation === 7}
                        onSelect={() => setInflation(7)}
                    />
                    <InflationOption
                        value={8}
                        description="Protects against worst-case cost increases"
                        tag="Conservative"
                        selected={inflation === 8}
                        onSelect={() => setInflation(8)}
                    />
                </View>

                <Text style={styles.reassurance}>You can change this assumption later if your situation changes.</Text>

                <View style={{ flex: 1 }} />

                {/* CTA */}
                <Button
                    mode="contained"
                    onPress={handleFinish}
                    style={styles.nextButton}
                    contentStyle={styles.btnContent}
                    labelStyle={styles.btnLabel}
                >
                    See My Retirement Plan
                </Button>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, padding: 24 },

    progressContainer: { marginBottom: 24 },
    stepLabel: { fontSize: 12, fontWeight: '700', color: '#90A4AE', marginBottom: 8, textTransform: 'uppercase' },
    progressBar: { borderRadius: 4, height: 6, backgroundColor: '#F5F7FA' },

    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: '#263238', marginBottom: 8, lineHeight: 34 },
    subtitle: { fontSize: 15, color: '#546E7A', lineHeight: 22, marginBottom: 8 },
    helperLine: { fontSize: 13, color: '#90A4AE', lineHeight: 18, fontStyle: 'italic' },

    optionsContainer: { flexDirection: 'column', gap: 12 },
    option: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#ECEFF1',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    optionSelected: {
        backgroundColor: '#F3F8FD',
        borderColor: '#1976D2',
        borderWidth: 2,
        transform: [{ scale: 1.02 }], // Subtle scale
        shadowOpacity: 0.1,
    },
    optionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    optionValue: { fontSize: 24, fontWeight: '800', color: '#546E7A' },
    optionValueSelected: { color: '#1976D2' },

    optionDesc: { flex: 1, fontSize: 14, color: '#78909C', marginLeft: 16, lineHeight: 20 },
    optionDescSelected: { color: '#455A64', fontWeight: '500' },

    optionTag: { fontSize: 10, fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', marginTop: 4 },
    optionTagSelected: { color: '#1976D2' },

    reassurance: { textAlign: 'center', marginTop: 24, fontSize: 12, color: '#B0BEC5' },

    nextButton: { borderRadius: 16, backgroundColor: '#1976D2', marginBottom: 10 },
    btnContent: { height: 56 },
    btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
