# Dependency Audit Report - GuideFin
**Date**: 2026-01-18
**Analyzed by**: Claude Code

---

## Executive Summary

The GuideFin project has **11 security vulnerabilities** (1 high, 10 moderate), **several outdated packages** with major version updates available, and **6+ unused dependencies** that add unnecessary bloat (~15-20% of dependencies are unused).

**Total Dependencies**: 848 production + 43 dev dependencies
**Vulnerabilities Found**: 11 (1 high-severity, 10 moderate-severity)
**Outdated Packages**: 15+ packages with updates available
**Unused Dependencies**: 6 packages can be safely removed

---

## 🔴 CRITICAL: Security Vulnerabilities

### High Severity (1)
1. **tar (node-tar)**
   - **Current**: ≤7.5.2
   - **Severity**: HIGH
   - **Issue**: Arbitrary File Overwrite and Symlink Poisoning via Insufficient Path Sanitization
   - **CVE**: GHSA-8qq5-rm4j-mr97
   - **Fix**: Update to tar@7.5.3 or higher

### Moderate Severity (10)
2. **undici** (affects multiple Firebase packages)
   - **Current**: ≤6.22.0
   - **Severity**: MODERATE
   - **Issues**:
     - Use of Insufficiently Random Values (CVSS 6.8)
     - Denial of Service attack via bad certificate data
     - Unbounded decompression chain leading to resource exhaustion
   - **Affected packages**: @firebase/auth, @firebase/firestore, @firebase/functions, @firebase/storage
   - **Fix**: Update firebase to latest version (12.8.0)

3. **Firebase ecosystem vulnerabilities**
   - All stem from outdated Firebase SDK (10.8.0 → 12.8.0)
   - Affects: @firebase/auth, @firebase/auth-compat, @firebase/firestore, @firebase/firestore-compat, @firebase/functions, @firebase/functions-compat, @firebase/storage, @firebase/storage-compat

### Recommended Fix Command
```bash
npm audit fix
```

---

## 📦 Outdated Packages

### Major Version Updates Available

| Package | Current | Latest | Priority | Notes |
|---------|---------|--------|----------|-------|
| **firebase** | 10.8.0 | 12.8.0 | 🔴 Critical | Security vulnerabilities + 2 major versions behind |
| **date-fns** | 2.30.0 | 4.1.0 | 🟡 Medium | Major API changes, test before upgrading |
| **zustand** | 4.5.7 | 5.0.10 | 🟡 Medium | Minor breaking changes expected |

### Minor/Patch Updates Available

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| react | 19.1.0 | 19.2.3 | Minor |
| react-dom | 19.1.0 | 19.2.3 | Minor |
| react-native | 0.81.5 | 0.83.1 | Minor |
| react-native-reanimated | 4.1.1 | 4.2.1 | Minor |
| react-native-screens | 4.16.0 | 4.19.0 | Minor |
| react-native-svg | 15.12.1 | 15.15.1 | Patch |
| react-native-worklets | 0.5.1 | 0.7.2 | Minor |
| @react-native-community/datetimepicker | 8.4.4 | 8.6.0 | Minor |
| @react-native-community/slider | 5.0.1 | 5.1.2 | Minor |

---

## 🗑️ Unused Dependencies (Bloat)

### Confirmed Unused - Safe to Remove

1. **react-native-gifted-charts** (1.4.69)
   - **Usage**: Not imported anywhere in codebase
   - **Impact**: Large charting library (~500KB+)
   - **Recommendation**: Remove immediately

2. **react-hook-form** (7.51.0)
   - **Usage**: Not imported anywhere in codebase
   - **Impact**: Form validation library (~100KB)
   - **Recommendation**: Remove immediately

3. **expo-blur** (15.0.8)
   - **Usage**: Not imported anywhere in codebase
   - **Impact**: Native blur effects module
   - **Recommendation**: Remove immediately

4. **react-native-vector-icons** (10.0.0)
   - **Usage**: Not used (project uses @expo/vector-icons instead)
   - **Impact**: Duplicate icon library (~2MB)
   - **Recommendation**: Remove immediately

5. **axios** (1.6.0)
   - **Usage**: Only imported in src/services/api.ts, but api.ts is never used
   - **Impact**: HTTP client library (~100KB)
   - **Recommendation**: Remove axios + delete api.ts, or use api.ts if planning API integration

### Legacy Code - Consider Removing

6. **@react-navigation packages** (~300KB total)
   - @react-navigation/native (7.0.14)
   - @react-navigation/native-stack (7.2.0)
   - @react-navigation/bottom-tabs (7.2.0)

   - **Usage**: Only used in src/navigation/AppNavigator.tsx
   - **Issue**: Project uses expo-router (file-based routing), but legacy App.tsx uses old React Navigation
   - **Recommendation**: Complete migration to expo-router, remove App.tsx and AppNavigator.tsx, remove @react-navigation packages

---

## 📊 Dependency Analysis

### Core Dependencies (Keep)
✅ Expo ecosystem packages - actively used
✅ React/React Native - core framework
✅ Firebase - database/auth (but needs update)
✅ Zustand - state management
✅ date-fns - date formatting (used in manager.tsx)
✅ react-native-paper - UI components
✅ expo-print, expo-sharing, expo-file-system - PDF generation
✅ @react-native-async-storage/async-storage - local storage
✅ @react-native-community/slider, datetimepicker - form inputs

### Potentially Redundant
⚠️ Both @expo/vector-icons AND react-native-vector-icons (remove latter)
⚠️ Both expo-router AND @react-navigation (migration incomplete)

---

## 🎯 Recommended Action Plan

### Phase 1: Immediate Actions (Security Critical)
```bash
# 1. Fix security vulnerabilities
npm audit fix

# 2. Update critical packages
npm install firebase@latest

# 3. Remove unused dependencies
npm uninstall react-native-gifted-charts react-hook-form expo-blur react-native-vector-icons axios
```

### Phase 2: Update Major Packages (Test Required)
```bash
# Update with caution - breaking changes expected
npm install date-fns@latest zustand@latest

# Update minor versions
npm install react@latest react-dom@latest
npm install react-native-reanimated@latest react-native-screens@latest
npm install react-native-svg@latest react-native-worklets@latest
npm install @react-native-community/datetimepicker@latest @react-native-community/slider@latest

# Run tests after each update
npm test
```

### Phase 3: Architecture Cleanup (Optional but Recommended)
1. **Complete expo-router migration**
   - Remove App.tsx
   - Remove src/navigation/AppNavigator.tsx
   - Remove unused screens if any
   - Uninstall: `npm uninstall @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs`

2. **Clean up unused files**
   - Delete src/services/api.ts (if not planning API integration)

### Phase 4: Dependency Optimization
```bash
# Clean install to remove phantom dependencies
rm -rf node_modules package-lock.json
npm install

# Audit final state
npm audit
npm outdated
```

---

## 💾 Estimated Size Savings

Removing unused dependencies:
- react-native-gifted-charts: ~500KB
- react-native-vector-icons: ~2MB
- axios: ~100KB
- react-hook-form: ~100KB
- expo-blur: ~50KB
- @react-navigation (if removed): ~300KB

**Total savings**: ~3MB minified, ~10MB in node_modules

---

## ⚠️ Breaking Changes Warning

### Firebase 10 → 12 Migration
- Check Firebase documentation for breaking changes
- Test authentication flows
- Test Firestore queries
- Verify Firebase configuration

### date-fns 2 → 4 Migration
- Function signatures may have changed
- Check format() calls in app/(tabs)/manager.tsx
- Review migration guide: https://date-fns.org/docs/Upgrade-Guide

### zustand 4 → 5 Migration
- Minimal breaking changes expected
- Review changelog: https://github.com/pmndrs/zustand/releases

---

## 🧪 Testing Checklist

After making updates:
- [ ] App builds successfully (iOS/Android)
- [ ] Authentication works (Firebase anonymous sign-in)
- [ ] Firestore read/write operations work
- [ ] Date formatting displays correctly
- [ ] PDF generation and sharing works
- [ ] All navigation flows work
- [ ] State management (Zustand stores) functions correctly
- [ ] Run expo-doctor to check for issues

---

## 📝 Commands Summary

```bash
# Quick fix (Recommended first step)
npm audit fix
npm install firebase@latest
npm uninstall react-native-gifted-charts react-hook-form expo-blur react-native-vector-icons axios

# Full update (requires testing)
npm update
npm audit fix --force

# Clean slate
rm -rf node_modules package-lock.json
npm install
```

---

## 🔍 Notes

1. **Firebase security issues are critical** - Update immediately
2. **6 packages are completely unused** - Safe to remove for cleaner codebase
3. **Incomplete migration** from React Navigation to expo-router creates redundancy
4. **Total of 904 dependencies** (848 prod + 43 dev + optionals) - Removing bloat will improve build times and reduce bundle size
5. Consider using `npm dedupe` after cleanup to further optimize dependency tree

---

## Next Steps

1. Review this report with the team
2. Create a backup branch before making changes
3. Execute Phase 1 (security fixes + remove bloat)
4. Test thoroughly
5. Execute Phase 2 and 3 based on project timeline
6. Update this report after changes
