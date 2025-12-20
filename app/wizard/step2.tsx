import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, useExpensesStore } from '../../src/store/atoms';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WizardStep2() {
    const router = useRouter();
    const { expenses } = useExpensesStore();
    const { settings, setSettings } = useSettingsStore();
    const [inflationInput, setInflationInput] = useState(settings.inflation > 0 ? settings.inflation.toString() : '');

    // Calculate totals
    const totalMonthly = expenses.reduce((sum, item) => sum + item.monthly, 0);
    const totalYearly = expenses.reduce((sum, item) => sum + item.annual, 0);

    // Indian Currency Formatting
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN');
    };

    const updateSetting = (key: string, value: string) => {
        let val = parseFloat(value) || 0;
        if (key === 'retirementAge') {
            if (val > 120) val = 120;
        }
        setSettings({
            ...settings,
            [key]: val
        });
    };

    const handleInflationChange = (text: string) => {
        if (text === '' || /^\d*\.?\d{0,1}$/.test(text)) {
            setInflationInput(text);
            const val = parseFloat(text);
            setSettings({
                ...settings,
                inflation: isNaN(val) ? 0 : val
            });
        }
    };

    const formatName = (name: string) => {
        if (!name) return 'User';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Compact Header */}
            <View style={styles.header}>
                <Text variant="titleLarge" style={styles.greeting}>Hi {formatName(settings.name)} 👋,</Text>
                <Text
                    style={styles.title}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    Your Current Expense Summary
                </Text>
                <Text style={styles.subtitle}>A quick snapshot of your current spending provided.</Text>
            </View>

            {/* Premium Summary Card (Horizontal) */}
            <View style={styles.cardContainer}>
                <View style={styles.summaryCard}>
                    <View style={styles.gridContainer}>

                        {/* Monthly Column */}
                        <View style={styles.gridColumn}>
                            <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                                <IconButton icon="calendar-month" size={20} iconColor="#536DFE" style={{ margin: 0 }} />
                            </View>
                            <Text style={styles.columnLabel}>MONTHLY</Text>
                            <View style={styles.valueRow}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <Text style={styles.columnValue}>{formatCurrency(totalMonthly)}</Text>
                            </View>
                        </View>

                        {/* Styled Vertical Divider */}
                        <View style={styles.dividerWrapper}>
                            <View style={styles.verticalDivider} />
                        </View>

                        {/* Yearly Column */}
                        <View style={styles.gridColumn}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                                <IconButton icon="calendar-range" size={20} iconColor="#009688" style={{ margin: 0 }} />
                            </View>
                            <Text style={styles.columnLabel}>YEARLY</Text>
                            <View style={styles.valueRow}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <Text style={styles.columnValue}>{formatCurrency(totalYearly)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Retirement Preferences</Text>
            </View>

            {/* Compact Input Section */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Expected Inflation (%)</Text>
                        <TextInput
                            mode="outlined"
                            value={inflationInput}
                            onChangeText={handleInflationChange}
                            keyboardType="decimal-pad"
                            style={styles.amountInput}
                            outlineColor="#E5E7EB"
                            activeOutlineColor="#5E72E4"
                            right={<TextInput.Affix text="%" textStyle={styles.suffixText} />}
                            placeholder="e.g. 6"
                            textColor="#1C1C1E"
                            theme={{ roundness: 12 }}
                        />
                        <Text style={styles.helperText}>Annual cost of living increase.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Planned Retirement Age</Text>
                        <TextInput
                            mode="outlined"
                            value={settings.retirementAge > 0 ? settings.retirementAge.toString() : ''}
                            onChangeText={(val) => updateSetting('retirementAge', val)}
                            keyboardType="numeric"
                            style={styles.amountInput}
                            outlineColor="#E5E7EB"
                            activeOutlineColor="#5E72E4"
                            placeholder="e.g. 60"
                            maxLength={3}
                            textColor="#1C1C1E"
                            theme={{ roundness: 12 }}
                        />
                        <Text style={styles.helperText}>Age you plan to retire.</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={() => router.push('/dashboard')}
                    style={styles.nextButton}
                    contentStyle={[styles.buttonContent, { flexDirection: 'row-reverse' }]}
                    labelStyle={styles.buttonLabel}
                    icon="arrow-right"
                >
                    See Dashboard
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12, // Compact
        paddingBottom: 8,
    },
    greeting: {
        fontSize: 22, // Increased to match Step 1
        fontWeight: '600',
        color: '#5E72E4',
        marginBottom: 4,
    },
    title: {
        fontWeight: '800',
        color: '#111827',
        fontSize: 22, // Strict 22px
        marginBottom: 4,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 12, // Smaller
        color: '#6B7280',
        lineHeight: 16,
    },
    cardContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12, // Reduced from margin
    },
    summaryCard: {
        backgroundColor: '#FAFAFA', // Very Light
        borderRadius: 20,
        padding: 24, // Generous internal padding
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridColumn: {
        flex: 1,
        alignItems: 'flex-start',
    },
    iconContainer: {
        borderRadius: 12,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    columnLabel: {
        fontSize: 10, // Small caps
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginRight: 10, // 10px Gutter
    },
    columnValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
    },
    dividerWrapper: {
        marginHorizontal: 16,
    },
    verticalDivider: {
        width: 1,
        height: 48,
        backgroundColor: '#E5E7EB',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 16, // Reduced header size
    },
    content: {
        paddingHorizontal: 20,
    },
    inputContainer: {
        // No background card anymore, just inputs
        marginBottom: 0,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 6,
    },
    amountInput: {
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        height: 50,
    },
    suffixText: {
        fontWeight: 'bold',
        color: '#6B7280',
    },
    helperText: {
        fontSize: 10, // 10px Requested
        color: '#9CA3AF', // Light Grey
        marginTop: 4,
    },
    footer: {
        padding: 20,
        paddingBottom: 24,
        backgroundColor: '#FFFFFF',
    },
    nextButton: {
        backgroundColor: '#5E72E4',
        borderRadius: 14,
        elevation: 0,
        height: 52,
        justifyContent: 'center',
    },
    buttonContent: {
        height: 52,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
});
