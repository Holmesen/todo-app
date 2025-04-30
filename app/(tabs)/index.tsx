import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Use our tasks hook to fetch data from Supabase
  const {
    todayTasks,
    upcomingTasks,
    completedTasks,
    allTasks,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks();

  // Use our categories hook to fetch categories from Supabase
  const { isLoading: isCategoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

  // Combined loading and error states
  const isLoading = isTasksLoading || isCategoriesLoading;
  const error = tasksError || categoriesError;

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTasks(), refetchCategories()]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

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
    const filtered = allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query))
    );

    setSearchResults(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleTaskPress = (taskId: string) => {
    // Navigate to the task detail screen
    // We're using string format to avoid the pathname type checking issues
    router.push(`/tasks/details/${taskId}`);
  };

  const handleSeeAllPress = (sectionType: 'today' | 'upcoming' | 'search' | 'completed') => {
    // Update active filter based on which section was pressed
    setActiveFilter(sectionType);

    // Navigate to the tasks list page with the appropriate filter
    router.push({
      pathname: '/tasks',
      params: {
        filter: sectionType,
        title:
          sectionType === 'today'
            ? '今天的任务'
            : sectionType === 'upcoming'
            ? '即将到来的任务'
            : sectionType === 'completed'
            ? '已完成的任务'
            : '搜索结果',
      },
    });
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
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
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="搜索任务..." />

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterButtonsContainer}
          contentContainerStyle={styles.filterButtons}
        >
          <ActionButton
            label="全部"
            icon="list"
            isActive={activeFilter === 'all'}
            onPress={() => handleFilterChange('all')}
            color="#007AFF"
          />
          <ActionButton
            label="今天"
            icon="calendar"
            isActive={activeFilter === 'today'}
            onPress={() => handleFilterChange('today')}
            color="#34C759"
          />
          <ActionButton
            label="即将到来"
            icon="clock-o"
            isActive={activeFilter === 'upcoming'}
            onPress={() => handleFilterChange('upcoming')}
            color="#FF9500"
          />
          <ActionButton
            label="已完成"
            icon="check"
            isActive={activeFilter === 'completed'}
            onPress={() => handleFilterChange('completed')}
            color="#5856D6"
          />
        </ScrollView>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}。下拉刷新。</Text>
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
            onSeeAll={searchResults.length > 0 ? () => handleSeeAllPress('search') : undefined}
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
          <TaskSection title="今天的任务" onSeeAll={() => handleSeeAllPress('today')}>
            {todayTasks.length === 0 ? (
              <Text style={styles.emptyStateText}>今天没有安排任务</Text>
            ) : (
              // 只显示最近的3个今天的任务
              todayTasks
                .slice(0, 3)
                .map((task) => (
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
            {todayTasks.length > 3 && (
              <TouchableOpacity style={styles.moreButton} onPress={() => handleSeeAllPress('today')}>
                <Text style={styles.moreButtonText}>查看全部 {todayTasks.length} 个任务</Text>
              </TouchableOpacity>
            )}
          </TaskSection>
        )}

        {/* Upcoming Tasks Section - Hide when searching */}
        {!isSearching && !isLoading && !error && (
          <TaskSection title="即将到来" onSeeAll={() => handleSeeAllPress('upcoming')}>
            {upcomingTasks.length === 0 ? (
              <Text style={styles.emptyStateText}>没有即将到来的任务</Text>
            ) : (
              // 只显示最近的3个即将到来的任务
              upcomingTasks
                .slice(0, 3)
                .map((task) => (
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
            {upcomingTasks.length > 3 && (
              <TouchableOpacity style={styles.moreButton} onPress={() => handleSeeAllPress('upcoming')}>
                <Text style={styles.moreButtonText}>查看全部 {upcomingTasks.length} 个任务</Text>
              </TouchableOpacity>
            )}
          </TaskSection>
        )}

        {/* Completed Tasks Section - Hide when searching */}
        {!isSearching && !isLoading && !error && (
          <TaskSection title="已完成" onSeeAll={() => handleSeeAllPress('completed')}>
            {completedTasks.length === 0 ? (
              <Text style={styles.emptyStateText}>暂无已完成的任务</Text>
            ) : (
              // 只显示最近的3个已完成任务
              completedTasks
                .slice(0, 3)
                .map((task) => (
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
            {completedTasks.length > 3 && (
              <TouchableOpacity style={styles.moreButton} onPress={() => handleSeeAllPress('completed')}>
                <Text style={styles.moreButtonText}>查看全部 {completedTasks.length} 个任务</Text>
              </TouchableOpacity>
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
  filterButtonsContainer: {
    marginTop: 4,
    marginBottom: 20,
  },
  filterButtons: {
    paddingVertical: 4,
  },
  moreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  moreButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
