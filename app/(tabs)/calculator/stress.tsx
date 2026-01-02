import { useEffect } from 'react';
import { router } from 'expo-router';
import { useRetirementStore } from '../../../src/store/useRetirementStore';
import RetirementStressTestScreen from '../../../src/screens/RetirementStressTestScreen';

export default function StressRoute() {
    const phase = useRetirementStore((s) => s.phase);

    // useEffect(() => {
    //     if (phase !== 'STRESS_TEST') {
    //         router.replace('/calculator');
    //     }
    // }, [phase]);

    return <RetirementStressTestScreen />;
}
