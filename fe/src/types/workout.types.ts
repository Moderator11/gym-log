export interface ExerciseSet {
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface Exercise {
  id?: number;
  name: string;
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
}

export interface WorkoutCreateRequest {
  workout_date: string;   // UTC 날짜
  start_time: string;     // UTC 시각 (HH:MM:SS)
  end_time: string;       // UTC 시각 (HH:MM:SS)
  exercises: {
    name: string;
    sets: { weight_kg: number; reps: number }[];
  }[];
}

export interface WorkoutUpdateRequest {
  workout_date?: string;
  start_time?: string;
  end_time?: string;
  exercises?: {
    name: string;
    sets: { weight_kg: number; reps: number }[];
  }[];
}
