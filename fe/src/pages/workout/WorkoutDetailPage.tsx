import { useState, type ReactNode } from "react";
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
} from "lucide-react";
import { utcToLocalTime } from "@/utils/time.util";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
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

        {/* 세션 메타 정보 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 w-12">날짜</span>
            <span>{localDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 w-12">시간</span>
            <span>
              {localStart} – {localEnd}{" "}
              <span className="text-gray-400">({workout.duration_minutes}분)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Dumbbell className="text-primary-600 flex-shrink-0" size={18} />
            <span className="font-medium text-gray-500 w-12">운동</span>
            <span>{workout.exercises.length}개</span>
          </div>
        </div>

        {/* 운동 목록 */}
        <div>
          <h2 className="text-base font-semibold mb-3">운동 목록</h2>
          {workout.exercises.length === 0 ? (
            <p className="text-sm text-gray-400">등록된 운동이 없습니다.</p>
          ) : (
            <div className="space-y-3">
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
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {exercise.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                        {typeIcon}
                        {typeLabel}
                      </span>
                    </div>
                    {exercise.sets.length === 0 ? (
                      <p className="text-xs text-gray-400">세트 기록 없음</p>
                    ) : (
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-gray-400 w-12 text-xs">
                              {setIdx + 1}세트
                            </span>
                            {exercise.exercise_type === "aerobic" ? (
                              <>
                                <span className="font-medium">
                                  {set.distance_km} km
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="font-medium">
                                  {set.duration_seconds
                                    ? `${Math.floor(set.duration_seconds / 60)}분 ${set.duration_seconds % 60}초`
                                    : "0초"}
                                </span>
                              </>
                            ) : exercise.exercise_type === "count" ? (
                              <span className="font-medium">
                                {set.reps} 회
                              </span>
                            ) : exercise.exercise_type === "duration" ? (
                              <span className="font-medium">
                                {set.duration_seconds
                                  ? `${Math.floor(set.duration_seconds / 60)}분 ${set.duration_seconds % 60}초`
                                  : "0초"}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium">
                                  {set.weight_kg} kg
                                </span>
                                <span className="text-gray-300">×</span>
                                <span className="font-medium">
                                  {set.reps} 회
                                </span>
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
      >
        <WorkoutForm
          initialWorkout={workout}
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
          <p className="text-sm text-gray-600">
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
