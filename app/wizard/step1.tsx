import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput as NativeTextInput } from 'react-native';
import { Text, TextInput, Button, IconButton, TouchableRipple } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpensesStore, useSettingsStore } from '../../src/store/atoms';

const { width } = Dimensions.get('window');

export default function WizardStep1() {
    const router = useRouter();
    const { expenses, setExpenses } = useExpensesStore();
    const { settings } = useSettingsStore();
    const [isMonthly, setIsMonthly] = useState(true);

    const inputRefs = useRef<{ [key: string]: NativeTextInput | null }>({});

    // Helper to update an expense amount
    const updateExpenseAmount = (id: string, amount: string) => {
        const updated = expenses.map(exp =>
            exp.id === id ? {
                ...exp,
                monthly: isMonthly ? parseFloat(amount) || 0 : (parseFloat(amount) / 12) || 0,
                annual: isMonthly ? (parseFloat(amount) * 12) || 0 : parseFloat(amount) || 0
            } : exp
        );
        setExpenses(updated);
    };

    const updateExpenseName = (id: string, name: string) => {
        if (/^[a-zA-Z0-9\s]*$/.test(name)) {
            const updated = expenses.map(exp =>
                exp.id === id ? { ...exp, name } : exp
            );
            setExpenses(updated);
        }
    };

    const deleteExpense = (id: string) => {
        const updated = expenses.filter(exp => exp.id !== id);
        setExpenses(updated);
    };

    const displayedAmount = (expense: any) => {
        const val = isMonthly ? expense.monthly : expense.annual;
        return val > 0 ? val.toFixed(0) : '';
    };

    const total = expenses.reduce((sum, item) => sum + (isMonthly ? item.monthly : item.annual), 0);

    const formatName = (name: string) => {
        if (!name) return 'User';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hi {formatName(settings.name)} 👋,</Text>
                <Text style={styles.title}>Fill Your Current Expenses</Text>
                <Text style={styles.subtitle}>Enter and categorize your monthly expenses to calculate your total spend.</Text>
            </View>

            {/* Premium Summary Card & Toggle */}
            <View style={styles.summaryCard}>
                <View style={styles.topRow}>
                    <View style={styles.iconTitleWrapper}>
                        <View style={styles.iconContainer}>
                            <IconButton icon="wallet-outline" size={20} iconColor="#5E72E4" style={{ margin: 0 }} />
                        </View>
                        <Text style={styles.summaryLabel}>Current Expenses</Text>
                    </View>
                    <Text style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</Text>
                </View>

                {/* Segmented Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, isMonthly && styles.toggleBtnActive]}
                        onPress={() => setIsMonthly(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleLabel, isMonthly && styles.toggleLabelActive]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, !isMonthly && styles.toggleBtnActive]}
                        onPress={() => setIsMonthly(false)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleLabel, !isMonthly && styles.toggleLabelActive]}>Yearly</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List Headers */}
            <View style={styles.listHeaderRow}>
                <Text style={styles.colHeaderLeft}>Expense Type</Text>
                <Text style={styles.colHeaderRight}>Amount</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Expense List */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {expenses.map((item, index) => (
                    <View key={item.id} style={styles.expenseRow}>
                        {/* Index */}
                        <Text style={styles.indexText}>{index + 1}.</Text>

                        {/* Name (Static or Editable) */}
                        <View style={styles.nameContainer}>
                            <TextInput
                                value={item.name}
                                onChangeText={(text) => updateExpenseName(item.id, text)}
                                style={styles.nameInput}
                                activeUnderlineColor="transparent"
                                underlineColor="transparent" // Remove underline
                                textColor="#1C1C1E"
                            />
                        </View>

                        {/* Amount Input */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                mode="outlined"
                                value={displayedAmount(item)}
                                onChangeText={(val) => updateExpenseAmount(item.id, val)}
                                keyboardType="numeric"
                                style={styles.amountInput}
                                outlineStyle={styles.amountOutline}
                                placeholder="Enter amount"
                                placeholderTextColor="#A0A0A0"
                                theme={{ roundness: 8, colors: { primary: '#E3E4E8' } }} // Subtle border
                                contentStyle={{ paddingHorizontal: 12 }}
                            />
                        </View>

                        {/* Delete Action */}
                        <IconButton
                            icon="trash-can-outline"
                            size={20}
                            iconColor="#FF3B30"
                            onPress={() => deleteExpense(item.id)}
                            style={styles.deleteIcon}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={() => {
                        const newId = (expenses.length + 1).toString();
                        setExpenses([...expenses, { id: newId, name: 'New Expense', monthly: 0, annual: 0 }]);
                    }}
                >
                    <IconButton icon="plus" size={18} iconColor="#5E72E4" style={{ margin: 0 }} />
                    <Text style={styles.addCardText}>Add New Expense</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={() => router.push('/wizard/step2')}
                    style={styles.nextButton}
                    contentStyle={[styles.buttonContent, { flexDirection: 'row-reverse' }]}
                    labelStyle={styles.buttonLabel}
                    icon="arrow-right"
                >
                    Next
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
        paddingTop: 16,
        paddingBottom: 12,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '600',
        color: '#536DFE', // Vibrant Blue
        marginBottom: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    summaryCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        marginHorizontal: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    summaryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    toggleBtnActive: {
        backgroundColor: '#EEF2FF', // Active Light Blue
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    toggleLabelActive: {
        color: '#536DFE', // Active Blue Text
    },
    listHeaderRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    colHeaderLeft: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#9CA3AF',
        paddingLeft: 24, // Align with name after index
    },
    colHeaderRight: {
        width: 120, // Match input width approx
        fontSize: 13,
        fontWeight: '700',
        color: '#9CA3AF',
        textAlign: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20, // Generous spacing
    },
    indexText: {
        fontSize: 14,
        color: '#9CA3AF',
        width: 20,
        marginRight: 4,
    },
    nameContainer: {
        flex: 1,
        marginRight: 12,
    },
    nameInput: {
        fontSize: 15,
        fontWeight: '500',
        backgroundColor: 'transparent',
        height: 40,
        paddingHorizontal: 0,
    },
    inputWrapper: {
        width: 130, // Fixed width for inputs
    },
    amountInput: {
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        height: 44,
    },
    amountOutline: {
        borderRadius: 8,
        borderColor: '#E5E7EB',
    },
    deleteIcon: {
        margin: 0,
        marginLeft: 4,
    },
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    addCardText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#536DFE',
        marginLeft: 4,
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    nextButton: {
        backgroundColor: '#536DFE',
        borderRadius: 28, // Pill
        height: 54,
        justifyContent: 'center',
    },
    buttonContent: {
        height: 54,
    },
    buttonLabel: {
        fontSize: 17,
        fontWeight: '700',
    },
});
