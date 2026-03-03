import { useState } from "react";
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
} from "lucide-react";

export const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading } = useWorkout(Number(id));
  const { updateWorkout, deleteWorkout } = useWorkouts();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdate = async (data: any) => {
    await updateWorkout({ id: Number(id), data });
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteWorkout(Number(id));
    navigate("/workouts");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">운동 기록을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/workouts")}
        >
          <ArrowLeft size={16} className="mr-1" />
          목록으로
        </Button>
      </div>

      <Card>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">운동 상세 정보</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit size={16} className="mr-1" />
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} className="mr-1" />
              삭제
            </Button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-primary-600" size={20} />
            <span className="font-medium">날짜:</span>
            <span>{workout.workout_date}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="text-primary-600" size={20} />
            <span className="font-medium">시간:</span>
            <span>
              {workout.start_time} - {workout.end_time} (
              {workout.duration_minutes}분)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Dumbbell className="text-primary-600" size={20} />
            <span className="font-medium">총 운동 수:</span>
            <span>{workout.exercises.length}개</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">운동 목록</h2>
          {workout.exercises.length === 0 ? (
            <p className="text-gray-400 text-sm">등록된 운동이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {workout.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h3 className="font-semibold text-lg mb-2">
                    {exercise.name}
                  </h3>
                  <div className="space-y-1">
                    {exercise.sets.map((set, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <span className="w-12 text-gray-400">
                          {set.set_number}세트
                        </span>
                        <span className="font-medium">{set.weight_kg}kg</span>
                        <span className="text-gray-400">×</span>
                        <span className="font-medium">{set.reps}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="운동 기록 수정"
      >
        <WorkoutForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="운동 기록 삭제"
      >
        <div className="space-y-4">
          <p>정말로 이 운동 기록을 삭제하시겠습니까?</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
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
