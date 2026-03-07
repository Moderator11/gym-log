import { useState } from "react";
import { WorkoutSession } from "@/types/workout.types";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, Dumbbell, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { utcToLocalTime } from "@/utils/time.util";

interface WorkoutCardProps {
  workout: WorkoutSession;
  onCopy?: () => void;
  disableLink?: boolean;
}

export const WorkoutCard = ({ workout, onCopy, disableLink }: WorkoutCardProps) => {
  const localDate = workout.workout_date;
  const localStart = utcToLocalTime(workout.workout_date, workout.start_time);
  const localEnd = utcToLocalTime(workout.workout_date, workout.end_time);
  const [expanded, setExpanded] = useState(false);

  const visibleExercises = expanded
    ? workout.exercises
    : workout.exercises.slice(0, 3);
  const hiddenCount = workout.exercises.length - 3;

  const inner = (
    <Card className={`h-full ${disableLink ? "" : "hover:shadow-lg transition-shadow cursor-pointer"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* 제목 */}
            {workout.title && (
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1.5">{workout.title}</p>
            )}

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
              <Calendar size={15} />
              <span className="text-sm">{localDate}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
              <Clock size={15} />
              <span className="text-sm">
                {localStart} – {localEnd}{" "}
                <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">({workout.duration_minutes}분)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={15} className="text-primary-600" />
              <span className="text-sm font-medium">
                {workout.exercises.length}개 운동
              </span>
            </div>

            <div className="space-y-1">
              {visibleExercises.map((exercise, idx) => {
                const firstSet = exercise.sets[0];
                const type = exercise.exercise_type;

                const setDetail = firstSet
                  ? type === "aerobic"
                    ? `${firstSet.distance_km}km · ${Math.floor((firstSet.duration_seconds ?? 0) / 60)}분`
                    : type === "count"
                    ? `${firstSet.reps}회`
                    : type === "duration"
                    ? `${Math.floor((firstSet.duration_seconds ?? 0) / 60)}분 ${(firstSet.duration_seconds ?? 0) % 60}초`
                    : `${firstSet.weight_kg}kg × ${firstSet.reps}회`
                  : null;

                return (
                  <div key={idx} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>·</span>
                    <span>{exercise.name}</span>
                    {firstSet && setDetail && (
                      <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400">
                        ({exercise.sets.length}세트 / {setDetail})
                      </span>
                    )}
                  </div>
                );
              })}

              {hiddenCount > 0 && !expanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                  className="flex items-center gap-0.5 text-xs text-primary-500 hover:text-primary-700 mt-0.5 transition-colors"
                >
                  <ChevronDown size={13} />
                  + {hiddenCount}개 더 보기
                </button>
              )}

              {expanded && hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpanded(false);
                  }}
                  className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-300 mt-0.5 transition-colors"
                >
                  <ChevronUp size={13} />
                  접기
                </button>
              )}
            </div>
          </div>

          {/* 복사 버튼 — Link 내부에서 이벤트 전파 차단 */}
          {onCopy && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopy();
              }}
              className="flex-shrink-0 p-1.5 text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="이 운동 복사해서 새 기록 만들기"
            >
              <Copy size={15} />
            </button>
          )}
        </div>
    </Card>
  );

  return disableLink ? inner : <Link to={`/workouts/${workout.id}`}>{inner}</Link>;
};
