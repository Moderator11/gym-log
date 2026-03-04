import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus, Minus, ChevronDown, ChevronUp, Zap, Wind, Hash, Timer } from "lucide-react";
import { ExerciseCategory, ExerciseType } from "@/types/workout.types";

export interface SetInputData {
  weight_kg?: number | null;
  reps?: number | null;
  distance_km?: number | null;
  duration_seconds?: number | null;
}

export interface ExerciseInputData {
  name: string;
  exercise_type: ExerciseType;
  sets: SetInputData[];
}

interface ExerciseInputProps {
  exercise: ExerciseInputData;
  categories: ExerciseCategory[];
  onChange: (exercise: ExerciseInputData) => void;
  onRemove: () => void;
}

/* 숫자 +/- 조절 컴포넌트 */
interface StepperProps {
  label: string;
  value: number;
  step: number;        // +/- 버튼 증감 단위
  inputStep?: number;  // input[step] 속성 (직접 입력 단위, 기본값 = step)
  min: number;
  onChange: (v: number) => void;
}
const Stepper = ({ label, value, step, inputStep, min, onChange }: StepperProps) => {
  const dec = () => onChange(Math.max(min, parseFloat((value - step).toFixed(2))));
  const inc = () => onChange(parseFloat((value + step).toFixed(2)));
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={dec}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-gray-700 font-bold transition-colors touch-manipulation"
        >
          <Minus size={13} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          step={inputStep ?? step}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-16 text-center text-sm font-medium border border-gray-300 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={inc}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-gray-700 font-bold transition-colors touch-manipulation"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};

export const ExerciseInput = ({
  exercise,
  categories,
  onChange,
  onRemove,
}: ExerciseInputProps) => {
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  const handleNameChange = (name: string) => onChange({ ...exercise, name });

  const addSet = () => {
    const prev = exercise.sets[exercise.sets.length - 1];
    if (exercise.exercise_type === "anaerobic") {
      onChange({
        ...exercise,
        sets: [
          ...exercise.sets,
          { weight_kg: prev?.weight_kg ?? 20, reps: prev?.reps ?? 10 },
        ],
      });
    } else if (exercise.exercise_type === "aerobic") {
      onChange({
        ...exercise,
        sets: [
          ...exercise.sets,
          { distance_km: prev?.distance_km ?? 1, duration_seconds: prev?.duration_seconds ?? 300 },
        ],
      });
    } else if (exercise.exercise_type === "count") {
      onChange({
        ...exercise,
        sets: [
          ...exercise.sets,
          { reps: prev?.reps ?? 10 },
        ],
      });
    } else {
      // duration
      onChange({
        ...exercise,
        sets: [
          ...exercise.sets,
          { duration_seconds: prev?.duration_seconds ?? 60 },
        ],
      });
    }
  };

  const removeSet = (idx: number) => {
    onChange({ ...exercise, sets: exercise.sets.filter((_, i) => i !== idx) });
  };

  const updateSet = (idx: number, field: keyof SetInputData, value: number | null) => {
    const next = [...exercise.sets];
    next[idx] = { ...next[idx], [field]: value };
    onChange({ ...exercise, sets: next });
  };

  /* 접힌 상태 — 컴팩트 한 줄 */
  if (collapsed) {
    const typeIconMap: Record<string, ReactNode> = {
      anaerobic: <Zap size={12} />,
      aerobic: <Wind size={12} />,
      count: <Hash size={12} />,
      duration: <Timer size={12} />,
    };
    const typeLabelMap: Record<string, string> = {
      anaerobic: "무산소",
      aerobic: "유산소",
      count: "갯수",
      duration: "시간",
    };
    const typeIcon = typeIconMap[exercise.exercise_type] ?? <Zap size={12} />;
    const typeLabel = typeLabelMap[exercise.exercise_type] ?? exercise.exercise_type;

    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
        {/* 이름 레이블 */}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex-1 text-left min-w-0"
        >
          {exercise.name ? (
            <span className="text-sm font-semibold text-indigo-800 truncate block">
              {exercise.name}
            </span>
          ) : (
            <span className="text-sm text-indigo-400">운동 선택…</span>
          )}
        </button>

        {/* 타입 배지 */}
        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
          {typeIcon}
          {typeLabel}
        </span>

        {/* 세트 배지 */}
        <span className="flex-shrink-0 text-xs text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
          {exercise.sets.length > 0 ? `${exercise.sets.length}세트` : "세트 없음"}
        </span>

        {/* 펼치기 버튼 */}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
          title="펼치기"
        >
          <ChevronDown size={15} />
        </button>

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-indigo-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="운동 삭제"
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  }

  /* 펼친 상태 — 전체 편집 UI */
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* 헤더: 운동 이름 선택 + 접기 + 삭제 */}
      <div className="flex gap-2 items-end p-3 sm:p-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            운동 이름
          </label>
          {showNewInput ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  handleNameChange(e.target.value);
                }}
                placeholder="운동 이름 직접 입력"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewInput(false);
                  setNewName("");
                  handleNameChange("");
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
              >
                목록
              </button>
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              value={exercise.name}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewInput(true);
                  onChange({ ...exercise, name: "" });
                } else {
                  const cat = categories.find((c) => c.name === e.target.value);
                  onChange({
                    ...exercise,
                    name: e.target.value,
                    exercise_type: cat?.exercise_type ?? exercise.exercise_type,
                  });
                }
              }}
            >
              <option value="">운동 선택…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ 직접 입력</option>
            </select>
          )}
        </div>

        {/* 접기 버튼 */}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="접기"
        >
          <ChevronUp size={16} />
        </button>

        {/* 삭제 버튼 */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="운동 삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* 세트 목록 */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            세트 기록{" "}
            <span className="text-gray-400 font-normal">({exercise.sets.length}세트)</span>
          </span>
          <Button type="button" size="sm" onClick={addSet}>
            <Plus size={13} className="mr-1" />
            세트 추가
          </Button>
        </div>

        {exercise.sets.length === 0 && (
          <p className="text-xs text-gray-400 py-1">
            세트 없이 저장하거나, 세트를 추가하세요.
          </p>
        )}

        {exercise.sets.map((set, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2"
          >
            <span className="text-xs text-gray-400 w-8 flex-shrink-0">
              {idx + 1}세트
            </span>
            <div className="flex items-center gap-3 flex-1 justify-center flex-wrap">
              {exercise.exercise_type === "anaerobic" ? (
                <>
                  <Stepper
                    label="kg"
                    value={set.weight_kg ?? 20}
                    step={0.5}
                    min={0}
                    onChange={(v) => updateSet(idx, "weight_kg", v)}
                  />
                  <span className="text-gray-300 text-lg self-end pb-1">×</span>
                  <Stepper
                    label="회"
                    value={set.reps ?? 10}
                    step={1}
                    min={1}
                    onChange={(v) => updateSet(idx, "reps", v)}
                  />
                </>
              ) : exercise.exercise_type === "aerobic" ? (
                <>
                  <Stepper
                    label="km"
                    value={set.distance_km ?? 1}
                    step={0.1}
                    min={0}
                    onChange={(v) => updateSet(idx, "distance_km", v)}
                  />
                  <span className="text-gray-300 text-lg self-end pb-1">·</span>
                  <Stepper
                    label="초"
                    value={set.duration_seconds ?? 300}
                    step={30}
                    inputStep={1}
                    min={1}
                    onChange={(v) => updateSet(idx, "duration_seconds", v)}
                  />
                </>
              ) : exercise.exercise_type === "count" ? (
                <Stepper
                  label="회"
                  value={set.reps ?? 10}
                  step={1}
                  min={1}
                  onChange={(v) => updateSet(idx, "reps", v)}
                />
              ) : (
                /* duration */
                <Stepper
                  label="초"
                  value={set.duration_seconds ?? 60}
                  step={30}
                  inputStep={1}
                  min={1}
                  onChange={(v) => updateSet(idx, "duration_seconds", v)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeSet(idx)}
              className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="세트 삭제"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
