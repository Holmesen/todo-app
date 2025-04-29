import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SegmentControl } from '../../components/SegmentControl';
import { StatisticsCard } from '../../components/StatisticsCard';
import { ProgressCircle } from '../../components/ProgressCircle';
import { BarChart } from '../../components/BarChart';
import { StatCard } from '../../components/StatCard';
import { useAuthStore } from '../../store/authStore';
import { statisticsService, TaskStatistic } from '../../services/statisticsService';
import { FontAwesome } from '@expo/vector-icons';
import {
  formatDayAbbreviation,
  formatHoursToReadable,
  getDateRangeForLastDays,
  getDateRangeForCurrentWeek,
  getDateRangeForCurrentMonth
} from '../../utils/dateUtils';

// Time period options
const TIME_PERIODS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '3 Months', value: '3months' }
];

export default function StatisticsScreen() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [stats, setStats] = useState<TaskStatistic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [timeFrameText, setTimeFrameText] = useState<string>('This Week');
  const [mostProductiveDay, setMostProductiveDay] = useState<string>('-');
  const [avgCompletionTime, setAvgCompletionTime] = useState<number>(0);

  // Get date range based on selected period
  const getDateRange = (period: string) => {
    switch (period) {
      case 'week':
        setTimeFrameText('This Week');
        return getDateRangeForLastDays(7);
      case 'month':
        setTimeFrameText('This Month');
        return getDateRangeForLastDays(30);
      case '3months':
        setTimeFrameText('Last 3 Months');
        return getDateRangeForLastDays(90);
      default:
        setTimeFrameText('This Week');
        return getDateRangeForLastDays(7);
    }
  };

  // Fetch statistics data
  const fetchStatistics = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const response = await statisticsService.calculateStatisticsForDateRange(
        user.id,
        startDate,
        endDate
      );

      if (response.error) {
        setError('Failed to load statistics data');
        setIsLoading(false);
        throw response.error;
        // return;
      }

      if (response.data) {
        setStats(response.data);

        // Calculate average completion rate
        if (response.data.length > 0) {
          if (response.tasks.length === 0) {
            setCompletionRate(1)
          } else {
            const avgCompletionRate = response.data.reduce(
              (sum, stat) => sum + stat.completion_rate,
              0
            ) / response.tasks.length;

            setCompletionRate(avgCompletionRate);
          }
        }
      }

      // Fetch most productive day
      const productiveDayResponse = await statisticsService.getMostProductiveDay(user.id, getPeriodDays(selectedPeriod));
      if (productiveDayResponse.data) {
        setMostProductiveDay(productiveDayResponse.data);
      }

      // Fetch average completion time
      const avgTimeResponse = await statisticsService.getAverageCompletionTime(user.id, getPeriodDays(selectedPeriod));
      if (avgTimeResponse.data !== null) {
        setAvgCompletionTime(avgTimeResponse.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get number of days for selected period
  const getPeriodDays = (period: string): number => {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case '3months': return 90;
      default: return 7;
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string | number) => {
    setSelectedPeriod(period as string);
  };

  // Retry loading data
  const handleRetry = () => {
    fetchStatistics();
  };

  // Prepare bar chart data
  const getBarChartData = () => {
    // For longer periods, we might want to show weekly or monthly aggregates instead
    const dataToShow = stats.slice(-7);
    // const dataToShow = selectedPeriod === 'week' ? stats : stats.slice(-7);

    return dataToShow.map(stat => ({
      label: formatDayAbbreviation(stat.date),
      value: stat.completed_count,
      date: stat.date
    }));
  };

  // Get statistics summary data
  const getSummaryData = () => {
    if (stats.length === 0) return {
      created: 0,
      completed: 0,
      overdue: 0
    };

    const totalCreated = stats.reduce((sum, stat) => sum + stat.created_count, 0);
    const totalCompleted = stats.reduce((sum, stat) => sum + stat.completed_count, 0);
    const totalOverdue = stats.reduce((sum, stat) => sum + stat.overdue_count, 0);

    return {
      created: totalCreated,
      completed: totalCompleted,
      overdue: totalOverdue
    };
  };

  // Calculate change percentages for stats
  const getChangePercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get change percentages
  const getChanges = () => {
    if (stats.length < 2) return {
      createdChange: 0,
      overdueChange: 0
    };

    const halfLength = Math.floor(stats.length / 2);
    const recentStats = stats.slice(halfLength);
    const previousStats = stats.slice(0, halfLength);

    const recentCreated = recentStats.reduce((sum, stat) => sum + stat.created_count, 0);
    const previousCreated = previousStats.reduce((sum, stat) => sum + stat.created_count, 0);

    const recentOverdue = recentStats.reduce((sum, stat) => sum + stat.overdue_count, 0);
    const previousOverdue = previousStats.reduce((sum, stat) => sum + stat.overdue_count, 0);

    return {
      createdChange: getChangePercentage(recentCreated, previousCreated),
      overdueChange: getChangePercentage(recentOverdue, previousOverdue)
    };
  };

  // Fetch data when component mounts or period changes
  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod, user?.id]);

  // Prepare summary data
  const summary = getSummaryData();
  const changes = getChanges();

  if (isLoading && stats.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Statistics</Text>

        <SegmentControl
          options={TIME_PERIODS}
          selectedValue={selectedPeriod}
          onValueChange={handlePeriodChange}
        />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <StatisticsCard
              title="Task Completion Rate"
              periodText={timeFrameText}
              showPeriodSelector={false}
            >
              <ProgressCircle percentage={completionRate} label="Completion Rate" />
            </StatisticsCard>

            <StatisticsCard
              title="Daily Activity"
              periodText={timeFrameText}
              showPeriodSelector={false}
            >
              {stats.length > 0 ? (
                <BarChart data={getBarChartData()} />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No activity data available</Text>
                </View>
              )}
            </StatisticsCard>

            <Text style={styles.summaryTitle}>Summary</Text>

            <View style={styles.statsGrid}>
              <StatCard
                label="Created"
                value={summary.created}
                icon="plus"
                iconColor="#007AFF"
                change={{
                  value: changes.createdChange,
                  isPositive: changes.createdChange >= 0
                }}
                style={styles.statCard}
              />

              <StatCard
                label="Overdue"
                value={summary.overdue}
                icon="exclamation"
                iconColor="#FF3B30"
                change={{
                  value: changes.overdueChange,
                  isPositive: changes.overdueChange <= 0
                }}
                style={styles.statCard}
              />

              <StatCard
                label="Most Productive"
                value={mostProductiveDay}
                icon="trophy"
                iconColor="#FFCC00"
                style={styles.statCard}
              />

              <StatCard
                label="Avg. Completion"
                value={formatHoursToReadable(avgCompletionTime)}
                icon="clock-o"
                iconColor="#34C759"
                style={styles.statCard}
              />
            </View>
          </>
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
    marginBottom: 24,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  noDataContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
}); 