import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';
import {
  Text,
  TextInput,
  Button,
  Card,
  List,
  Menu,
  Portal,
  Modal,
  PaperProvider,
} from 'react-native-paper';
import {
  useCategoriesStore,
  useTransactionsStore,
  Transaction,
} from '../../src/store/atoms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionService } from '../../src/services/firebaseService';
import { auth } from '../../src/config/firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';

export default function ManagerScreen() {
  const { categories } = useCategoriesStore();
  const { transactions, setTransactions } = useTransactionsStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize authentication
  useEffect(() => {
    if (!auth) {
      // Firebase not configured, continue without auth
      setIsAuthenticated(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadTransactions();
      } else {
        // Sign in anonymously if not authenticated
        signInAnonymously(auth!).catch((error) => {
          console.error('Error signing in anonymously:', error);
          Alert.alert('Error', 'Failed to initialize app. Please try again.');
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Load transactions from Firestore
  const loadTransactions = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const fetchedTransactions = await transactionService.getTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const handleAddTransaction = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const newTransaction: Omit<Transaction, 'id' | 'createdAt'> = {
        date,
        amount: amountNum,
        category: selectedCategory,
      };

      const transactionId = await transactionService.addTransaction(newTransaction);

      // Add to local state
      const transaction: Transaction = {
        id: transactionId,
        ...newTransaction,
        createdAt: Date.now(),
      };
      setTransactions([transaction, ...transactions]);

      // Reset form
      setAmount('');
      setSelectedCategory('');
      setDate(new Date().toISOString().split('T')[0]);

      Alert.alert('Success', 'Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.deleteTransaction(transactionId);
              setTransactions(transactions.filter((t) => t.id !== transactionId));
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name || 'Select Category';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardSafeLayout>
        {/* Header */}
        <View style={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Expense Manager
            </Text>
          </View>

          {/* Add Transaction Form */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Add Expense
              </Text>

              <TextInput
                label="Date"
                mode="outlined"
                value={date}
                onChangeText={setDate}
                style={styles.input}
                placeholder="YYYY-MM-DD"
              />

              <TextInput
                label="Amount (₹)"
                mode="outlined"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
              />

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.categoryButton}
                  >
                    {selectedCategoryName}
                  </Button>
                }
              >
                {categories.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setMenuVisible(false);
                    }}
                    title={category.name}
                  />
                ))}
              </Menu>

              <Button
                mode="contained"
                onPress={handleAddTransaction}
                style={styles.addButton}
                loading={loading}
                disabled={loading}
              >
                Add Transaction
              </Button>
            </Card.Content>
          </Card>

          {/* Transactions List */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Recent Transactions
              </Text>

              {transactions.length === 0 ? (
                <Text style={styles.emptyText}>No transactions yet</Text>
              ) : (
                transactions.map((transaction) => (
                  <List.Item
                    key={transaction.id}
                    title={formatCurrency(transaction.amount)}
                    description={`${transaction.category} • ${formatDate(transaction.date)}`}
                    right={(props) => (
                      <Button
                        {...props}
                        mode="text"
                        onPress={() => handleDeleteTransaction(transaction.id)}
                        textColor="#b00020"
                      >
                        Delete
                      </Button>
                    )}
                    style={styles.listItem}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        </View>
      </KeyboardSafeLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  input: {
    marginBottom: 16,
  },
  categoryButton: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginVertical: 24,
  },
});

