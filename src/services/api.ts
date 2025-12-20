import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your API base URL here
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Example API functions
export const apiService = {
  // GET request example
  get: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  // POST request example
  post: async (endpoint: string, data: any) => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  // PUT request example
  put: async (endpoint: string, data: any) => {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  },

  // DELETE request example
  delete: async (endpoint: string) => {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },
};

