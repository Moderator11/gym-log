import { ExerciseType } from "@/types/workout.types";

export interface DefaultExercise {
  name: string;
  exercise_type: ExerciseType;
}

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  { name: "Bench Press", exercise_type: "anaerobic" },
  { name: "Squat", exercise_type: "anaerobic" },
  { name: "Deadlift", exercise_type: "anaerobic" },
  { name: "Leg Press", exercise_type: "anaerobic" },
  { name: "Lying Leg Extension", exercise_type: "anaerobic" },
  { name: "Seated Leg Extension", exercise_type: "anaerobic" },
  { name: "Lat Pulldown", exercise_type: "anaerobic" },
  { name: "Shoulder Press", exercise_type: "anaerobic" },
  { name: "Bicep Curl", exercise_type: "anaerobic" },
  { name: "Tricep Pushdown", exercise_type: "anaerobic" },

  { name: "Running", exercise_type: "aerobic" },
  { name: "Jogging", exercise_type: "aerobic" },
  { name: "Cycling", exercise_type: "aerobic" },
  { name: "Swimming", exercise_type: "aerobic" },
  { name: "Rowing", exercise_type: "aerobic" },
  { name: "Jump Rope", exercise_type: "aerobic" },
  { name: "Elliptical Trainer", exercise_type: "aerobic" },
  { name: "Stair Climber", exercise_type: "aerobic" },

  { name: "Push Up", exercise_type: "count" },
  { name: "Pull Up", exercise_type: "count" },
  { name: "Sit Up", exercise_type: "count" },
  { name: "Crunch", exercise_type: "count" },
  { name: "Burpee", exercise_type: "count" },
  { name: "Jump Squat", exercise_type: "count" },
  { name: "Lunge", exercise_type: "count" },
  { name: "Mountain Climber", exercise_type: "count" },

  { name: "Plank", exercise_type: "duration" },
  { name: "Side Plank", exercise_type: "duration" },
  { name: "Wall Sit", exercise_type: "duration" },
  { name: "Hollow Hold", exercise_type: "duration" },
  { name: "Glute Bridge Hold", exercise_type: "duration" },
  { name: "Superman Hold", exercise_type: "duration" },
];
