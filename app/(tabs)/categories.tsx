import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { CategoryCard } from '../../components/CategoryCard';
import { CategoryListItem } from '../../components/CategoryListItem';
import { AddCategoryModal } from '../../components/AddCategoryModal';
import { useCategoryStore, CategoryWithStats } from '../../store/categoryStore';
import { useAuthStore } from '../../store/authStore';

export default function CategoriesScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);

  // Get window width to calculate grid columns
  const numColumns = dimensions.width > 500 ? 3 : 2;

  // Get the authenticated user
  const { user } = useAuthStore();

  // Get categories state and actions from category store
  const {
    featuredCategories,
    searchQuery,
    isLoading,
    isSaving,
    error,
    fetchCategoriesWithStats,
    addCategory,
    setSearchQuery,
    getFilteredCategories
  } = useCategoryStore();

  // Load categories on initial render
  useEffect(() => {
    if (user?.id) {
      fetchCategoriesWithStats();
    }
  }, [user]);

  // Handle category selection
  const handleCategoryPress = (category: CategoryWithStats) => {
    // Navigate to the home tab with category filter
    // Since there's no direct tasks route, use the index route with query params
    router.push({
      pathname: '/',
      params: { categoryId: category.id.toString() }
    });
  };

  // Handle adding a new category
  const handleAddCategory = async (category: {
    name: string;
    color: string;
    icon: string;
    is_featured: boolean
  }) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to add categories');
      return;
    }

    // Add the user id
    const newCategory = {
      ...category,
      user_id: Number(user.id)
    };

    // Add to the store
    const result = await addCategory(newCategory);

    if (result) {
      // Close the modal - only close on success
      setModalVisible(false);
    } else {
      // Error alert will be shown by the store through the error state
      // We don't close the modal so the user can try again
    }
  };

  // Get filtered categories based on search
  const filteredCategories = getFilteredCategories();

  // Render featured category item
  const renderFeaturedItem = ({ item }: { item: CategoryWithStats }) => (
    <CategoryCard
      category={item}
      onPress={handleCategoryPress}
    />
  );

  // Render category list item
  const renderCategoryItem = ({ item }: { item: CategoryWithStats }) => (
    <CategoryListItem
      category={item}
      onPress={handleCategoryPress}
    />
  );

  const fetchCategoriesWithStatsSync = () => {
    fetchCategoriesWithStats()
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search categories..."
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCategoriesWithStatsSync}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <>
              {/* Featured Categories Header */}
              {(featuredCategories.length > 0 || !searchQuery) && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured Categories</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <FontAwesome name="plus" size={14} style={styles.addIcon} />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Featured Categories Grid */}
              {featuredCategories.length > 0 ? (
                <FlatList
                  data={searchQuery ? featuredCategories.filter(
                    c => c.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ) : featuredCategories}
                  renderItem={renderFeaturedItem}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={numColumns}
                  horizontal={false}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gridContainer}
                  columnWrapperStyle={styles.gridRow}
                />
              ) : !searchQuery ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No featured categories yet</Text>
                </View>
              ) : null}

              {/* All Categories Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Categories</Text>
              </View>
            </>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {searchQuery ? (
                <Text style={styles.emptyText}>No categories found for "{searchQuery}"</Text>
              ) : (
                <>
                  <Text style={styles.emptyText}>No categories found</Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.emptyButtonText}>Create your first category</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={
            filteredCategories.length === 0 ? { flex: 1 } : styles.listContent
          }
        />
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddCategory}
        isSaving={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    color: '#007aff',
    marginRight: 4,
  },
  addButtonText: {
    color: '#007aff',
    fontSize: 15,
    fontWeight: '600',
  },
  gridContainer: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007aff',
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
}); 