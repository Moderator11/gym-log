export interface DailyStats {
  date: string;
  workout_count: number;
  total_exercises: number;
  total_sets: number;
  total_anaerobic_volume: number;
  total_aerobic_distance: number;
  total_aerobic_duration: number;
}

export interface CalendarDayInfo {
  date: string;
  workout_count: number;
}

export interface StatsComparisonResponse {
  today: DailyStats;
  yesterday: DailyStats;
  volume_change: number;
  volume_change_pct: number | null;
}

export interface FriendStatsComparison {
  my_7day_volume: number;
  friend_7day_volume: number;
  my_workout_count: number;
  friend_workout_count: number;
}
