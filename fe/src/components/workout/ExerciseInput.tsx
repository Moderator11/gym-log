import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";
import { ExerciseCategory } from "@/types/workout.types";

export interface SetInputData {
  weight_kg: number;
  reps: number;
}

export interface ExerciseInputData {
  name: string;
  sets: SetInputData[];
}

interface ExerciseInputProps {
  exercise: ExerciseInputData;
  categories: ExerciseCategory[];
  onChange: (exercise: ExerciseInputData) => void;
  onRemove: () => void;
}

export const ExerciseInput = ({
  exercise,
  categories,
  onChange,
  onRemove,
}: ExerciseInputProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const handleNameChange = (name: string) => {
    onChange({ ...exercise, name });
  };

  const addSet = () => {
    const prev = exercise.sets[exercise.sets.length - 1];
    onChange({
      ...exercise,
      sets: [
        ...exercise.sets,
        { weight_kg: prev?.weight_kg ?? 0, reps: prev?.reps ?? 1 },
      ],
    });
  };

  const removeSet = (idx: number) => {
    onChange({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== idx),
    });
  };

  const updateSet = (idx: number, field: keyof SetInputData, value: number) => {
    const newSets = [...exercise.sets];
    newSets[idx] = { ...newSets[idx], [field]: value };
    onChange({ ...exercise, sets: newSets });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      {/* 운동 이름 선택 */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            운동 이름
          </label>
          {showNewCategory ? (
            <Input
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                handleNameChange(e.target.value);
              }}
              placeholder="새 운동 이름 입력"
              required
            />
          ) : (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={exercise.name}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewCategory(true);
                  handleNameChange("");
                } else {
                  handleNameChange(e.target.value);
                }
              }}
              required
            >
              <option value="">운동을 선택하세요</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ 직접 입력</option>
            </select>
          )}
        </div>
        {showNewCategory && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowNewCategory(false);
              setNewCategoryName("");
              handleNameChange("");
            }}
          >
            목록에서 선택
          </Button>
        )}
        <div className="flex items-end">
          <Button type="button" variant="danger" size="sm" onClick={onRemove}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* 세트 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">세트 기록</span>
          <Button type="button" size="sm" onClick={addSet}>
            <Plus size={14} className="mr-1" />
            세트 추가
          </Button>
        </div>

        {exercise.sets.length === 0 && (
          <p className="text-sm text-gray-400">세트를 추가해주세요</p>
        )}

        {exercise.sets.map((set, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded p-2">
            <span className="text-sm text-gray-500 w-12">
              {idx + 1}세트
            </span>
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={set.weight_kg || ""}
                onChange={(e) =>
                  updateSet(idx, "weight_kg", parseFloat(e.target.value) || 0)
                }
                placeholder="kg"
                required
              />
            </div>
            <span className="text-sm text-gray-400">×</span>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                value={set.reps || ""}
                onChange={(e) =>
                  updateSet(idx, "reps", parseInt(e.target.value) || 1)
                }
                placeholder="회"
                required
              />
            </div>
            {exercise.sets.length > 1 && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeSet(idx)}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
