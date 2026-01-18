#!/bin/bash
# Dependency Cleanup and Security Fix Script
# Run this in your local Antigravity environment
# Location: /home/user/guidefin/

set -e  # Exit on error

echo "========================================="
echo "GuideFin Dependency Cleanup Script"
echo "========================================="
echo ""

# Step 1: Create backups
echo "📦 Step 1: Creating backups..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || echo "No package-lock.json to backup"
echo "✅ Backups created: package.json.backup, package-lock.json.backup"
echo ""

# Step 2: Remove unused dependencies
echo "🗑️  Step 2: Removing unused dependencies..."
npm uninstall react-native-gifted-charts \
              react-hook-form \
              expo-blur \
              react-native-vector-icons \
              axios

echo "✅ Removed 5 unused dependencies"
echo ""

# Step 3: Update critical security packages
echo "🔒 Step 3: Updating Firebase (security fixes)..."
npm install firebase@latest
echo "✅ Firebase updated"
echo ""

# Step 4: Update packages with minor/patch versions
echo "📈 Step 4: Updating packages to latest compatible versions..."
npm update
echo "✅ Packages updated"
echo ""

# Step 5: Fix security vulnerabilities
echo "🛡️  Step 5: Running npm audit fix..."
npm audit fix
echo "✅ Security fixes applied"
echo ""

# Step 6: Clean install
echo "🧹 Step 6: Performing clean install..."
rm -rf node_modules
npm install
echo "✅ Clean install completed"
echo ""

# Step 7: Final audit
echo "📊 Step 7: Running final security audit..."
npm audit
echo ""

# Step 8: Show outdated packages
echo "📋 Step 8: Checking remaining outdated packages..."
npm outdated || true
echo ""

echo "========================================="
echo "✅ Dependency cleanup completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Test your app: npx expo start"
echo "2. If everything works, commit changes"
echo "3. If there are issues, restore backup:"
echo "   mv package.json.backup package.json"
echo "   mv package-lock.json.backup package-lock.json"
echo "   npm install"
echo ""
echo "Major updates NOT applied (require testing):"
echo "- date-fns 2.30.0 → 4.1.0"
echo "- zustand 4.5.7 → 5.0.10"
echo "See MIGRATION_NOTES.md for details"
echo ""
