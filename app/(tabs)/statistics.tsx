import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SegmentControl } from '../../components/SegmentControl';
import { StatisticsCard } from '../../components/StatisticsCard';
import { ProgressCircle } from '../../components/ProgressCircle';
import { BarChart } from '../../components/BarChart';
import { StatCard } from '../../components/StatCard';
import { useAuthStore } from '../../store/authStore';
import { statisticsService, TaskStatistic } from '../../services/statisticsService';
import { formatDayAbbreviation, formatHoursToReadable, getDateRangeForLastDays } from '../../utils/dateUtils';

// 时间周期选项
const TIME_PERIODS = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '3个月', value: '3months' },
];

export default function StatisticsScreen() {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [stats, setStats] = useState<TaskStatistic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [timeFrameText, setTimeFrameText] = useState<string>('本周');
  const [mostProductiveDay, setMostProductiveDay] = useState<string>('-');
  const [avgCompletionTime, setAvgCompletionTime] = useState<number>(0);

  // 根据选定周期获取日期范围
  const getDateRange = (period: string) => {
    switch (period) {
      case 'week':
        setTimeFrameText('本周');
        return getDateRangeForLastDays(7);
      case 'month':
        setTimeFrameText('本月');
        return getDateRangeForLastDays(30);
      case '3months':
        setTimeFrameText('最近3个月');
        return getDateRangeForLastDays(90);
      default:
        setTimeFrameText('本周');
        return getDateRangeForLastDays(7);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const response = await statisticsService.calculateStatisticsForDateRange(user.id, startDate, endDate);

      if (response.error) {
        setError('加载统计数据失败');
        setIsLoading(false);
        throw response.error;
        // return;
      }

      if (response.data) {
        setStats(response.data);

        // 计算平均完成率
        if (response.data.length > 0) {
          if (response.tasks.length === 0) {
            setCompletionRate(1);
          } else {
            const avgCompletionRate =
              response.data.reduce((sum, stat) => sum + stat.completion_rate, 0) / response.tasks.length;

            setCompletionRate(avgCompletionRate);
          }
        }
      }

      // 获取最高效的一天
      const productiveDayResponse = await statisticsService.getMostProductiveDay(
        user.id,
        getPeriodDays(selectedPeriod)
      );
      if (productiveDayResponse.data) {
        setMostProductiveDay(productiveDayResponse.data);
      }

      // 获取平均完成时间
      const avgTimeResponse = await statisticsService.getAverageCompletionTime(user.id, getPeriodDays(selectedPeriod));
      if (avgTimeResponse.data !== null) {
        setAvgCompletionTime(avgTimeResponse.data);
      }
    } catch (err) {
      console.error('获取统计数据出错:', err);
      setError('发生意外错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取所选周期的天数
  const getPeriodDays = (period: string): number => {
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case '3months':
        return 90;
      default:
        return 7;
    }
  };

  // 处理周期变更
  const handlePeriodChange = (period: string | number) => {
    setSelectedPeriod(period as string);
  };

  // 重试加载数据
  const handleRetry = () => {
    fetchStatistics();
  };

  // 准备柱状图数据
  const getBarChartData = () => {
    // 对于较长的周期，我们可能希望显示每周或每月的汇总数据
    const dataToShow = stats.slice(-7);
    // const dataToShow = selectedPeriod === 'week' ? stats : stats.slice(-7);

    return dataToShow.map((stat) => ({
      label: formatDayAbbreviation(stat.date),
      value: stat.completed_count,
      date: stat.date,
    }));
  };

  // 获取统计摘要数据
  const getSummaryData = () => {
    if (stats.length === 0)
      return {
        created: 0,
        completed: 0,
        overdue: 0,
      };

    const totalCreated = stats.reduce((sum, stat) => sum + stat.created_count, 0);
    const totalCompleted = stats.reduce((sum, stat) => sum + stat.completed_count, 0);
    const totalOverdue = stats.reduce((sum, stat) => sum + stat.overdue_count, 0);

    return {
      created: totalCreated,
      completed: totalCompleted,
      overdue: totalOverdue,
    };
  };

  // 计算统计变化百分比
  const getChangePercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // 获取变化百分比
  const getChanges = () => {
    if (stats.length < 2)
      return {
        createdChange: 0,
        overdueChange: 0,
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
      overdueChange: getChangePercentage(recentOverdue, previousOverdue),
    };
  };

  // 当组件挂载或周期变化时获取数据
  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, user?.id]);

  // 准备摘要数据
  const summary = getSummaryData();
  const changes = getChanges();

  if (isLoading && stats.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载统计数据中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>统计</Text>

        <SegmentControl options={TIME_PERIODS} selectedValue={selectedPeriod} onValueChange={handlePeriodChange} />

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <StatisticsCard title="任务完成率" periodText={timeFrameText} showPeriodSelector={false}>
              <ProgressCircle percentage={completionRate} label="完成率" />
            </StatisticsCard>

            <StatisticsCard title="每日活动" periodText={timeFrameText} showPeriodSelector={false}>
              {stats.length > 0 ? (
                <BarChart data={getBarChartData()} />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>无可用活动数据</Text>
                </View>
              )}
            </StatisticsCard>

            <Text style={styles.summaryTitle}>摘要</Text>

            <View style={styles.statsGrid}>
              <StatCard
                label="已创建"
                value={summary.created}
                icon="plus"
                iconColor="#007AFF"
                change={{
                  value: changes.createdChange,
                  isPositive: changes.createdChange >= 0,
                }}
                style={styles.statCard}
              />

              <StatCard
                label="已过期"
                value={summary.overdue}
                icon="exclamation"
                iconColor="#FF3B30"
                change={{
                  value: changes.overdueChange,
                  isPositive: changes.overdueChange <= 0,
                }}
                style={styles.statCard}
              />

              <StatCard
                label="最高效日"
                value={mostProductiveDay}
                icon="trophy"
                iconColor="#FFCC00"
                style={styles.statCard}
              />

              <StatCard
                label="平均完成时间"
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
