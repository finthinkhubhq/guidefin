import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Transaction, Category } from '../store/atoms';
import { auth } from '../config/firebaseConfig';

// Get current user ID
const getUserId = () => {
  if (!auth) {
    throw new Error('Firebase not configured');
  }
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

// Transaction Services
export const transactionService = {
  // Add a new transaction
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const userId = getUserId();
      const transactionData = {
        ...transaction,
        createdAt: Date.now(),
      };
      const docRef = await addDoc(
        collection(db, 'users', userId, 'transactions'),
        transactionData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Get all transactions for the current user
  async getTransactions(): Promise<Transaction[]> {
    try {
      const userId = getUserId();
      const q = query(
        collection(db, 'users', userId, 'transactions'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const userId = getUserId();
      await deleteDoc(doc(db, 'users', userId, 'transactions', transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};

// Category Services
export const categoryService = {
  // Get user's custom categories from Firestore
  async getCategories(): Promise<Category[]> {
    try {
      const userId = getUserId();
      const docRef = doc(db, 'users', userId, 'settings', 'categories');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().categories as Category[];
      }
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Save categories to Firestore
  async saveCategories(categories: Category[]): Promise<void> {
    try {
      const userId = getUserId();
      await setDoc(
        doc(db, 'users', userId, 'settings', 'categories'),
        { categories },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  },
};

