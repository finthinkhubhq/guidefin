# Guidefin - Financial Independence Calculator & Expense Manager

A modern Android app built with React Native, Expo, and Firebase for retirement planning and expense management.

## 🚀 Features

- **Retirement Calculator**: Calculate required corpus based on expenses, age, and inflation
- **Expense Manager**: Log and track daily expenses with categories
- **Category Management**: Add, edit, and delete custom expense categories
- **Real-time UI/UX**: Built with React Native Paper for beautiful Material Design components
- **Firebase Integration**: Cloud storage for expenses and categories
- **State Management**: Recoil for centralized state management
- **TypeScript**: Full TypeScript support for type safety

## 📦 Installed Dependencies

### Core
- Expo SDK 54
- React Native 0.81.5
- React 19.1.0
- TypeScript

### Navigation & Routing
- Expo Router (file-based routing with tabs)
- React Native Safe Area Context
- React Native Screens

### UI/UX
- React Native Paper (Material Design components)
- Expo Vector Icons

### State Management
- Recoil (atomic state management)

### Backend & Data
- Firebase (Firestore for data storage, Auth for authentication)
- date-fns (Date utilities)

### Expo Packages
- Expo Font
- Expo Secure Store
- Expo Linear Gradient

## 🏃 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for backend)
- Expo Go app on your Android device (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Anonymous Authentication (or Email/Password)
   - Copy your Firebase config
   - Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
   - Update `src/config/firebaseConfig.ts` with your Firebase config

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

Or scan the QR code with Expo Go app on your Android device.

## 📁 Project Structure

```
FinCal/
├── app/
│   ├── (tabs)/
│   │   ├── calculator.tsx    # Retirement calculator screen
│   │   ├── manager.tsx       # Expense manager screen
│   │   └── _layout.tsx       # Tabs navigation layout
│   ├── settings/
│   │   └── index.tsx         # Category management screen
│   └── _layout.tsx           # Root layout with Recoil & providers
├── src/
│   ├── config/
│   │   └── firebaseConfig.ts  # Firebase configuration
│   ├── services/
│   │   ├── firebaseService.ts # Firebase service functions
│   │   └── api.ts            # API utilities (legacy)
│   ├── store/
│   │   └── atoms.ts          # Recoil state atoms
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── utils/
│   │   └── initializeApp.ts  # App initialization utilities
│   └── constants/
│       └── colors.ts         # App color constants
├── assets/                   # Images and assets
└── package.json
```

## 🎯 Features Overview

### 1. Retirement Calculator (`app/(tabs)/calculator.tsx`)

- **Expense Input**: Enter monthly/annual expenses for 6 categories:
  - Insurance
  - Credit Card Bills
  - EMI
  - Rent
  - Groceries
  - Utilities

- **Auto-Conversion**: Automatically converts between Monthly and Annual values
  - Enter Monthly → Annual = Monthly × 12
  - Enter Annual → Monthly = Annual ÷ 12

- **Retirement Details**: Input fields for:
  - Current Age
  - Retirement Age
  - Inflation (%)

- **Calculation Logic**:
  1. Calculate N = Retirement Age - Current Age
  2. Calculate Future Projected Expense: A = Total Annual Expense × (1 + Inflation/100)^N
  3. Calculate Corpus:
     - Optimistic: 25 × A
     - Moderate: 30 × A
     - Conservative: 33 × A

### 2. Expense Manager (`app/(tabs)/manager.tsx`)

- **Add Expenses**: Log daily expenses with:
  - Date
  - Amount
  - Category (from global categories list)

- **Transaction History**: View all logged transactions
- **Firebase Sync**: All transactions saved to Firestore
- **Delete Transactions**: Remove transactions with confirmation

### 3. Settings (`app/settings/index.tsx`)

- **Category Management**:
  - View all categories (default + custom)
  - Add new custom categories
  - Edit custom categories
  - Delete custom categories (defaults are protected)
- **Firebase Sync**: Categories saved to Firestore per user

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Enable Firestore**:
   - Go to Firestore Database
   - Create database in test mode (or set up security rules)
   - Structure:
     ```
     users/
       {userId}/
         transactions/
           {transactionId}
         settings/
           categories/
             {categories: [...]}
     ```

3. **Enable Authentication**:
   - Go to Authentication
   - Enable "Anonymous" sign-in method (or Email/Password)

4. **Get Configuration**:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Add a web app or copy config
   - Update `src/config/firebaseConfig.ts`

### Environment Variables

Create a `.env` file (not committed to git):
```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 📱 Development

### Running on Device
1. Install Expo Go from Google Play Store
2. Run `npm start`
3. Scan the QR code with Expo Go

### Running on Emulator
1. Start Android emulator
2. Run `npm run android`

### State Management

The app uses **Recoil** for state management with the following atoms:

- `expensesState`: Current expense values from calculator
- `userSettingsState`: Current Age, Retirement Age, Inflation %
- `categoriesState`: List of all expense categories
- `transactionsState`: List of user transactions

## 🎨 Customization

- **Colors**: Edit `src/constants/colors.ts`
- **Navigation**: Modify `app/(tabs)/_layout.tsx`
- **Screens**: Add new screens in `app/` directory
- **Components**: Create reusable components in `src/components/`

## 🔐 Security Notes

- The app uses anonymous authentication by default
- For production, consider implementing email/password authentication
- Set up proper Firestore security rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```

## 📝 Next Steps

1. ✅ Set up Firebase project and configure
2. ✅ Test calculator functionality
3. ✅ Test expense logging
4. ✅ Test category management
5. Add more expense categories to calculator
6. Add data visualization/charts
7. Add export functionality
8. Implement email/password authentication

## 🤝 Contributing

This is a development project. Feel free to extend and customize as needed.

## 📄 License

Private project

---

Built with ❤️ using Expo, React Native, and Firebase
