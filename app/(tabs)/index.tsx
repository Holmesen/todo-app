import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Components
import { SearchBar } from '../../components/SearchBar';
import { ActionButton } from '../../components/ActionButton';
import { TaskSection } from '../../components/TaskSection';
import { TaskItem } from '../../components/TaskItem';

// Hooks
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { taskService } from '../../services/taskService';

// Default quick action buttons
const DEFAULT_QUICK_ACTIONS = [
  { id: 'all', label: '全部', icon: 'list', color: 'blue' },
  { id: 'today', label: '今天', icon: 'calendar', color: 'green' },
  { id: 'upcoming', label: '即将到来', icon: 'clock-o', color: 'orange' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Use our tasks hook to fetch data from Supabase
  const {
    todayTasks,
    upcomingTasks,
    filteredTasks,
    allTasks,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks,
    setActiveFilter
  } = useTasks();

  // Use our categories hook to fetch categories from Supabase
  const {
    featuredCategories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Combined loading and error states
  const isLoading = isTasksLoading || isCategoriesLoading;
  const error = tasksError || categoriesError;

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchTasks(),
        refetchCategories(),
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Combine default quick actions with featured categories
  const quickActionButtons = useMemo(() => {
    const categoryButtons = featuredCategories.map(category => ({
      id: category.id.toString(),
      label: category.name,
      color: category.color,
      icon: category.icon,
    }));

    return [...DEFAULT_QUICK_ACTIONS, ...categoryButtons];
  }, [featuredCategories]);

  // Handle search functionality
  useEffect(() => {
    // If search query is empty, we're not searching
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Filter all tasks based on the search query
    const query = searchQuery.toLowerCase().trim();
    const filtered = allTasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );

    setSearchResults(filtered);
  }, [searchQuery]);

  const handleTaskPress = (taskId: string) => {
    // Navigate to the task detail screen
    // We're using string format to avoid the pathname type checking issues
    router.push(`/tasks/details/${taskId}`);
  };

  const handleSeeAllPress = (sectionType: 'today' | 'upcoming') => {
    // Update active filter based on which section was pressed
    setActiveFilter(sectionType);
    // For now, just show an alert since we haven't set up the tasks list screen yet
    Alert.alert('查看全部', `查看所有${sectionType === 'today' ? '今天' : '即将到来'}的任务`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'android' ? insets.top : 0,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']} // Android
            tintColor="#007AFF" // iOS
          />
        }
      >
        <Text style={styles.header}>今天</Text>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索任务..."
        />

        {/* Quick Action Buttons - Hide when searching */}
        {!isSearching && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionButtonsContainer}
            contentContainerStyle={styles.actionButtons}
          >
            {quickActionButtons.map((button) => (
              <ActionButton
                key={button.id}
                label={button.label}
                color={button.color}
                icon={button.icon}
                isActive={button.id === 'all' ? filteredTasks === todayTasks : false}
                onPress={() => setActiveFilter(button.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}。下拉刷新。
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Search Results */}
        {isSearching && !isLoading && !error && (
          <TaskSection
            title="搜索结果"
            onSeeAll={searchResults.length > 0 ? () => { Alert.alert('查看全部', '查看所有匹配的任务'); } : undefined}
          >
            {searchResults.length === 0 ? (
              <Text style={styles.emptyStateText}>没有找到匹配的任务</Text>
            ) : (
              searchResults.map((task) => (
                <TaskItem
                  key={task.id?.toString()}
                  id={task.id?.toString() || ''}
                  title={task.title}
                  priority={task.priority}
                  time={taskService.formatTaskTime(task)}
                  onPress={handleTaskPress}
                />
              ))
            )}
          </TaskSection>
        )}

        {/* Today's Tasks Section - Hide when searching */}
        {!isSearching && !isLoading && !error && (
          <TaskSection
            title="今天的任务"
            onSeeAll={() => handleSeeAllPress('today')}
          >
            {todayTasks.length === 0 ? (
              <Text style={styles.emptyStateText}>今天没有安排任务</Text>
            ) : (
              todayTasks.map((task) => (
                <TaskItem
                  key={task.id?.toString()}
                  id={task.id?.toString() || ''}
                  title={task.title}
                  priority={task.priority}
                  time={taskService.formatTaskTime(task)}
                  onPress={handleTaskPress}
                />
              ))
            )}
          </TaskSection>
        )}

        {/* Upcoming Tasks Section - Hide when searching */}
        {!isSearching && !isLoading && !error && (
          <TaskSection
            title="即将到来"
            onSeeAll={() => handleSeeAllPress('upcoming')}
          >
            {upcomingTasks.length === 0 ? (
              <Text style={styles.emptyStateText}>没有即将到来的任务</Text>
            ) : (
              upcomingTasks.map((task) => (
                <TaskItem
                  key={task.id?.toString()}
                  id={task.id?.toString() || ''}
                  title={task.title}
                  priority={task.priority}
                  time={taskService.formatTaskTime(task)}
                  onPress={handleTaskPress}
                />
              ))
            )}
          </TaskSection>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 41,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    paddingVertical: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFEEEE',
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#8E8E93',
    padding: 20,
    fontSize: 16,
  },
}); 