export type ExerciseType = "anaerobic" | "aerobic";

export interface ExerciseSet {
  set_number: number;
  weight_kg?: number | null;
  reps?: number | null;
  distance_km?: number | null;
  duration_seconds?: number | null;
}

export interface Exercise {
  id?: number;
  name: string;
  exercise_type: ExerciseType;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: number;
  user_id: number;
  workout_date: string;   // UTC 날짜 (YYYY-MM-DD)
  start_time: string;     // UTC 시각 (HH:MM:SS)
  end_time: string;       // UTC 시각 (HH:MM:SS)
  duration_minutes: number;
  exercises: Exercise[];
  created_at: string;
}

/** 향후 친구 시스템에서 공유 카테고리에 tags 로 분류·검색합니다. */
export interface ExerciseCategory {
  id: number;
  name: string;
  tags: string[];
  exercise_type: ExerciseType;
}

export interface WorkoutCreateRequest {
  workout_date: string;   // UTC 날짜
  start_time: string;     // UTC 시각 (HH:MM:SS)
  end_time: string;       // UTC 시각 (HH:MM:SS)
  exercises: {
    name: string;
    exercise_type: ExerciseType;
    sets: {
      weight_kg?: number | null;
      reps?: number | null;
      distance_km?: number | null;
      duration_seconds?: number | null;
    }[];
  }[];
}

export type WorkoutUpdateRequest = Partial<WorkoutCreateRequest>;
