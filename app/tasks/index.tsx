import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

// Components
import { TaskItem } from '../../components/TaskItem';
import { TaskSection } from '../../components/TaskSection';
import { SearchBar } from '../../components/SearchBar';

// Store and services
import { useTaskStore } from '../../store/taskStore';
import { taskService } from '../../services/taskService';
import { useTasks } from '../../hooks/useTasks';

export default function TaskListScreen() {
  // Get search params from router
  const params = useLocalSearchParams<{ filter?: string; title?: string }>();
  const { filter, title } = params;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the tasks hook to get filtered tasks
  const { isLoading: isTasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();

  // Store
  const { tasks, isLoading: storeLoading, fetchTasks, error: storeError } = useTaskStore();

  // Combined loading and error states
  const isLoading = isTasksLoading || storeLoading;
  const error = tasksError || storeError;

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
    refetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), refetchTasks()]);
    setRefreshing(false);
  };

  // Filter tasks based on search query and filter parameter
  const getFilteredTasks = () => {
    let filteredBySearch = searchQuery
      ? tasks.filter((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : tasks;

    // Apply additional filtering based on filter parameter or active filter
    const currentFilter = filter || 'all';

    if (currentFilter === 'today') {
      return filteredBySearch.filter(
        (task) => !task.completed && task.date && new Date(task.date).toDateString() === new Date().toDateString()
      );
    } else if (currentFilter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      return filteredBySearch.filter(
        (task) => !task.completed && task.date && new Date(task.date) > today && new Date(task.date) <= nextWeek
      );
    } else if (currentFilter === 'completed') {
      return filteredBySearch.filter((task) => task.completed);
    } else if (currentFilter === 'overdue') {
      return filteredBySearch.filter(
        (task) => !task.completed && new Date().toLocaleDateString() > task.date.toLocaleDateString()
      );
    } else {
      return filteredBySearch;
    }
  };

  const filteredTasks = getFilteredTasks();

  // Group tasks by status if no specific filter is provided
  const pendingTasks = filter
    ? filteredTasks.filter((task) => !task.completed)
    : filteredTasks.filter((task) => !task.completed);

  const completedTasks = filter
    ? [] // Don't show completed tasks for filtered views
    : filteredTasks.filter((task) => task.completed);

  const overdueTasks = filter
    ? [] // Don't show overdue tasks separately for filtered views
    : filteredTasks.filter((task) => !task.completed && task.date && new Date(task.date) < new Date());

  // Navigate to task details
  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: '/tasks/details/[id]',
      params: { id: taskId },
    });
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    router.push({
      pathname: '/(tabs)/add-task',
    });
  };

  // Get page title based on filter
  const getPageTitle = () => {
    if (title) return title; // Use title from params if available

    if (filter === 'today') return '今天的任务';
    if (filter === 'upcoming') return '即将到来的任务';
    if (filter === 'search') return '搜索结果';

    return '任务列表';
  };

  // Get filter description text
  const getFilterDescription = () => {
    if (filter === 'today') return '显示今天需要完成的所有任务';
    if (filter === 'upcoming') return '显示未来7天内需要完成的任务';
    if (filter === 'search' && searchQuery) return `搜索"${searchQuery}"的结果`;
    return '';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: getPageTitle(),
          headerShown: true,
          headerTitleStyle: styles.headerTitle,
          headerStyle: {
            backgroundColor: '#f8f8fc',
          },
          headerShadowVisible: false,
          headerBackVisible: true,
          headerRight: () => (
            <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
              <FontAwesome name="plus" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <SearchBar placeholder="搜索任务..." value={searchQuery} onChangeText={setSearchQuery} />

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>加载失败: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {filter ? (
            // Display tasks based on filter
            <View>
              {filteredTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome name="tasks" size={64} color="#d1d1d6" />
                  <Text style={styles.emptyText}>
                    {filter === 'today'
                      ? '今天没有任务'
                      : filter === 'upcoming'
                      ? '未来 7 天没有任务'
                      : '没有匹配的任务'}
                  </Text>
                  <TouchableOpacity style={styles.createTaskButton} onPress={handleCreateTask}>
                    <Text style={styles.createTaskButtonText}>创建新任务</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Filter description */}
                  <Text style={styles.filterDescription}>{getFilterDescription()}</Text>

                  {/* Filtered tasks count */}
                  <Text style={styles.taskCountText}>{filteredTasks.length} 个任务</Text>

                  {/* Filtered tasks list */}
                  {filteredTasks.map((task) => (
                    <View key={task.id} style={styles.taskItemWrapper}>
                      <TaskItem
                        id={task.id}
                        title={task.title}
                        priority={task.priority as 'high' | 'medium' | 'low'}
                        time={taskService.formatTaskTime(task)}
                        onPress={handleTaskPress}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            // Display tasks grouped by status (default view)
            <View>
              {overdueTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                  <TaskSection title="逾期" onSeeAll={() => console.log('查看所有逾期任务')}>
                    {overdueTasks.map((task) => (
                      <View key={task.id} style={styles.taskItemWrapper}>
                        <TaskItem
                          id={task.id}
                          title={task.title}
                          priority={task.priority as 'high' | 'medium' | 'low'}
                          time={taskService.formatTaskTime(task)}
                          onPress={handleTaskPress}
                        />
                      </View>
                    ))}
                  </TaskSection>
                </View>
              )}

              {pendingTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                  <TaskSection title="待办" onSeeAll={() => console.log('查看所有待办任务')}>
                    {pendingTasks.map((task) => (
                      <View key={task.id} style={styles.taskItemWrapper}>
                        <TaskItem
                          id={task.id}
                          title={task.title}
                          priority={task.priority as 'high' | 'medium' | 'low'}
                          time={taskService.formatTaskTime(task)}
                          onPress={handleTaskPress}
                        />
                      </View>
                    ))}
                  </TaskSection>
                </View>
              )}

              {completedTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                  <TaskSection title="已完成" onSeeAll={() => console.log('查看所有已完成任务')}>
                    {completedTasks.map((task) => (
                      <View key={task.id} style={styles.taskItemWrapper}>
                        <TaskItem
                          id={task.id}
                          title={task.title}
                          priority={task.priority as 'high' | 'medium' | 'low'}
                          time={taskService.formatTaskTime(task)}
                          onPress={handleTaskPress}
                        />
                      </View>
                    ))}
                  </TaskSection>
                </View>
              )}

              {filteredTasks.length === 0 && (
                <View style={styles.emptyContainer}>
                  <FontAwesome name="tasks" size={64} color="#d1d1d6" />
                  <Text style={styles.emptyText}>暂无任务</Text>
                  <Text style={styles.emptySubText}>点击下方按钮创建您的第一个任务</Text>
                  <TouchableOpacity style={styles.createTaskButton} onPress={handleCreateTask}>
                    <Text style={styles.createTaskButtonText}>创建新任务</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating action button for creating new task */}
      {!isLoading && !error && filteredTasks.length > 0 && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleCreateTask}>
          <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8fc',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  addButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollContent: {
    paddingBottom: 80, // Extra padding for floating button
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
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#8e8e93',
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  createTaskButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  createTaskButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  filterDescription: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  taskCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  taskItemWrapper: {
    marginBottom: 8,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
