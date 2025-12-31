import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, TextInput, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExpensesStore } from '../../src/store/atoms';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';

const { width } = Dimensions.get('window');

export default function WizardStep4() {
    const router = useRouter();
    const { setExpenses } = useExpensesStore();
    const [amount, setAmount] = useState('');

    const handleNext = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            // Simplified: Overwrite with single expense entry
            setExpenses([
                { id: '1', name: 'General Expenses', monthly: val, annual: val * 12 }
            ]);
            router.push('/wizard/step5');
        }
    };

    const isValid = amount.length > 0 && !isNaN(Number(amount));

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardSafeLayout>
                <View style={styles.content}>

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.stepLabel}>Step 4 of 5</Text>
                        <ProgressBar progress={0.8} color="#1976D2" style={styles.progressBar} />
                    </View>

                    {/* Question */}
                    <Text style={styles.question}>What is your total monthly spend?</Text>
                    <Text style={styles.helper}>Include rent, bills, food, and lifestyle costs.</Text>

                    {/* Input */}
                    <View style={styles.inputGroup}>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Amount (₹)"
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            outlineStyle={styles.outline}
                            placeholderTextColor="#B0BEC5"
                            left={<TextInput.Affix text="₹" textStyle={{ fontWeight: '700', color: '#37474F' }} />}
                            theme={{ colors: { primary: '#1976D2', background: '#FFF' } }}
                        />
                    </View>

                    <View style={{ flex: 1 }} />

                    {/* CTA */}
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        disabled={!isValid}
                        style={[styles.nextButton, !isValid && { backgroundColor: '#ECEFF1' }]}
                        contentStyle={styles.btnContent}
                        labelStyle={[styles.btnLabel, !isValid && { color: '#B0BEC5' }]}
                    >
                        Next Step
                    </Button>

                </View>
            </KeyboardSafeLayout>
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

    inputGroup: { marginBottom: 24 },
    input: { backgroundColor: '#FFF', fontSize: 24, fontWeight: '700', height: 64 },
    outline: { borderRadius: 16, borderColor: '#CFD8DC' },

    nextButton: { borderRadius: 16, backgroundColor: '#1976D2', marginTop: 20 },
    btnContent: { height: 56 },
    btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
