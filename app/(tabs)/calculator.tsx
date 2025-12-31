
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';
import { Text, TextInput as PaperInput } from 'react-native-paper';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../src/theme';
import { BarChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function CalculatorScreen() {
  const { expenses, setExpenses } = useExpensesStore();
  const { settings, setSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('retirement');
  const [corpusResults, setCorpusResults] = useState<{
    futureProjectedExpense: number;
    optimistic: number;
    moderate: number;
    conservative: number;
  } | null>(null);

  // --- Logic (Kept same) ---
  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.monthly, 0);
  const totalAnnual = expenses.reduce((sum, exp) => sum + exp.annual, 0);

  const handleMonthlyChange = (id: string, value: string) => {
    if (value === '' || value === '.') {
      setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, monthly: 0, annual: 0 } : exp));
      return;
    }
    const numValue = parseFloat(value) || 0;
    const annual = numValue * 12;
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, monthly: numValue, annual } : exp));
  };

  const handleAnnualChange = (id: string, value: string) => {
    if (value === '' || value === '.') {
      setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, monthly: 0, annual: 0 } : exp));
      return;
    }
    const numValue = parseFloat(value) || 0;
    const monthly = numValue / 12;
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, annual: numValue, monthly } : exp));
  };

  const calculateCorpus = () => {
    const N = settings.retirementAge - settings.currentAge;
    if (N <= 0) {
      Alert.alert('Error', 'Retirement age must be greater than current age');
      return;
    }
    const totalAnnualExpense = expenses.reduce((sum, exp) => sum + exp.annual, 0);
    if (totalAnnualExpense <= 0) {
      Alert.alert('Error', 'Please enter at least one expense');
      return;
    }
    const inflationFactor = Math.pow(1 + settings.inflation / 100, N);
    const futureProjectedExpense = totalAnnualExpense * inflationFactor;

    setCorpusResults({
      futureProjectedExpense,
      optimistic: 25 * futureProjectedExpense,
      moderate: 30 * futureProjectedExpense,
      conservative: 33 * futureProjectedExpense,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return formatCurrency(amount);
  };

  // --- Premium Components ---

  const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.glassCardContainer, style]}>
      <LinearGradient
        colors={theme.colors.gradient.card as any}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardBorder} />
        {children}
      </LinearGradient>
    </View>
  );

  const PremiumButton = ({ title, onPress, secondary = false }: { title: string, onPress: () => void, secondary?: boolean }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.buttonShadow}>
      <LinearGradient
        colors={secondary ? theme.colors.gradient.buttonSecondary as any : theme.colors.gradient.button as any}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderChart = () => {
    if (!corpusResults) return null;
    const data = [
      { value: corpusResults.optimistic, label: '25x', frontColor: '#4ECCA3' },
      { value: corpusResults.moderate, label: '30x', frontColor: '#FFD369' },
      { value: corpusResults.conservative, label: '33x', frontColor: '#E94560' },
    ];

    return (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <BarChart
          data={data}
          barWidth={40}
          noOfSections={4}
          barBorderRadius={4}
          frontColor="lightgray"
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: theme.colors.text.secondary }}
          xAxisLabelTextStyle={{ color: theme.colors.text.primary, fontWeight: 'bold' }}
          hideRules
          width={width - 100}
          height={200}
          isAnimated
        />
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Guidefin</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('retirement')} style={[styles.tabPill, activeTab === 'retirement' && styles.activeTabPill]}>
              <Text style={[styles.tabText, activeTab === 'retirement' && styles.activeTabText]}>Retirement</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('expense')} style={[styles.tabPill, activeTab === 'expense' && styles.activeTabPill]}>
              <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>Expenses</Text>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardSafeLayout>
          <View style={styles.scrollContent}>
            {/* Section: Expenses */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Monthly Expenses</Text>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalBadgeText}>{formatShortCurrency(totalMonthly)}/mo</Text>
                </View>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, { flex: 1.5 }]}>Category</Text>
                <Text style={styles.colHead}>Monthly</Text>
                <Text style={styles.colHead}>Annual</Text>
              </View>

              <View style={styles.expenseList}>
                {expenses.map((expense) => (
                  <View key={expense.id} style={styles.row}>
                    <Text style={[styles.rowText, { flex: 1.5 }]}>{expense.name}</Text>
                    <PaperInput
                      style={styles.input}
                      textColor={theme.colors.text.primary}
                      underlineColor="transparent"
                      activeUnderlineColor={theme.colors.text.accent}
                      value={expense.monthly === 0 ? '' : expense.monthly.toString()}
                      onChangeText={(v) => handleMonthlyChange(expense.id, v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.text.muted}
                      dense
                    />
                    <PaperInput
                      style={styles.input}
                      textColor={theme.colors.text.secondary}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      value={expense.annual === 0 ? '' : expense.annual.toString()}
                      onChangeText={(v) => handleAnnualChange(expense.id, v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.colors.text.muted}
                      dense
                    />
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Section: Retirement Config */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.configRow}>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Current Age</Text>
                  <PaperInput
                    style={styles.configInput}
                    textColor={theme.colors.text.primary}
                    value={settings.currentAge.toString()}
                    onChangeText={(v) => setSettings({ ...settings, currentAge: parseFloat(v) || 0 })}
                    keyboardType="numeric"
                    dense
                    underlineColor='transparent'
                    activeUnderlineColor={theme.colors.text.accent}
                  />
                </View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Retirement Age</Text>
                  <PaperInput
                    style={styles.configInput}
                    textColor={theme.colors.text.primary}
                    value={settings.retirementAge.toString()}
                    onChangeText={(v) => setSettings({ ...settings, retirementAge: parseFloat(v) || 0 })}
                    keyboardType="numeric"
                    dense
                    underlineColor='transparent'
                    activeUnderlineColor={theme.colors.text.accent}
                  />
                </View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Inflation (%)</Text>
                  <PaperInput
                    style={styles.configInput}
                    textColor={theme.colors.text.primary}
                    value={settings.inflation.toString()}
                    onChangeText={(v) => setSettings({ ...settings, inflation: parseFloat(v) || 0 })}
                    keyboardType="numeric"
                    dense
                    underlineColor='transparent'
                    activeUnderlineColor={theme.colors.text.accent}
                  />
                </View>
              </View>
            </GlassCard>

            <View style={{ marginVertical: 10 }}>
              <PremiumButton title="Calculate Future" onPress={calculateCorpus} />
            </View>

            {/* Results Area */}
            {corpusResults && (
              <GlassCard style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 5 }]}>
                  Corpus Required at {settings.retirementAge}
                </Text>
                <Text style={{ textAlign: 'center', color: theme.colors.text.secondary, marginBottom: 20 }}>
                  Future Expense: {formatCurrency(corpusResults.futureProjectedExpense)} / yr
                </Text>

                {renderChart()}

                <View style={styles.resultsGrid}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Conservative (33x)</Text>
                    <Text style={[styles.resultValue, { color: '#E94560' }]}>{formatShortCurrency(corpusResults.conservative)}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Moderate (30x)</Text>
                    <Text style={[styles.resultValue, { color: '#FFD369' }]}>{formatShortCurrency(corpusResults.moderate)}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Optimistic (25x)</Text>
                    <Text style={[styles.resultValue, { color: '#4ECCA3' }]}>{formatShortCurrency(corpusResults.optimistic)}</Text>
                  </View>
                </View>
              </GlassCard>
            )}

            <View style={{ height: 100 }} />
          </View>
        </KeyboardSafeLayout>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text.primary,
    marginBottom: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 4,
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  activeTabPill: {
    backgroundColor: theme.colors.text.accent,
  },
  tabText: {
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
  },
  glassCardContainer: {
    borderRadius: theme.borderRadius.l,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionCard: {
    // additional styles if needed
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalBadge: {
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 69, 96, 0.5)',
  },
  totalBadgeText: {
    color: theme.colors.text.accent,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 5,
  },
  colHead: {
    flex: 1,
    color: theme.colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expenseList: {
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 40,
  },
  rowText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.input.background,
    height: 36,
    fontSize: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  configItem: {
    flex: 1,
    alignItems: 'center',
  },
  configLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginBottom: 5,
  },
  configInput: {
    width: '100%',
    backgroundColor: theme.colors.input.background,
    height: 45,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonShadow: {
    shadowColor: theme.colors.text.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultsGrid: {
    marginTop: 20,
    gap: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 10,
  },
  resultLabel: {
    color: theme.colors.text.secondary,
  },
  resultValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

