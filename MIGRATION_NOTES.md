# Dependency Migration Notes

## Overview
This document provides specific migration guidance for the recommended package updates.

---

## Critical Updates (Do Immediately)

### 1. Firebase 10.8.0 → 12.8.0

**Why**: Fixes 10 moderate security vulnerabilities related to undici

**Breaking Changes**:
- Firebase v11 introduced modular tree-shaking improvements
- Firebase v12 has improved TypeScript types

**Files to Check**:
- `src/config/firebaseConfig.ts` - Firebase initialization
- `src/services/firebaseService.ts` - Firestore operations
- `app/_layout.tsx` - Anonymous auth
- `app/(tabs)/manager.tsx` - Firebase auth usage

**Migration Steps**:
```typescript
// Your current code should work, but verify:
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Make sure all imports are from modular SDK (you're already doing this)
```

**Test Checklist**:
- [ ] App initializes without errors
- [ ] Anonymous authentication works
- [ ] Firestore reads/writes work
- [ ] Category service CRUD operations work
- [ ] Transaction service CRUD operations work

---

## Recommended Updates (Test After)

### 2. React 19.1.0 → 19.2.3

**Why**: Bug fixes and performance improvements

**Breaking Changes**: None (patch update)

**Test**:
- [ ] All components render correctly
- [ ] Hooks work as expected
- [ ] No console errors

---

### 3. React Native 0.81.5 → 0.83.1

**Why**: Bug fixes, performance improvements

**Breaking Changes**: Minor API updates

**Test**:
- [ ] iOS build works
- [ ] Android build works
- [ ] Navigation works
- [ ] All native features work (camera, file system, etc.)

**Notes**:
- Check Expo compatibility with React Native 0.83.1
- May need to update Expo SDK if issues arise

---

### 4. react-native-reanimated 4.1.1 → 4.2.1

**Why**: Bug fixes and performance improvements

**Breaking Changes**: None expected (minor update)

**Files to Check**:
- Check if you use any animations (didn't see obvious usage, but check)

**Test**:
- [ ] App builds without errors
- [ ] Any animations work smoothly

---

### 5. react-native-worklets 0.5.1 → 0.7.2

**Why**: Dependency of react-native-reanimated

**Breaking Changes**: Check if you use worklets directly (likely you don't)

**Test**:
- [ ] App builds and runs

---

## Optional Updates (Requires More Testing)

### 6. date-fns 2.30.0 → 4.1.0 (MAJOR UPDATE)

**Why**: TypeScript improvements, better tree-shaking, new features

**Breaking Changes**: Yes - format function changes

**Current Usage**:
```typescript
// app/(tabs)/manager.tsx line 24
import { format } from 'date-fns';

// Usage example (need to verify in code):
format(date, 'MMM dd, yyyy')
```

**Migration Guide**: https://date-fns.org/docs/Upgrade-Guide

**Major Changes**:
- `format` function signature may have changed
- Some format tokens changed (check 'MMM', 'yyyy', etc.)
- TreeShaking improvements (will reduce bundle size)

**Steps**:
1. Read migration guide
2. Search codebase for all `format(` calls
3. Update format strings if needed
4. Test all date displays

**Test Checklist**:
- [ ] Transaction dates display correctly
- [ ] Any date pickers work
- [ ] Date formatting in all screens correct

---

### 7. zustand 4.5.7 → 5.0.10 (MAJOR UPDATE)

**Why**: Performance improvements, better TypeScript support

**Breaking Changes**: Minor - mostly internal

**Files Affected**:
- `src/store/useAppStore.ts`
- `src/store/useRetirementStore.ts`
- `src/store/atoms.ts`

**Migration Guide**: https://github.com/pmndrs/zustand/releases

**Changes**:
- `create` function is mostly the same
- Middleware API may have changed slightly
- Better TypeScript inference

**Steps**:
1. Update package
2. Check if TypeScript types work correctly
3. Test all store operations

**Test Checklist**:
- [ ] All stores initialize correctly
- [ ] State updates work
- [ ] Persistence works (AsyncStorage integration)
- [ ] No TypeScript errors

---

## Removed Dependencies

### Why Each Was Removed:

1. **react-native-gifted-charts**
   - Not imported anywhere in codebase
   - Saves ~500KB
   - You're not using charts currently

2. **react-hook-form**
   - Not imported anywhere
   - Saves ~100KB
   - You're managing forms manually

3. **expo-blur**
   - Not imported anywhere
   - Saves ~50KB
   - Not using blur effects

4. **react-native-vector-icons**
   - You use `@expo/vector-icons` instead (same icons, Expo-optimized)
   - Saves ~2MB
   - Avoids duplicate functionality

5. **axios**
   - Only in `src/services/api.ts`
   - `api.ts` is never imported anywhere
   - Saves ~100KB
   - You can recreate if needed for API integration

6. **@react-navigation packages** (Optional removal)
   - Used only in legacy `App.tsx` and `src/navigation/AppNavigator.tsx`
   - You use `expo-router` for navigation (file-based routing)
   - Saves ~300KB
   - **WARNING**: Only remove if you've fully migrated to expo-router

---

## Post-Update Testing Script

```bash
# 1. Clear caches
npx expo start -c

# 2. Test iOS (if on Mac)
npm run ios

# 3. Test Android
npm run android

# 4. Check for warnings
npm run start # Look for any deprecation warnings

# 5. Run any tests you have
npm test

# 6. Build for production (optional)
eas build --platform all --profile preview
```

---

## Rollback Plan

If anything breaks:

```bash
# Restore from backup
mv package.json.backup package.json
mv package-lock.json.backup package-lock.json
rm -rf node_modules
npm install
```

---

## Questions to Consider

1. **Do you plan to use charts?**
   - If yes: Keep react-native-gifted-charts
   - If no: Remove it

2. **Do you plan to integrate external APIs?**
   - If yes: Keep axios and use api.ts
   - If no: Remove axios

3. **Have you fully migrated to expo-router?**
   - If yes: Remove @react-navigation packages + App.tsx
   - If no: Keep them temporarily

4. **Do you need blur effects?**
   - If yes: Keep expo-blur
   - If no: Remove it

---

## Recommended Update Order

1. **Phase 1** (Critical - Do Now):
   ```bash
   ./fix-dependencies.sh
   ```

2. **Phase 2** (After Testing Phase 1):
   ```bash
   npm install date-fns@4 zustand@5
   # Test thoroughly
   ```

3. **Phase 3** (Architecture Cleanup):
   - Remove App.tsx and AppNavigator.tsx if using expo-router
   - Remove @react-navigation packages
   - Clean up unused files

---

## Support Resources

- **Firebase**: https://firebase.google.com/support/release-notes/js
- **date-fns**: https://date-fns.org/docs/Upgrade-Guide
- **zustand**: https://github.com/pmndrs/zustand/releases
- **Expo**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/docs/upgrading

---

## Notes

- Always test on both iOS and Android after updates
- Check Expo compatibility matrix: https://docs.expo.dev/versions/latest/
- Consider using EAS Build for testing production builds
- Keep package.json.backup until you're confident updates work
