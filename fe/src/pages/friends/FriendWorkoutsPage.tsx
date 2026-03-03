import { useParams, useNavigate } from "react-router-dom";
import { useFriendWorkouts } from "@/hooks/useFriends";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const FriendWorkoutsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const friendId = id ? parseInt(id, 10) : null;
  const { data: workouts, isLoading, error } = useFriendWorkouts(friendId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="secondary" onClick={() => navigate("/friends")}>
          <ArrowLeft size={16} className="mr-1" />
          친구 목록으로
        </Button>
        <p className="text-center text-gray-500 py-12">
          운동 기록을 불러올 수 없습니다. 친구가 공유를 비활성화했을 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate("/friends")}>
          <ArrowLeft size={16} className="mr-1" />
          친구 목록으로
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">친구의 운동 기록</h1>
      </div>

      {!workouts || workouts.length === 0 ? (
        <p className="text-center text-gray-400 py-12">아직 운동 기록이 없습니다</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => (
            <div key={workout.id} className="pointer-events-none">
              <WorkoutCard workout={workout} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
