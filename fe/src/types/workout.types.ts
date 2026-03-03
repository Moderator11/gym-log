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
  workout_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  exercises: Exercise[];
  created_at: string;
}

export interface ExerciseCategory {
  id: number;
  name: string;
}

export interface WorkoutCreateRequest {
  workout_date: string;
  start_time: string;
  end_time: string;
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
