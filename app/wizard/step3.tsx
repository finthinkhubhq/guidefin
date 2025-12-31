import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { Text, Button, ProgressBar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/store/atoms';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';

export default function WizardStep3() {
    const router = useRouter();
    const { settings, setSettings } = useSettingsStore();
    const [lifeExpectancy, setLifeExpectancy] = useState<string>(String(settings.lifeExpectancy || 90));

    const handleNext = () => {
        const age = parseInt(lifeExpectancy);

        if (isNaN(age)) {
            Alert.alert("Invalid Age", "Please enter a valid number.");
            return;
        }

        if (age < 70) {
            Alert.alert("Invalid Age", "Life expectancy cannot be less than 70 years.");
            return;
        }

        if (age < settings.retirementAge) {
            Alert.alert("Invalid Age", `Life expectancy cannot be less than your retirement age (${settings.retirementAge}).`);
            return;
        }

        setSettings({
            ...settings,
            lifeExpectancy: age
        });
        router.push('/wizard/step4');
    };

    const increment = () => {
        const age = parseInt(lifeExpectancy) || 90;
        setLifeExpectancy(String(age + 1));
    };

    const decrement = () => {
        const age = parseInt(lifeExpectancy) || 90;
        const newAge = Math.max(age - 1, 70); // Don't go below 70 via buttons
        setLifeExpectancy(String(newAge));
    };

    return (
        <KeyboardSafeLayout>
            <View style={styles.container}>
                <View style={styles.content}>

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.stepLabel}>Step 3 of 5</Text>
                        <ProgressBar progress={0.6} color="#1976D2" style={styles.progressBar} />
                    </View>

                    {/* Question */}
                    <Text style={styles.question}>How long should your money last?</Text>
                    <Text style={styles.helper}>We recommend planning for a longer life (e.g. 90) to be safe.</Text>

                    {/* Input: Editable + Stepper */}
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity onPress={decrement} style={styles.stepBtn}>
                            <IconButton icon="minus" iconColor="#1976D2" size={32} />
                        </TouchableOpacity>

                        <View style={styles.valueBox}>
                            <TextInput
                                style={styles.valueInput}
                                value={lifeExpectancy}
                                onChangeText={setLifeExpectancy}
                                keyboardType="number-pad"
                                maxLength={3}
                                returnKeyType="done"
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />
                            <Text style={styles.valueLabel}>YEARS OLD</Text>
                        </View>

                        <TouchableOpacity onPress={increment} style={styles.stepBtn}>
                            <IconButton icon="plus" iconColor="#1976D2" size={32} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }} />

                    {/* CTA */}
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.nextButton}
                        contentStyle={styles.btnContent}
                        labelStyle={styles.btnLabel}
                    >
                        Next Step
                    </Button>

                </View>
            </View>
        </KeyboardSafeLayout>
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

    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 40, gap: 20 },
    stepBtn: { backgroundColor: '#E3F2FD', borderRadius: 20, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },

    valueBox: { alignItems: 'center', minWidth: 140 }, // Increased width for visibility
    valueInput: { fontSize: 56, fontWeight: '800', color: '#1976D2', textAlign: 'center', width: '100%', height: 80 }, // Increased height
    valueLabel: { fontSize: 12, fontWeight: '700', color: '#90A4AE', letterSpacing: 1 },

    nextButton: { borderRadius: 16, backgroundColor: '#1976D2', marginTop: 20 },
    btnContent: { height: 56 },
    btnLabel: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
