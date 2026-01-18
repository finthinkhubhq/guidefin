# Commands to Run in Antigravity (Local Environment)

## Option 1: Automated Script (Recommended)

Copy and paste these commands in your Antigravity terminal:

```bash
cd /home/user/guidefin

# Make script executable
chmod +x local-fix-dependencies.sh

# Run the script
./local-fix-dependencies.sh
```

---

## Option 2: Manual Step-by-Step Commands

If you prefer to run commands manually, copy and paste these one by one:

### Step 1: Navigate to project
```bash
cd /home/user/guidefin
```

### Step 2: Create backups
```bash
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

### Step 3: Remove unused dependencies
```bash
npm uninstall react-native-gifted-charts react-hook-form expo-blur react-native-vector-icons axios
```

### Step 4: Update Firebase (critical security fix)
```bash
npm install firebase@latest
```

### Step 5: Update other packages
```bash
npm update
```

### Step 6: Fix security vulnerabilities
```bash
npm audit fix
```

### Step 7: Clean install
```bash
rm -rf node_modules
npm install
```

### Step 8: Verify fixes
```bash
npm audit
npm outdated
```

---

## After Running the Script

### Test Your App
```bash
# Clear cache and start
npx expo start -c

# Or test on specific platform
npx expo start --ios
npx expo start --android
```

### If Everything Works - Commit and Push
```bash
# Check what changed
git status
git diff package.json

# Stage changes
git add package.json package-lock.json

# Commit
git commit -m "Fix security vulnerabilities and remove unused dependencies

- Updated Firebase 10.8.0 → 12.8.0 (fixes 10 moderate security issues)
- Fixed tar vulnerability (HIGH severity)
- Removed 5 unused dependencies: react-native-gifted-charts, react-hook-form, expo-blur, react-native-vector-icons, axios
- Updated packages to latest compatible versions
- Ran npm audit fix

Total: 11 vulnerabilities fixed, ~3MB bloat removed"

# Push to your branch
git push origin <your-branch-name>
```

### If Something Breaks - Rollback
```bash
# Restore backups
mv package.json.backup package.json
mv package-lock.json.backup package-lock.json

# Reinstall original dependencies
rm -rf node_modules
npm install

# Restart app
npx expo start -c
```

---

## Verify Installation After Fix

Run these checks:

```bash
# 1. Check if vulnerabilities are fixed
npm audit

# 2. Check package versions
npm list firebase
npm list react-native-gifted-charts  # Should show "not installed"

# 3. Verify app builds
npx expo start --clear

# 4. Check bundle size (optional)
npx expo export --platform all
```

---

## Expected Results

### Before:
- **Vulnerabilities**: 11 (1 HIGH, 10 MODERATE)
- **Firebase**: 10.8.0
- **Dependencies**: ~891 packages
- **Unused packages**: 5

### After:
- **Vulnerabilities**: 0
- **Firebase**: 12.8.0
- **Dependencies**: ~868 packages
- **Bundle size**: Reduced by ~3MB

---

## Optional: Apply Major Updates (Requires More Testing)

Only run these if you want to update date-fns and zustand to latest major versions:

```bash
# Update date-fns (2.x → 4.x) - breaking changes!
npm install date-fns@latest

# Update zustand (4.x → 5.x) - minor breaking changes
npm install zustand@latest

# Test thoroughly after each
npx expo start -c
```

**WARNING**: Read MIGRATION_NOTES.md before applying major updates!

---

## Troubleshooting

### If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### If Expo shows errors:
```bash
# Clear Expo cache
npx expo start -c

# Or completely reset
rm -rf node_modules/.cache
npx expo start --clear
```

### If build fails:
```bash
# Check Expo doctor
npx expo-doctor

# Rebuild
npx expo prebuild --clean
```

---

## Contact/Support

If you encounter issues:
1. Check error messages carefully
2. Review DEPENDENCY_AUDIT_REPORT.md for context
3. Review MIGRATION_NOTES.md for migration guidance
4. Restore from backup if needed
5. File an issue with error details

---

## Summary

**Simplest workflow**:
```bash
cd /home/user/guidefin
chmod +x local-fix-dependencies.sh
./local-fix-dependencies.sh
npx expo start -c
# Test app, then commit and push if working
```
