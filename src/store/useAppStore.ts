import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  isLoading: boolean;
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;
  loadUserFromStorage: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    }
  },

  clearUser: () => {
    set({ user: null });
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('authToken');
  },

  loadUserFromStorage: async () => {
    set({ isLoading: true });
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        set({ user: JSON.parse(userData) });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

