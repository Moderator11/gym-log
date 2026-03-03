export interface ExerciseMetrics {
  weight_kg?: number;
  duration_minutes?: number;
}

export interface Exercise {
  id?: number;
  name: string;
  sets: number;
  weight_kg?: number;
  duration_minutes?: number;
}

export interface WorkoutSession {
  id: number;
  user_id: number;
  workout_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  exercises: Exercise[];
  created_at: string;
}

export interface WorkoutCreateRequest {
  workout_date: string;
  start_time: string;
  end_time: string;
  exercises: {
    name: string;
    sets: number;
    metrics: ExerciseMetrics;
  }[];
}

export interface WorkoutUpdateRequest {
  workout_date?: string;
  start_time?: string;
  end_time?: string;
  exercises?: {
    name: string;
    sets: number;
    metrics: ExerciseMetrics;
  }[];
}
