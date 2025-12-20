# Firebase Setup Guide

Follow these steps to configure Firebase for your FinCal app.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "fincal-app")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click "Enable"

### Firestore Security Rules (for production)

Update your Firestore rules to:
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

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable **Anonymous** sign-in:
   - Click on "Anonymous"
   - Toggle "Enable"
   - Click "Save"

   OR

   Enable **Email/Password** sign-in:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. If you don't have a web app, click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname (e.g., "FinCal Web")
5. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 5: Configure Your App

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in the root directory:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. The app will automatically use these environment variables (already configured in `src/config/firebaseConfig.ts`)

### Option 2: Direct Configuration

Update `src/config/firebaseConfig.ts` directly with your Firebase config values.

## Step 6: Test the Connection

1. Start your app: `npm start`
2. The app will automatically sign in anonymously when you first open it
3. Try adding an expense in the Expense Manager tab
4. Check Firebase Console > Firestore Database to see if data is being saved

## Data Structure

Your Firestore will have this structure:

```
users/
  {userId}/
    transactions/
      {transactionId}/
        amount: number
        category: string
        date: string
        createdAt: number
    settings/
      categories/
        categories: [
          { id: string, name: string, isDefault: boolean },
          ...
        ]
```

## Troubleshooting

### "User not authenticated" error
- Make sure Anonymous authentication is enabled
- Check that your Firebase config is correct
- Restart the app

### Data not saving
- Check Firestore security rules
- Verify you're signed in (check Firebase Console > Authentication)
- Check browser/device console for errors

### Environment variables not working
- Make sure `.env` file is in the root directory
- Restart the Expo development server after creating/updating `.env`
- Variable names must start with `EXPO_PUBLIC_`

## Next Steps

- Set up proper security rules for production
- Consider implementing email/password authentication
- Set up Firebase Analytics (optional)
- Configure Firebase Storage if needed for future features

