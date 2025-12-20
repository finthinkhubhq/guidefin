import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { categoryService } from '../services/firebaseService';
import { categoriesState, Category } from '../store/atoms';
import { useSetRecoilState } from 'recoil';

// Initialize authentication and load user data
export const initializeApp = async (
  setCategories: (categories: Category[]) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            // Load categories from Firestore
            const firestoreCategories = await categoryService.getCategories();
            
            // Get default categories (from atoms default)
            const defaultCategories: Category[] = [
              { id: 'food', name: 'Food', isDefault: true },
              { id: 'transport', name: 'Transport', isDefault: true },
              { id: 'entertainment', name: 'Entertainment', isDefault: true },
              { id: 'shopping', name: 'Shopping', isDefault: true },
              { id: 'bills', name: 'Bills', isDefault: true },
              { id: 'health', name: 'Health', isDefault: true },
            ];
            
            // Merge: defaults first, then custom
            const allCategories = [...defaultCategories, ...firestoreCategories];
            setCategories(allCategories);
            
            unsubscribe();
            resolve();
          } catch (error) {
            console.error('Error loading categories:', error);
            // Still resolve even if categories fail to load
            unsubscribe();
            resolve();
          }
        } else {
          // Sign in anonymously if not authenticated
          signInAnonymously(auth)
            .then(() => {
              // Will trigger onAuthStateChanged again
            })
            .catch((error) => {
              console.error('Error signing in anonymously:', error);
              unsubscribe();
              reject(error);
            });
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        unsubscribe();
        reject(error);
      }
    );
  });
};

