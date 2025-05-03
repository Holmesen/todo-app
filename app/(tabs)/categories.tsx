import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
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
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  // 获取窗口宽度以计算网格列数
  const numColumns = dimensions.width > 500 ? 3 : 2;

  // 获取认证用户
  const { user } = useAuthStore();

  // 从分类存储中获取分类状态和操作
  const {
    featuredCategories,
    searchQuery,
    isLoading,
    isSaving,
    error,
    fetchCategoriesWithStats,
    addCategory,
    deleteCategory,
    setSearchQuery,
    getFilteredCategories,
  } = useCategoryStore();

  // 在初始渲染时加载分类
  useEffect(() => {
    if (user?.id) {
      fetchCategoriesWithStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 处理分类选择
  const handleCategoryPress = (category: CategoryWithStats) => {
    // 导航到首页标签并带有分类过滤器
    // 由于没有直接的任务路由，使用带查询参数的索引路由
    router.push({
      pathname: '/',
      params: { categoryId: category.id.toString() },
    });
  };

  // 处理添加新分类
  const handleAddCategory = async (category: { name: string; color: string; icon: string; is_featured: boolean }) => {
    if (!user?.id) {
      Alert.alert('错误', '您必须登录才能添加分类');
      return;
    }

    // 添加用户ID
    const newCategory = {
      ...category,
      user_id: Number(user.id),
    };

    // 添加到存储
    const result = await addCategory(newCategory);

    if (result) {
      // 关闭模态框 - 仅在成功时关闭
      setModalVisible(false);
    } else {
      // 错误提醒将通过存储中的错误状态显示
      // 我们不关闭模态框，让用户可以重试
    }
  };

  // 处理删除分类
  const handleDeleteCategory = async (category: CategoryWithStats) => {
    try {
      setDeletingCategoryId(category.id);
      await deleteCategory(category.id);
      setDeletingCategoryId(null);
    } catch (error) {
      console.error('删除类别失败:', error);
      setDeletingCategoryId(null);
      Alert.alert('删除失败', '无法删除该类别，请稍后再试。');
    }
  };

  // 获取基于搜索的过滤分类
  const filteredCategories = getFilteredCategories();

  // 渲染精选分类项
  const renderFeaturedItem = ({ item }: { item: CategoryWithStats }) => (
    <CategoryCard category={item} onPress={handleCategoryPress} />
  );

  // 渲染分类列表项
  const renderCategoryItem = ({ item }: { item: CategoryWithStats }) => (
    <CategoryListItem
      category={item}
      onPress={handleCategoryPress}
      onDelete={handleDeleteCategory}
      isDeleting={deletingCategoryId === item.id}
    />
  );

  const fetchCategoriesWithStatsSync = () => {
    fetchCategoriesWithStats();
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="搜索分类..." />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategoriesWithStatsSync}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <>
              {/* 精选分类标题 */}
              {(featuredCategories.length > 0 || !searchQuery) && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>精选分类</Text>
                  <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} disabled={isSaving}>
                    <FontAwesome name="plus" size={14} style={styles.addIcon} />
                    <Text style={styles.addButtonText}>添加</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 精选分类网格 */}
              {featuredCategories.length > 0 ? (
                <FlatList
                  data={
                    searchQuery
                      ? featuredCategories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      : featuredCategories
                  }
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
                  <Text style={styles.emptyText}>暂无精选分类</Text>
                </View>
              ) : null}

              {/* 所有分类标题 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>所有分类</Text>
                {filteredCategories.length > 0 && (
                  <Text style={styles.categoryCount}>{`${filteredCategories.length}个分类`}</Text>
                )}
              </View>
            </>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {searchQuery ? (
                <Text style={styles.emptyText}>未找到与"{searchQuery}"匹配的分类</Text>
              ) : (
                <>
                  <Text style={styles.emptyText}>未找到分类</Text>
                  <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.emptyButtonText}>创建您的第一个分类</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={filteredCategories.length === 0 ? { flex: 1 } : styles.listContent}
        />
      )}

      {/* 添加分类模态框 */}
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
  categoryCount: {
    fontSize: 14,
    color: '#8e8e93',
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
