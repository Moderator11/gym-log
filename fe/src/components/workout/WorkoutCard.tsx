import { WorkoutSession } from "@/types/workout.types";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { utcToLocalTime, utcToLocalDate } from "@/utils/time.util";

interface WorkoutCardProps {
  workout: WorkoutSession;
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const localDate = utcToLocalDate(workout.workout_date, workout.start_time);
  const localStart = utcToLocalTime(workout.workout_date, workout.start_time);
  const localEnd = utcToLocalTime(workout.workout_date, workout.end_time);

  return (
    <Link to={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar size={15} />
              <span className="text-sm">{localDate}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Clock size={15} />
              <span className="text-sm">
                {localStart} – {localEnd}{" "}
                <span className="text-gray-400">({workout.duration_minutes}분)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={15} className="text-primary-600" />
              <span className="text-sm font-medium">
                {workout.exercises.length}개 운동
              </span>
            </div>

            <div className="space-y-1">
              {workout.exercises.slice(0, 3).map((exercise, idx) => {
                const firstSet = exercise.sets[0];
                const isAerobic = exercise.exercise_type === "aerobic";

                return (
                  <div key={idx} className="text-sm text-gray-500 flex items-center gap-1">
                    <span>·</span>
                    <span>{exercise.name}</span>
                    {firstSet && (
                      <span className="text-gray-400 flex items-center gap-1">
                        ({exercise.sets.length}세트 /
                        {isAerobic ? (
                          <span>
                            {firstSet.distance_km}km × {Math.floor((firstSet.duration_seconds ?? 0) / 60)}분
                          </span>
                        ) : (
                          <span>
                            {firstSet.weight_kg}kg × {firstSet.reps}회
                          </span>
                        )}
                        )
                      </span>
                    )}
                  </div>
                );
              })}
              {workout.exercises.length > 3 && (
                <div className="text-xs text-gray-400">
                  + {workout.exercises.length - 3}개 더
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
