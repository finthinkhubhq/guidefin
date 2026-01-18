import { create } from 'zustand';

// Expense categories with default values
export interface ExpenseCategory {
  id: string;
  name: string;
  monthly: number;
  annual: number;
}

// Default expense categories (11 standard categories)
const defaultCategories: ExpenseCategory[] = [
  { id: '1', name: 'Insurance', monthly: 0, annual: 0 },
  { id: '2', name: 'Credit Cards bills', monthly: 0, annual: 0 },
  { id: '3', name: 'Family Health - Medical', monthly: 0, annual: 0 },
  { id: '4', name: 'Home Expense', monthly: 0, annual: 0 },
  { id: '5', name: 'Home Rent', monthly: 0, annual: 0 },
  { id: '6', name: 'Personal', monthly: 0, annual: 0 },
  { id: '7', name: 'Daily Travel', monthly: 0, annual: 0 },
  { id: '8', name: 'Vacation', monthly: 0, annual: 0 },
  { id: '9', name: 'Food Restaurant', monthly: 0, annual: 0 },
  { id: '10', name: 'Petrol - Car & Bike', monthly: 0, annual: 0 },
  { id: '11', name: 'Child Education', monthly: 0, annual: 0 },
];

export interface ExpensesState {
  expenses: ExpenseCategory[];
  setExpenses: (expenses: ExpenseCategory[] | ((prev: ExpenseCategory[]) => ExpenseCategory[])) => void;
  resetExpenses: () => void;
}

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: defaultCategories,
  setExpenses: (expensesOrUpdater) => set((state) => ({
    expenses: typeof expensesOrUpdater === 'function' ? expensesOrUpdater(state.expenses) : expensesOrUpdater
  })),
  resetExpenses: () => set({ expenses: defaultCategories }),
}));


// User settings interface
export interface UserSettings {
  name: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number; // added
  inflation: number; // as percentage (e.g., 5 for 5%)
  monthlyExpenses?: number;
  currentCorpus?: number;
}

export interface UserSettingsState {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

// Atom for user settings
export const useSettingsStore = create<UserSettingsState>((set) => ({
  settings: {
    name: '',
    currentAge: 0,
    retirementAge: 60,
    lifeExpectancy: 90,
    inflation: 6,
  },
  setSettings: (settings) => set({ settings }),
}));

// Category list for expense manager
export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

// Default categories for expense manager (matching calculator categories)
const defaultManagerCategories: Category[] = [
  { id: 'insurance', name: 'Insurance', isDefault: true },
  { id: 'credit-cards', name: 'Credit Cards bills', isDefault: true },
  { id: 'medical', name: 'Family Health - Medical', isDefault: true },
  { id: 'home-expense', name: 'Home Expense', isDefault: true },
  { id: 'home-rent', name: 'Home Rent', isDefault: true },
  { id: 'personal', name: 'Personal', isDefault: true },
  { id: 'daily-travel', name: 'Daily Travel', isDefault: true },
  { id: 'vacation', name: 'Vacation', isDefault: true },
  { id: 'food-restaurant', name: 'Food Restaurant', isDefault: true },
  { id: 'petrol', name: 'Petrol - Car & Bike', isDefault: true },
  { id: 'child-education', name: 'Child Education', isDefault: true },
];

export interface CategoriesState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

// Atom to store all available expense categories
export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: defaultManagerCategories,
  setCategories: (categories) => set({ categories }),
}));

// Transaction interface
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  createdAt: number;
}

export interface TransactionsState {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
}

// Atom to store transactions (local cache)
export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  setTransactions: (transactionsOrUpdater) => set((state) => ({
    transactions: typeof transactionsOrUpdater === 'function' ? transactionsOrUpdater(state.transactions) : transactionsOrUpdater
  })),
}));

