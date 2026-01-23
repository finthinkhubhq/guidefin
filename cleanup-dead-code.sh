#!/bin/bash
# Cleanup Dead Code Script
# Removes unused React Navigation files since app uses Expo Router

set -e

echo "========================================="
echo "GuideFin Dead Code Cleanup"
echo "========================================="
echo ""

# Create backup first
echo "📦 Creating backup..."
BACKUP_DIR="dead-code-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# List of files to remove
FILES_TO_REMOVE=(
  "App.tsx"
  "src/navigation/AppNavigator.tsx"
  "src/screens/HomeScreen.tsx"
  "src/screens/ProfileScreen.tsx"
  "src/screens/RetirementInputScreen.tsx"
)

# Backup files before removal
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo "  ✓ Backed up: $file"
  fi
done

echo ""
echo "🗑️  Removing dead code files..."

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  ✓ Removed: $file"
  else
    echo "  ⊘ Not found: $file (already removed?)"
  fi
done

# Check if src/navigation is now empty
if [ -d "src/navigation" ] && [ -z "$(ls -A src/navigation)" ]; then
  rmdir src/navigation
  echo "  ✓ Removed empty directory: src/navigation"
fi

# Check if src/screens only has used screens
echo ""
echo "📋 Remaining screens (these are still used):"
if [ -d "src/screens" ]; then
  ls -1 src/screens/ | sed 's/^/  - /'
fi

echo ""
echo "========================================="
echo "✅ Dead code cleanup completed!"
echo "========================================="
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Test your app: npx expo start"
echo "2. If everything works:"
echo "   git add -A"
echo "   git commit -m 'refactor: remove unused React Navigation code'"
echo "3. If something breaks:"
echo "   cp $BACKUP_DIR/* ./"
echo ""
