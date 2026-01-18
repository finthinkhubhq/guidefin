#!/bin/bash
# GuideFin Dependency Fix Script
# This script fixes security vulnerabilities and removes unused dependencies

set -e  # Exit on error

echo "=================================================="
echo "GuideFin Dependency Cleanup & Security Fix"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup current package files
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
echo -e "${GREEN}✓ Backup created (package.json.backup)${NC}"
echo ""

# Step 2: Remove unused dependencies
echo -e "${YELLOW}Step 2: Removing unused dependencies...${NC}"
npm uninstall \
  react-native-gifted-charts \
  react-hook-form \
  expo-blur \
  react-native-vector-icons \
  axios

echo -e "${GREEN}✓ Removed 5 unused packages${NC}"
echo ""

# Step 3: Update critical packages (security)
echo -e "${YELLOW}Step 3: Updating packages with security vulnerabilities...${NC}"
npm install firebase@latest
echo -e "${GREEN}✓ Updated Firebase${NC}"
echo ""

# Step 4: Run npm audit fix
echo -e "${YELLOW}Step 4: Running npm audit fix...${NC}"
npm audit fix || echo -e "${YELLOW}⚠ Some vulnerabilities may require manual review${NC}"
echo ""

# Step 5: Update minor versions (safer updates)
echo -e "${YELLOW}Step 5: Updating packages with minor/patch updates...${NC}"
npm install \
  react-native-reanimated@latest \
  react-native-screens@latest \
  react-native-svg@latest \
  @react-native-community/datetimepicker@latest \
  @react-native-community/slider@latest

echo -e "${GREEN}✓ Updated minor version packages${NC}"
echo ""

# Step 6: Clean install
echo -e "${YELLOW}Step 6: Performing clean install...${NC}"
rm -rf node_modules
npm install
echo -e "${GREEN}✓ Clean install complete${NC}"
echo ""

# Step 7: Run audit
echo -e "${YELLOW}Step 7: Running final security audit...${NC}"
npm audit || true
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}Cleanup Complete!${NC}"
echo "=================================================="
echo ""
echo "Changes made:"
echo "  - Removed 5 unused dependencies"
echo "  - Updated Firebase to fix security vulnerabilities"
echo "  - Updated several packages to latest versions"
echo "  - Performed clean install"
echo ""
echo "Next steps:"
echo "  1. Test your app thoroughly"
echo "  2. Run: npm outdated (to see remaining updates)"
echo "  3. Consider updating date-fns and zustand (requires testing)"
echo ""
echo "Backup location: package.json.backup"
echo "To restore: mv package.json.backup package.json"
echo ""
