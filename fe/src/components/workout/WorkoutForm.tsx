import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExerciseInput, ExerciseInputData } from "./ExerciseInput";
import { Plus } from "lucide-react";
import { WorkoutCreateRequest } from "@/types/workout.types";
import { useCategories } from "@/hooks/useCategories";

interface WorkoutFormProps {
  onSubmit: (data: WorkoutCreateRequest) => Promise<void>;
  onCancel: () => void;
}

export const WorkoutForm = ({ onSubmit, onCancel }: WorkoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [exercises, setExercises] = useState<ExerciseInputData[]>([]);

  const { categories, createCategory } = useCategories();

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: [{ weight_kg: 0, reps: 1 }] },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, exercise: ExerciseInputData) => {
    const newExercises = [...exercises];
    newExercises[index] = exercise;
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 직접 입력한 카테고리 이름이 목록에 없으면 자동 추가
      const existingNames = new Set(categories.map((c) => c.name));
      for (const ex of exercises) {
        if (ex.name && !existingNames.has(ex.name)) {
          await createCategory(ex.name);
          existingNames.add(ex.name);
        }
      }

      const data: WorkoutCreateRequest = {
        workout_date: workoutDate,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets.map((s) => ({
            weight_kg: s.weight_kg,
            reps: s.reps,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="운동 날짜"
          type="date"
          value={workoutDate}
          onChange={(e) => setWorkoutDate(e.target.value)}
          required
        />
        <Input
          label="시작 시간"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          label="종료 시간"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            운동 목록{" "}
            <span className="text-sm font-normal text-gray-500">
              (선택 사항)
            </span>
          </h3>
          <Button type="button" onClick={addExercise} size="sm">
            <Plus size={16} className="mr-1" />
            운동 추가
          </Button>
        </div>

        {exercises.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            운동을 추가하거나 빈 세션으로 저장할 수 있습니다.
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

      <div className="flex gap-3 justify-end">
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
