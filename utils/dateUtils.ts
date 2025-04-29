/**
 * Date formatting utilities for the app
 */

/**
 * Format a date string into a day abbreviation (Mon, Tue, etc.)
 * @param dateString - ISO format date string
 */
export function formatDayAbbreviation(dateString: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

/**
 * Format a date string into a month/day format (MM/DD)
 * @param dateString - ISO format date string
 */
export function formatMonthDay(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Get the date range for the last N days
 * @param days - Number of days to include
 */
export function getDateRangeForLastDays(days: number = 7): { startDate: string; endDate: string } {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days + 1); // Include today

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  };
}

/**
 * Get the date range for the current week
 */
export function getDateRangeForCurrentWeek(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Start from Monday

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // End on Sunday

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Get the date range for the current month
 */
export function getDateRangeForCurrentMonth(): { startDate: string; endDate: string } {
  const today = new Date();

  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Format hours to a readable string
 * @param hours - Number of hours
 */
export function formatHoursToReadable(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`;
  } else if (hours < 24) {
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
  } else {
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  }
}
