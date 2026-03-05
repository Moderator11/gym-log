import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExerciseInput, ExerciseInputData } from "./ExerciseInput";
import {
  Plus,
  Clock,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { WorkoutCreateRequest, WorkoutSession } from "@/types/workout.types";
import { useCategories } from "@/hooks/useCategories";
import {
  getTodayDate,
  getCurrentLocalTime,
  localToUtcTime,
  utcToLocalTime,
} from "@/utils/time.util";

interface WorkoutFormProps {
  onSubmit: (data: WorkoutCreateRequest) => Promise<void>;
  onCancel: () => void;
  /** 수정 모드일 때 기존 데이터를 전달합니다. */
  initialWorkout?: WorkoutSession;
  /**
   * 복사 모드: true이면 initialWorkout의 운동 목록만 가져오고,
   * 날짜·시간·제목·메모는 빈 값(오늘/현재)으로 초기화합니다.
   */
  isCopy?: boolean;
  /**
   * 제공 시 "저장"(모달 유지) / "닫기"(저장 후 모달 닫기) / "취소" 세 버튼이 표시됩니다.
   * 미제공 시 기존 "취소" / "저장" 두 버튼.
   */
  onSaveAndClose?: (data: WorkoutCreateRequest) => Promise<void>;
}

export const WorkoutForm = ({
  onSubmit,
  onCancel,
  initialWorkout,
  isCopy,
  onSaveAndClose,
}: WorkoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReorderControls, setShowReorderControls] = useState(false);

  const [workoutDate, setWorkoutDate] = useState(() =>
    !isCopy && initialWorkout ? initialWorkout.workout_date : getTodayDate(),
  );
  const [startTime, setStartTime] = useState(() =>
    !isCopy && initialWorkout
      ? utcToLocalTime(initialWorkout.workout_date, initialWorkout.start_time)
      : getCurrentLocalTime(),
  );
  const [endTime, setEndTime] = useState(() =>
    !isCopy && initialWorkout
      ? utcToLocalTime(initialWorkout.workout_date, initialWorkout.end_time)
      : getCurrentLocalTime(),
  );
  const [title, setTitle] = useState(() =>
    !isCopy && initialWorkout ? (initialWorkout.title ?? "") : "",
  );
  const [memo, setMemo] = useState(() =>
    !isCopy && initialWorkout ? (initialWorkout.memo ?? "") : "",
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
      : [],
  );

  const { categories, createCategory } = useCategories();

  // 드래그 순서 변경
  const dragIndexRef = useRef<number | null>(null);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", exercise_type: "anaerobic", sets: [] },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, exercise: ExerciseInputData) => {
    const next = [...exercises];
    next[index] = exercise;
    setExercises(next);
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const next = [...exercises];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    dragIndexRef.current = index;
    setExercises(next);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const moveExercise = (from: number, to: number) => {
    const next = [...exercises];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setExercises(next);
  };

  /** 폼 데이터를 빌드한 뒤 지정한 핸들러를 호출합니다. */
  const buildAndCall = async (
    handler: (data: WorkoutCreateRequest) => Promise<void>,
  ) => {
    // 직접 입력한 이름이 카테고리 목록에 없으면 자동 추가
    const existingNames = new Set(categories.map((c) => c.name));
    for (const ex of exercises) {
      if (ex.name && !existingNames.has(ex.name)) {
        await createCategory({
          name: ex.name,
          tags: [],
          exercise_type: ex.exercise_type,
        });
        existingNames.add(ex.name);
      }
    }
    const data: WorkoutCreateRequest = {
      workout_date: workoutDate,
      start_time: localToUtcTime(workoutDate, startTime),
      end_time: localToUtcTime(workoutDate, endTime),
      title: title.trim() || null,
      memo: memo.trim() || null,
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
    await handler(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await buildAndCall(onSubmit);
    } catch (error) {
      console.error("Failed to submit workout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <Input
        label="제목 (선택)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예: 가슴·삼두 데이"
        maxLength={100}
      />

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
          <div className="flex items-center gap-2">
            {exercises.length > 1 && (
              <button
                type="button"
                onClick={() => setShowReorderControls((prev) => !prev)}
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                  showReorderControls
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ArrowUpDown size={12} />
                순서
              </button>
            )}
            <Button type="button" onClick={addExercise} size="sm">
              <Plus size={15} className="mr-1" />
              운동 추가
            </Button>
          </div>
        </div>

        {exercises.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">
            빈 세션으로 저장하거나 운동을 추가하세요.
          </p>
        )}

        {exercises.map((exercise, index) => (
          <div
            key={index}
            draggable={showReorderControls}
            onDragStart={() => showReorderControls && handleDragStart(index)}
            onDragOver={(e) => showReorderControls && handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex gap-2 items-center group"
          >
            {showReorderControls && (
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveExercise(index, index - 1)}
                  className="p-0.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="위로"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  className="p-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                  title="드래그하여 순서 변경"
                  tabIndex={-1}
                >
                  <GripVertical size={15} />
                </button>
                <button
                  type="button"
                  disabled={index === exercises.length - 1}
                  onClick={() => moveExercise(index, index + 1)}
                  className="p-0.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  aria-label="아래로"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <ExerciseInput
                exercise={exercise}
                categories={categories}
                onChange={(ex) => updateExercise(index, ex)}
                onRemove={() => removeExercise(index)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 (선택)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="오늘 운동에 대한 메모를 남겨보세요."
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
        {memo.length > 0 && (
          <p className="text-xs text-gray-400 text-right mt-0.5">
            {memo.length}/2000
          </p>
        )}
      </div>

      {onSaveAndClose ? (
        /* 수정 모드 — 취소 / 저장 / 닫기 */
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="secondary">
            저장
          </Button>
          <Button
            type="button"
            isLoading={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await buildAndCall(onSaveAndClose);
              } catch (error) {
                console.error("Failed to save and close:", error);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            저장 후 닫기
          </Button>
        </div>
      ) : (
        /* 생성/복사 모드 — 취소 / 저장 */
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            저장
          </Button>
        </div>
      )}
    </form>
  );
};
