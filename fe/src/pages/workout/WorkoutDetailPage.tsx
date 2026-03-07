import { useState, useRef, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkout, useWorkouts } from "@/hooks/useWorkouts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import {
  Calendar,
  Clock,
  Dumbbell,
  Edit,
  Trash2,
  ArrowLeft,
  Zap,
  Wind,
  Hash,
  Timer,
  Copy,
  FileText,
  GripVertical,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Exercise } from "@/types/workout.types";
import { utcToLocalTime } from "@/utils/time.util";
import { RestTimerModal } from "@/components/workout/RestTimerModal";

export const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkout(Number(id));
  const { createWorkout, updateWorkout, deleteWorkout, reorderExercises, isReorderingExercises } = useWorkouts();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // 운동 항목 순서 편집
  const [isExReorderMode, setIsExReorderMode] = useState(false);
  const [orderedExercises, setOrderedExercises] = useState<Exercise[]>([]);
  const exDragIndexRef = useRef<number | null>(null);

  const enterExReorderMode = () => {
    setOrderedExercises([...workout!.exercises]);
    setIsExReorderMode(true);
  };

  const cancelExReorderMode = () => {
    setIsExReorderMode(false);
    setOrderedExercises([]);
  };

  const saveExReorder = async () => {
    const items = orderedExercises
      .filter((ex) => ex.id !== undefined)
      .map((ex, i) => ({ id: ex.id as number, sort_order: i }));
    await reorderExercises({ sessionId: Number(id), items });
    setIsExReorderMode(false);
    setOrderedExercises([]);
  };

  const handleExDragStart = (index: number) => {
    exDragIndexRef.current = index;
  };

  const handleExDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = exDragIndexRef.current;
    if (from === null || from === index) return;
    const next = [...orderedExercises];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    exDragIndexRef.current = index;
    setOrderedExercises(next);
  };

  const handleExDragEnd = () => {
    exDragIndexRef.current = null;
  };

  const moveExercise = (from: number, to: number) => {
    const next = [...orderedExercises];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrderedExercises(next);
  };

  const handleUpdate = async (data: any) => {
    await updateWorkout({ id: Number(id), data });
    // 저장만 — 모달 유지
  };

  const handleUpdateAndClose = async (data: any) => {
    await updateWorkout({ id: Number(id), data });
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteWorkout(Number(id));
    navigate("/workouts");
  };

  const handleCopyCreate = async (data: any) => {
    await createWorkout(data);
    setIsCopyModalOpen(false);
    navigate("/workouts");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">운동 기록을 찾을 수 없습니다</p>
      </div>
    );
  }

  const localDate = workout.workout_date;
  const localStart = utcToLocalTime(workout.workout_date, workout.start_time);
  const localEnd = utcToLocalTime(workout.workout_date, workout.end_time);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <Button variant="secondary" size="sm" onClick={() => navigate("/workouts")}>
          <ArrowLeft size={16} className="mr-1" />
          목록으로
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-xl font-bold">운동 상세</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCopyModalOpen(true)}>
              <Copy size={15} className="mr-1" />
              복사
            </Button>
            <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit size={15} className="mr-1" />
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={15} className="mr-1" />
              삭제
            </Button>
          </div>
        </div>

        {/* 제목 */}
        {workout.title && (
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{workout.title}</p>
        )}

        {/* 세션 메타 정보 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 dark:text-gray-400 w-12">날짜</span>
            <span>{localDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 dark:text-gray-400 w-12">시간</span>
            <span>
              {localStart} – {localEnd}{" "}
              <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">({workout.duration_minutes}분)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Dumbbell className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 dark:text-gray-400 w-12">운동</span>
            <span>{workout.exercises.length}개</span>
          </div>
        </div>

        {/* 메모 */}
        {workout.memo && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-primary-600 flex-shrink-0" size={18} />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">메모</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              {workout.memo}
            </p>
          </div>
        )}

        {/* 운동 목록 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">운동 목록</h2>
            {!isExReorderMode && workout.exercises.length > 1 && (
              <button
                type="button"
                onClick={enterExReorderMode}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50"
              >
                <GripVertical size={13} />
                순서 편집
              </button>
            )}
            {isExReorderMode && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelExReorderMode}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 dark:bg-gray-700"
                >
                  <X size={13} />
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveExReorder}
                  disabled={isReorderingExercises}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 disabled:opacity-50"
                >
                  <Check size={13} />
                  저장
                </button>
              </div>
            )}
          </div>

          {workout.exercises.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">등록된 운동이 없습니다.</p>
          ) : isExReorderMode ? (
            /* 드래그 순서 편집 모드 */
            <div className="space-y-2">
              {orderedExercises.map((exercise, idx) => (
                <div
                  key={exercise.id}
                  draggable
                  onDragStart={() => handleExDragStart(idx)}
                  onDragOver={(e) => handleExDragOver(e, idx)}
                  onDragEnd={handleExDragEnd}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab active:cursor-grabbing active:opacity-60 transition-all"
                >
                  <GripVertical size={16} className="text-gray-400 dark:text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">{exercise.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">{exercise.sets.length}세트</span>
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveExercise(idx, idx - 1)}
                      className="p-0.5 rounded text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      aria-label="위로"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === orderedExercises.length - 1}
                      onClick={() => moveExercise(idx, idx + 1)}
                      className="p-0.5 rounded text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      aria-label="아래로"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 일반 보기 모드 */
            <div className="space-y-2">
              {workout.exercises.map((exercise, idx) => {
                const typeIconMap: Record<string, ReactNode> = {
                  anaerobic: <Zap size={14} />,
                  aerobic: <Wind size={14} />,
                  count: <Hash size={14} />,
                  duration: <Timer size={14} />,
                };
                const typeLabelMap: Record<string, string> = {
                  anaerobic: "무산소",
                  aerobic: "유산소",
                  count: "갯수",
                  duration: "시간",
                };
                const typeIcon = typeIconMap[exercise.exercise_type] ?? <Zap size={14} />;
                const typeLabel = typeLabelMap[exercise.exercise_type] ?? exercise.exercise_type;

                return (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {exercise.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {typeIcon}
                        {typeLabel}
                      </span>
                    </div>
                    {exercise.sets.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">세트 기록 없음</p>
                    ) : (
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 w-12 text-xs">
                              {setIdx + 1}세트
                            </span>
                            {exercise.exercise_type === "aerobic" ? (
                              <>
                                <span className="font-medium">{set.distance_km} km</span>
                                <span className="text-gray-300">·</span>
                                <span className="font-medium">
                                  {set.duration_seconds
                                    ? `${Math.floor(set.duration_seconds / 60)}분 ${set.duration_seconds % 60}초`
                                    : "0초"}
                                </span>
                              </>
                            ) : exercise.exercise_type === "count" ? (
                              <span className="font-medium">{set.reps} 회</span>
                            ) : exercise.exercise_type === "duration" ? (
                              <span className="font-medium">
                                {set.duration_seconds
                                  ? `${Math.floor(set.duration_seconds / 60)}분 ${set.duration_seconds % 60}초`
                                  : "0초"}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium">{set.weight_kg} kg</span>
                                <span className="text-gray-300">×</span>
                                <span className="font-medium">{set.reps} 회</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="운동 기록 수정"
        headerActions={
          <button
            type="button"
            onClick={() => setIsTimerModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
            title="휴식 타이머"
          >
            <Timer size={15} />
            타이머
          </button>
        }
      >
        <WorkoutForm
          initialWorkout={workout}
          onSubmit={handleUpdate}
          onSaveAndClose={handleUpdateAndClose}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <RestTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="운동 기록 복사"
      >
        <WorkoutForm
          initialWorkout={workout}
          isCopy={true}
          onSubmit={handleCopyCreate}
          onCancel={() => setIsCopyModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="운동 기록 삭제"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            정말로 이 운동 기록을 삭제하시겠습니까?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
