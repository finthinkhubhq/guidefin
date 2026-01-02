import { useEffect } from 'react';
import { router } from 'expo-router';
import { useRetirementStore } from '../../../src/store/useRetirementStore';
import RetirementInputScreen from '../../../src/screens/RetirementInputScreen';

export default function CalculatorIndex() {
    const phase = useRetirementStore((s) => s.phase);

    useEffect(() => {
        if (phase === 'BASELINE') {
            router.replace('/calculator/baseline');
        }
        if (phase === 'STRESS_TEST') {
            router.replace('/calculator/stress');
        }
    }, [phase]);

    return <RetirementInputScreen />;
}
