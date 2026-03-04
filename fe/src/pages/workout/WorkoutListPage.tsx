import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Plus, ArrowDownUp } from "lucide-react";
import { WorkoutSession } from "@/types/workout.types";

export const WorkoutListPage = () => {
  const { workouts, isLoading, createWorkout } = useWorkouts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySource, setCopySource] = useState<WorkoutSession | null>(null);
  // BE는 항상 날짜 내림차순(최신순) 반환 → 기본값 false = 최신순
  const [isAscending, setIsAscending] = useState(false);

  const handleCreate = async (data: any) => {
    await createWorkout(data);
    setIsModalOpen(false);
  };

  const handleCopyCreate = async (data: any) => {
    await createWorkout(data);
    setCopySource(null);
  };

  const sortedWorkouts = isAscending ? [...workouts].reverse() : workouts;

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
        <div className="flex items-center gap-2">
          {workouts.length > 1 && (
            <button
              type="button"
              onClick={() => setIsAscending((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                isAscending
                  ? "border-primary-300 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title={isAscending ? "최신순으로 보기" : "오래된순으로 보기"}
            >
              <ArrowDownUp size={14} />
              {isAscending ? "오래된순" : "최신순"}
            </button>
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            운동 기록 추가
          </Button>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWorkouts.map((workout) => (
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
