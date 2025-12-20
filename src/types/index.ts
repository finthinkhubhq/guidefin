// Common types for the application

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Add more types as needed for your financial calculations
export interface FinancialData {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

