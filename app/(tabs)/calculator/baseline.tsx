import { useEffect } from 'react';
import { router } from 'expo-router';
import { useRetirementStore } from '../../../src/store/useRetirementStore';
import RetirementBaselineScreen from '../../../src/screens/RetirementBaselineScreen';

export default function BaselineRoute() {
    const phase = useRetirementStore((s) => s.phase);

    // useEffect(() => {
    //     if (phase !== 'BASELINE') {
    //         router.replace('/calculator');
    //     }
    // }, [phase]);

    return <RetirementBaselineScreen />;
}
