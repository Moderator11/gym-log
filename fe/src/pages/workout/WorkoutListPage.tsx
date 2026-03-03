import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";

export const WorkoutListPage = () => {
  const { workouts, isLoading, createWorkout } = useWorkouts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (data: any) => {
    await createWorkout(data);
    setIsModalOpen(false);
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
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          운동 기록 추가
        </Button>
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
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
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
    </div>
  );
};
