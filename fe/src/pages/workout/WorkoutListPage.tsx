import { useState, useRef } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Plus, GripVertical, Check } from "lucide-react";
import { WorkoutSession } from "@/types/workout.types";

export const WorkoutListPage = () => {
  const { workouts, isLoading, createWorkout, reorderWorkouts, isReordering } = useWorkouts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySource, setCopySource] = useState<WorkoutSession | null>(null);

  // ── 순서 변경 ──────────────────────────────────────────────────────────
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedWorkouts, setOrderedWorkouts] = useState<WorkoutSession[]>([]);
  const dragIndexRef = useRef<number | null>(null);

  const enterReorderMode = () => {
    setOrderedWorkouts([...workouts]);
    setIsReorderMode(true);
  };

  const cancelReorderMode = () => {
    setIsReorderMode(false);
    setOrderedWorkouts([]);
  };

  const saveReorder = async () => {
    const items = orderedWorkouts.map((w, i) => ({ id: w.id, sort_order: i }));
    await reorderWorkouts(items);
    setIsReorderMode(false);
    setOrderedWorkouts([]);
  };

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const next = [...orderedWorkouts];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    dragIndexRef.current = index;
    setOrderedWorkouts(next);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };
  // ───────────────────────────────────────────────────────────────────────

  const handleCreate = async (data: any) => {
    await createWorkout(data);
    setIsModalOpen(false);
  };

  const handleCopyCreate = async (data: any) => {
    await createWorkout(data);
    setCopySource(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 운동 기록</h1>
        <div className="flex gap-2">
          {isReorderMode ? (
            <>
              <Button variant="secondary" size="sm" onClick={cancelReorderMode}>
                취소
              </Button>
              <Button size="sm" isLoading={isReordering} onClick={saveReorder}>
                <Check size={15} className="mr-1" />
                저장
              </Button>
            </>
          ) : (
            <>
              {workouts.length > 1 && (
                <Button variant="secondary" onClick={enterReorderMode}>
                  <GripVertical size={16} className="mr-1" />
                  순서 편집
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={20} className="mr-2" />
                운동 기록 추가
              </Button>
            </>
          )}
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            아직 운동 기록이 없습니다
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            첫 운동 기록 추가하기
          </Button>
        </div>
      ) : isReorderMode ? (
        <div className="space-y-2">
          {orderedWorkouts.map((workout, index) => (
            <div
              key={workout.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[0.99] transition-all"
            >
              <GripVertical size={18} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {workout.title || workout.workout_date.toString()}
                </p>
                <p className="text-xs text-gray-500">
                  {workout.title ? workout.workout_date.toString() + " · " : ""}
                  {workout.exercises.length}가지 운동
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onCopy={() => setCopySource(workout)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 운동 기록"
      >
        <WorkoutForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={copySource !== null}
        onClose={() => setCopySource(null)}
        title="운동 기록 복사"
      >
        {copySource && (
          <WorkoutForm
            initialWorkout={copySource}
            isCopy={true}
            onSubmit={handleCopyCreate}
            onCancel={() => setCopySource(null)}
          />
        )}
      </Modal>
    </div>
  );
};
