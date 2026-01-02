import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type WizardStep = 'INPUT' | 'BASELINE' | 'STRESS_TEST';

interface WizardHeaderProps {
    currentStep: WizardStep;
}

export default function WizardHeader({ currentStep }: WizardHeaderProps) {
    const steps: { key: WizardStep; label: string }[] = [
        { key: 'INPUT', label: 'Inputs' },
        { key: 'BASELINE', label: 'Baseline' },
        { key: 'STRESS_TEST', label: 'Stress Test' },
    ];

    const getStepStatus = (stepKey: WizardStep) => {
        const stepOrder = ['INPUT', 'BASELINE', 'STRESS_TEST'];
        const currentIndex = stepOrder.indexOf(currentStep);
        const stepIndex = stepOrder.indexOf(stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'inactive';
    };

    return (
        <View style={styles.container}>
            {steps.map((step, index) => {
                const status = getStepStatus(step.key);
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.key} style={styles.stepContainer}>
                        <View style={styles.bubbleContainer}>
                            <View style={[
                                styles.bubble,
                                status === 'active' && styles.bubbleActive,
                                status === 'completed' && styles.bubbleCompleted,
                                status === 'inactive' && styles.bubbleInactive
                            ]}>
                                <Text style={[
                                    styles.stepNumber,
                                    status === 'active' && styles.stepNumberActive,
                                    status === 'completed' && styles.stepNumberCompleted
                                ]}>
                                    {index + 1}
                                </Text>
                            </View>
                            {!isLast && <View style={[styles.line, status === 'completed' ? styles.lineCompleted : styles.lineInactive]} />}
                        </View>
                        <Text style={[
                            styles.label,
                            status === 'active' && styles.labelActive,
                            status === 'completed' && styles.labelCompleted
                        ]}>
                            {step.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
    },
    bubbleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        width: '100%',
        justifyContent: 'center',
    },
    line: {
        position: 'absolute',
        top: 14,
        left: '50%',
        width: '100%', // Spans to the next container's center
        height: 2,
        zIndex: -1,
    },
    lineInactive: {
        backgroundColor: '#f0f0f0',
    },
    lineCompleted: {
        backgroundColor: '#4CAF50',
    },
    bubble: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        zIndex: 1,
        backgroundColor: '#fff',
    },
    bubbleInactive: {
        borderColor: '#e0e0e0',
    },
    bubbleActive: {
        borderColor: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    bubbleCompleted: {
        borderColor: '#4CAF50',
        backgroundColor: '#4CAF50',
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9E9E9E',
    },
    stepNumberActive: {
        color: '#1976D2',
    },
    stepNumberCompleted: {
        color: '#fff',
    },
    label: {
        fontSize: 10,
        color: '#9E9E9E',
        fontWeight: '500',
    },
    labelActive: {
        color: '#1976D2',
        fontWeight: '700',
    },
    labelCompleted: {
        color: '#4CAF50',
    },
});
