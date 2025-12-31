import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import KeyboardSafeLayout from '../../src/components/KeyboardSafeLayout';
import {
  Text,
  TextInput,
  Button,
  Card,
  List,
  IconButton,
  Divider,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useCategoriesStore, Category } from '../../src/store/atoms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryService } from '../../src/services/firebaseService';
import { auth } from '../../src/config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function SettingsScreen() {
  const { categories, setCategories } = useCategoriesStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize authentication and load categories
  useEffect(() => {
    if (!auth) {
      // Firebase not configured, use default categories
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadCategories();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load categories from Firestore
  const loadCategories = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const firestoreCategories = await categoryService.getCategories();

      // Merge with default categories (keep defaults, add custom ones)
      const defaultCategories = categories.filter((cat) => cat.isDefault);
      const customCategories = firestoreCategories.filter((cat) => !cat.isDefault);

      // Combine: defaults first, then custom
      setCategories([...defaultCategories, ...customCategories]);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Don't show alert on first load if no categories exist yet
    } finally {
      setLoading(false);
    }
  };

  // Save categories to Firestore
  const saveCategoriesToFirestore = async (updatedCategories: Category[]) => {
    if (!isAuthenticated) return;

    try {
      // Only save custom categories (not defaults)
      const customCategories = updatedCategories.filter((cat) => !cat.isDefault);
      await categoryService.saveCategories(customCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    if (categories.some((cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    try {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        isDefault: false,
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await saveCategoriesToFirestore(updatedCategories);

      setNewCategoryName('');
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  // Start editing a category
  const handleStartEdit = (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Info', 'Default categories cannot be edited');
      return;
    }
    setEditingCategory(category);
    setEditName(category.name);
    setEditDialogVisible(true);
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!editingCategory || !editName.trim()) {
      return;
    }

    // Check if name already exists (excluding current category)
    if (
      categories.some(
        (cat) =>
          cat.id !== editingCategory.id &&
          cat.name.toLowerCase() === editName.trim().toLowerCase()
      )
    ) {
      Alert.alert('Error', 'This category name already exists');
      return;
    }

    try {
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, name: editName.trim() } : cat
      );
      setCategories(updatedCategories);
      await saveCategoriesToFirestore(updatedCategories);

      setEditDialogVisible(false);
      setEditingCategory(null);
      setEditName('');
      Alert.alert('Success', 'Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  // Delete category
  const handleDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Info', 'Default categories cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCategories = categories.filter((cat) => cat.id !== category.id);
              setCategories(updatedCategories);
              await saveCategoriesToFirestore(updatedCategories);
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardSafeLayout>
        <View style={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Category Management
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Manage your expense categories
            </Text>
          </View>

          {/* Add New Category */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Add New Category
              </Text>
              <Divider style={styles.divider} />

              <TextInput
                label="Category Name"
                mode="outlined"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.input}
                placeholder="e.g., Travel, Education"
              />

              <Button
                mode="contained"
                onPress={handleAddCategory}
                style={styles.addButton}
                disabled={loading}
              >
                Add Category
              </Button>
            </Card.Content>
          </Card>

          {/* Categories List */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Categories
              </Text>
              <Divider style={styles.divider} />

              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet</Text>
              ) : (
                categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    description={category.isDefault ? 'Default category' : 'Custom category'}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={category.isDefault ? 'lock' : 'tag'}
                        color={category.isDefault ? '#757575' : '#6200ee'}
                      />
                    )}
                    right={(props) => (
                      <View style={styles.actionButtons}>
                        {!category.isDefault && (
                          <>
                            <IconButton
                              {...props}
                              icon="pencil"
                              size={20}
                              onPress={() => handleStartEdit(category)}
                            />
                            <IconButton
                              {...props}
                              icon="delete"
                              size={20}
                              iconColor="#b00020"
                              onPress={() => handleDeleteCategory(category)}
                            />
                          </>
                        )}
                      </View>
                    )}
                    style={styles.listItem}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        </View>
      </KeyboardSafeLayout>

      {/* Edit Dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => {
            setEditDialogVisible(false);
            setEditingCategory(null);
            setEditName('');
          }}
        >
          <Dialog.Title>Edit Category</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              mode="outlined"
              value={editName}
              onChangeText={setEditName}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  subtitle: {
    color: '#757575',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6200ee',
  },
  divider: {
    marginVertical: 12,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginVertical: 24,
  },
  dialogInput: {
    marginTop: 8,
  },
});

