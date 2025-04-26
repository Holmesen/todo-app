import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Components
import { SearchBar } from '../../components/SearchBar';
import { ActionButton } from '../../components/ActionButton';
import { TaskSection } from '../../components/TaskSection';
import { TaskItem } from '../../components/TaskItem';

// Mock Data
const QUICK_ACTION_BUTTONS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'shopping', label: 'Shopping' },
];

const TODAY_TASKS = [
  {
    id: '1',
    title: 'Complete project proposal',
    priority: 'high',
    time: '9:00 AM - 11:00 AM',
  },
  {
    id: '2',
    title: 'Weekly team meeting',
    priority: 'medium',
    time: '1:00 PM - 2:00 PM',
  },
  {
    id: '3',
    title: 'Call with client',
    priority: 'low',
    time: '3:30 PM - 4:00 PM',
  },
];

const UPCOMING_TASKS = [
  {
    id: '4',
    title: 'Prepare presentation slides',
    priority: 'high',
    time: 'Tomorrow, 10:00 AM',
  },
  {
    id: '5',
    title: 'Review quarterly reports',
    priority: 'medium',
    time: 'Tomorrow, 2:00 PM',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterId, setActiveFilterId] = useState('all');

  const handleTaskPress = (taskId: string) => {
    // Navigate to the task detail screen
    // We're using string format to avoid the pathname type checking issues
    router.push(`/task/details/${taskId}`);
  };

  const handleSeeAllPress = (sectionType: 'today' | 'upcoming') => {
    // For now, just show an alert since we haven't set up the tasks list screen yet
    Alert.alert('See All Pressed', `View all ${sectionType} tasks`);
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
      >
        <Text style={styles.header}>Today</Text>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Quick Action Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionButtonsContainer}
          contentContainerStyle={styles.actionButtons}
        >
          {QUICK_ACTION_BUTTONS.map((button) => (
            <ActionButton
              key={button.id}
              label={button.label}
              isActive={activeFilterId === button.id}
              onPress={() => setActiveFilterId(button.id)}
            />
          ))}
        </ScrollView>

        {/* Today's Tasks Section */}
        <TaskSection
          title="Today's Tasks"
          onSeeAll={() => handleSeeAllPress('today')}
        >
          {TODAY_TASKS.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              priority={task.priority as 'high' | 'medium' | 'low'}
              time={task.time}
              onPress={handleTaskPress}
            />
          ))}
        </TaskSection>

        {/* Upcoming Tasks Section */}
        <TaskSection
          title="Upcoming"
          onSeeAll={() => handleSeeAllPress('upcoming')}
        >
          {UPCOMING_TASKS.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              priority={task.priority as 'high' | 'medium' | 'low'}
              time={task.time}
              onPress={handleTaskPress}
            />
          ))}
        </TaskSection>
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
}); 