import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import { Text, Button, ProgressBar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/store/atoms';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';

export default function WizardStep2() {
    const router = useRouter();
    const { settings, setSettings } = useSettingsStore();
    const [retireAge, setRetireAge] = useState<string>(String(settings.retirementAge || 60));

    const handleNext = () => {
        const age = parseInt(retireAge);

        if (isNaN(age)) {
            Alert.alert("Invalid Age", "Please enter a valid number.");
            return;
        }

        if (age < settings.currentAge) {
            Alert.alert("Invalid Age", `Retirement age cannot be less than your current age (${settings.currentAge}).`);
            return;
        }

        setSettings({
            ...settings,
            retirementAge: age
        });
        router.push('/wizard/step3');
    };

    const increment = () => {
        const age = parseInt(retireAge) || 60;
        setRetireAge(String(age + 1));
    };

    const decrement = () => {
        const age = parseInt(retireAge) || 60;
        const newAge = Math.max(age - 1, settings.currentAge); // Don't go below current age via buttons
        setRetireAge(String(newAge));
    };

    return (
        <KeyboardSafeLayout>
            <View style={styles.container}>
                <View style={styles.content}>

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                        <Text style={styles.stepLabel}>Step 2 of 5</Text>
                        <ProgressBar progress={0.4} color="#1976D2" style={styles.progressBar} />
                    </View>

                    {/* Question */}
                    <Text style={styles.question}>When do you plan to retire?</Text>
                    <Text style={styles.helper}>Most people target 60, but it's up to you.</Text>

                    {/* Input: Editable + Stepper */}
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity onPress={decrement} style={styles.stepBtn}>
                            <IconButton icon="minus" iconColor="#1976D2" size={32} />
                        </TouchableOpacity>

                        <View style={styles.valueBox}>
                            <TextInput
                                style={styles.valueInput}
                                value={retireAge}
                                onChangeText={setRetireAge}
                                keyboardType="number-pad"
                                maxLength={2}
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
