import { WorkoutSession } from "@/types/workout.types";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkoutCardProps {
  workout: WorkoutSession;
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <Link to={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar size={16} />
              <span className="text-sm">{workout.workout_date}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Clock size={16} />
              <span className="text-sm">
                {workout.start_time} - {workout.end_time} (
                {workout.duration_minutes}분)
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={16} className="text-primary-600" />
              <span className="font-medium">
                {workout.exercises.length}개 운동
              </span>
            </div>

            <div className="space-y-1">
              {workout.exercises.slice(0, 3).map((exercise, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {exercise.name} ({exercise.sets.length}세트
                  {exercise.sets.length > 0 &&
                    ` / ${exercise.sets[0].weight_kg}kg × ${exercise.sets[0].reps}회`}
                  )
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <div className="text-sm text-gray-500">
                  + {workout.exercises.length - 3}개 더보기
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
