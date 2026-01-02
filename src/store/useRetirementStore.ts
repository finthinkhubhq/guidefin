import { create } from 'zustand';

export type RetirementPhase = 'INPUT' | 'BASELINE' | 'STRESS_TEST';

export interface RetirementInputs {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    monthlyExpense: number;
    inflationRate: number;
    equityRatio: number;
}

export interface BaselineResult {
    annualExpenseAtRetirement: number;
    baselineCorpus: number;
    simpleCorpus: number; // New field for "Minimum Requirement"
    realReturn: number;
}

export interface StressTestResult {
    successRate: number;
    medianDuration: number;
    worstCaseDuration: number;
    medianLegacy: number;
    simulationCount: number;
}

interface RetirementState {
    phase: RetirementPhase;
    inputs: RetirementInputs | null;
    baseline: BaselineResult | null;
    stressTest: StressTestResult | null;

    setInputs: (inputs: RetirementInputs) => void;
    setBaselineResult: (baseline: BaselineResult) => void;
    setStressTestResult: (stressTest: StressTestResult) => void;
    resetRetirementPlan: () => void;
}

export const useRetirementStore = create<RetirementState>((set, get) => ({
    phase: 'INPUT',
    inputs: null,
    baseline: null,
    stressTest: null,

    setInputs: (inputs) =>
        set(() => ({
            inputs,
            phase: 'INPUT',
            baseline: null,
            stressTest: null,
        })),

    setBaselineResult: (baseline) =>
        set((state) => {
            if (!state.inputs) {
                console.warn('Baseline cannot be set without inputs');
                return state;
            }
            return {
                baseline,
                phase: 'BASELINE',
                stressTest: null,
            };
        }),

    setStressTestResult: (stressTest) =>
        set((state) => {
            if (!state.baseline) {
                console.warn('Stress test cannot run without baseline');
                return state;
            }
            return {
                stressTest,
                phase: 'STRESS_TEST',
            };
        }),

    resetRetirementPlan: () =>
        set(() => ({
            phase: 'INPUT',
            inputs: null,
            baseline: null,
            stressTest: null,
        })),
}));
