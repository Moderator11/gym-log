import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
// import { useState } from "react";

export interface ExerciseInputData {
  name: string;
  sets: number;
  metricType: "weight" | "time";
  weight_kg?: number;
  duration_minutes?: number;
}

interface ExerciseInputProps {
  exercise: ExerciseInputData;
  onChange: (exercise: ExerciseInputData) => void;
  onRemove: () => void;
}

export const ExerciseInput = ({
  exercise,
  onChange,
  onRemove,
}: ExerciseInputProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="운동 이름"
            value={exercise.name}
            onChange={(e) => onChange({ ...exercise, name: e.target.value })}
            placeholder="예: 벤치프레스"
            required
          />
        </div>
        <div className="w-24">
          <Input
            label="세트"
            type="number"
            min="1"
            value={exercise.sets}
            onChange={(e) =>
              onChange({ ...exercise, sets: parseInt(e.target.value) || 1 })
            }
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="danger" size="sm" onClick={onRemove}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`metric-${exercise.name}`}
              checked={exercise.metricType === "weight"}
              onChange={() =>
                onChange({
                  ...exercise,
                  metricType: "weight",
                  duration_minutes: undefined,
                })
              }
            />
            <span className="text-sm">무게</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`metric-${exercise.name}`}
              checked={exercise.metricType === "time"}
              onChange={() =>
                onChange({
                  ...exercise,
                  metricType: "time",
                  weight_kg: undefined,
                })
              }
            />
            <span className="text-sm">시간</span>
          </label>
        </div>

        {exercise.metricType === "weight" ? (
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              step="0.5"
              value={exercise.weight_kg || ""}
              onChange={(e) =>
                onChange({
                  ...exercise,
                  weight_kg: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="kg"
              required
            />
          </div>
        ) : (
          <div className="flex-1">
            <Input
              type="number"
              min="1"
              value={exercise.duration_minutes || ""}
              onChange={(e) =>
                onChange({
                  ...exercise,
                  duration_minutes: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="분"
              required
            />
          </div>
        )}
      </div>
    </div>
  );
};
