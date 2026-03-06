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

export interface ExercisePR {
  exercise_name: string;
  exercise_type: "anaerobic" | "aerobic" | "count" | "duration";
  // 무산소 - 중량 뷰
  best_weight_kg?: number;
  // 무산소 - 볼륨 뷰
  best_volume?: number;
  best_volume_weight_kg?: number;
  best_volume_reps?: number;
  // 유산소 - 거리 뷰
  best_distance_km?: number;
  // 유산소 - 평균 속도 뷰
  best_avg_speed_kmh?: number;
  // 횟수 운동
  best_reps_only?: number;
  // 시간 운동
  best_duration_seconds?: number;
  achieved_date: string;
}
