import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExerciseInput, ExerciseInputData } from "./ExerciseInput";
import { Plus, Clock } from "lucide-react";
import { WorkoutCreateRequest, WorkoutSession } from "@/types/workout.types";
import { useCategories } from "@/hooks/useCategories";
import {
  getTodayDate,
  getCurrentLocalTime,
  localToUtcTime,
  utcToLocalDate,
  utcToLocalTime,
} from "@/utils/time.util";

interface WorkoutFormProps {
  onSubmit: (data: WorkoutCreateRequest) => Promise<void>;
  onCancel: () => void;
  /** 수정 모드일 때 기존 데이터를 전달합니다. */
  initialWorkout?: WorkoutSession;
}

export const WorkoutForm = ({ onSubmit, onCancel, initialWorkout }: WorkoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(() =>
    initialWorkout
      ? utcToLocalDate(initialWorkout.workout_date, initialWorkout.start_time)
      : getTodayDate()
  );
  const [startTime, setStartTime] = useState(() =>
    initialWorkout
      ? utcToLocalTime(initialWorkout.workout_date, initialWorkout.start_time)
      : getCurrentLocalTime()
  );
  const [endTime, setEndTime] = useState(() =>
    initialWorkout
      ? utcToLocalTime(initialWorkout.workout_date, initialWorkout.end_time)
      : getCurrentLocalTime()
  );
  const [exercises, setExercises] = useState<ExerciseInputData[]>(() =>
    initialWorkout
      ? initialWorkout.exercises.map((ex) => ({
          name: ex.name,
          exercise_type: ex.exercise_type,
          sets: ex.sets.map((s) => ({
            weight_kg: s.weight_kg,
            reps: s.reps,
            distance_km: s.distance_km,
            duration_seconds: s.duration_seconds,
          })),
        }))
      : []
  );

  const { categories, createCategory } = useCategories();

  const addExercise = () => {
    setExercises([...exercises, { name: "", exercise_type: "anaerobic", sets: [] }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, exercise: ExerciseInputData) => {
    const next = [...exercises];
    next[index] = exercise;
    setExercises(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 직접 입력한 이름이 카테고리 목록에 없으면 자동 추가
      const existingNames = new Set(categories.map((c) => c.name));
      for (const ex of exercises) {
        if (ex.name && !existingNames.has(ex.name)) {
          await createCategory({ name: ex.name, tags: [], exercise_type: ex.exercise_type });
          existingNames.add(ex.name);
        }
      }

      const data: WorkoutCreateRequest = {
        workout_date: workoutDate,
        start_time: localToUtcTime(workoutDate, startTime),
        end_time: localToUtcTime(workoutDate, endTime),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          exercise_type: ex.exercise_type,
          sets: ex.sets.map((s) => ({
            weight_kg: s.weight_kg,
            reps: s.reps,
            distance_km: s.distance_km,
            duration_seconds: s.duration_seconds,
          })),
        })),
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Failed to submit workout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 날짜 / 시간 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="운동 날짜"
          type="date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          required
        />

        {/* 시작 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시작 시간
          </label>
          <div className="flex gap-2">
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setStartTime(getCurrentLocalTime())}
              className="flex-shrink-0 px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 text-gray-600 transition-colors"
              title="현재 시각으로 설정"
            >
              <Clock size={14} />
            </button>
          </div>
        </div>

        {/* 종료 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            종료 시간
          </label>
          <div className="flex gap-2">
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setEndTime(getCurrentLocalTime())}
              className="flex-shrink-0 px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 text-gray-600 transition-colors"
              title="현재 시각으로 설정"
            >
              <Clock size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 운동 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            운동 목록{" "}
            <span className="text-sm font-normal text-gray-400">(선택)</span>
          </h3>
          <Button type="button" onClick={addExercise} size="sm">
            <Plus size={15} className="mr-1" />
            운동 추가
          </Button>
        </div>

        {exercises.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">
            빈 세션으로 저장하거나 운동을 추가하세요.
          </p>
        )}

        {exercises.map((exercise, index) => (
          <ExerciseInput
            key={index}
            exercise={exercise}
            categories={categories}
            onChange={(ex) => updateExercise(index, ex)}
            onRemove={() => removeExercise(index)}
          />
        ))}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          저장
        </Button>
      </div>
    </form>
  );
};
