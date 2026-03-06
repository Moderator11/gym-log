import { useState, useMemo, type ReactNode } from "react";
import { useCategories } from "@/hooks/useCategories";
import { ExerciseCategory, ExerciseType } from "@/types/workout.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, Tag, X, Check, Zap, Wind, Hash, Timer, Download } from "lucide-react";
import { DEFAULT_EXERCISES } from "@/constants/defaultExercises";

/* ─────────────────────────── 태그 입력 서브 컴포넌트 ─────────────────────────── */
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}
const TagInput = ({ tags, onChange }: TagInputProps) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="태그 입력 후 Enter"
          className="text-sm"
        />
        <Button type="button" size="sm" onClick={addTag}>
          <Plus size={14} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="hover:text-primary-900"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── 카테고리 행 ─────────────────────────── */
interface CategoryRowProps {
  category: ExerciseCategory;
  onUpdate: (id: number, name: string, tags: string[], exerciseType: ExerciseType) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}
const CategoryRow = ({ category, onUpdate, onDelete }: CategoryRowProps) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [tags, setTags] = useState<string[]>(category.tags);
  const [exerciseType, setExerciseType] = useState<ExerciseType>(category.exercise_type);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(category.id, name.trim(), tags, exerciseType);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(category.name);
    setTags(category.tags);
    setExerciseType(category.exercise_type);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(category.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (editing) {
    return (
      <div className="p-4 border border-primary-300 rounded-xl bg-primary-50 space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="운동 이름"
          className="font-medium"
          autoFocus
        />
        <div>
          <p className="text-xs text-gray-500 mb-2">운동 타입</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "anaerobic", icon: <Zap size={14} />, label: "무산소" },
                { value: "aerobic", icon: <Wind size={14} />, label: "유산소" },
                { value: "count", icon: <Hash size={14} />, label: "갯수 카운트" },
                { value: "duration", icon: <Timer size={14} />, label: "시간 기록" },
              ] as const
            ).map(({ value, icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setExerciseType(value)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
                  exerciseType === value
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">태그</p>
          <TagInput tags={tags} onChange={setTags} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
            취소
          </Button>
          <Button type="button" size="sm" isLoading={saving} onClick={handleSave}>
            <Check size={14} className="mr-1" />
            저장
          </Button>
        </div>
      </div>
    );
  }

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
  const typeIcon = typeIconMap[category.exercise_type] ?? <Zap size={14} />;
  const typeLabel = typeLabelMap[category.exercise_type] ?? category.exercise_type;

  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{category.name}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs whitespace-nowrap">
            {typeIcon}
            {typeLabel}
          </span>
        </div>
        {category.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {category.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                <Tag size={10} />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="수정"
        >
          <Pencil size={16} />
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "삭제 중…" : "확인"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── 메인 페이지 ─────────────────────────── */
export const CategoryPage = () => {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } =
    useCategories();

  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newExerciseType, setNewExerciseType] = useState<ExerciseType>("anaerobic");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [defaultsResult, setDefaultsResult] = useState<string | null>(null);

  /* 전체 태그 목록 (중복 제거·정렬) */
  const allTags = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [categories]);

  /* 태그 필터 토글 */
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  /* 필터링된 카테고리 */
  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return categories;
    return categories.filter((c) =>
      selectedTags.every((t) => c.tags.includes(t)),
    );
  }, [categories, selectedTags]);


  const handleLoadDefaults = async () => {
    const existingNames = new Set(categories.map((c) => c.name));
    const toAdd = DEFAULT_EXERCISES.filter((e) => !existingNames.has(e.name));
    if (toAdd.length === 0) {
      setDefaultsResult("모든 기본 운동이 이미 추가되어 있습니다.");
      return;
    }
    setLoadingDefaults(true);
    setDefaultsResult(null);
    let added = 0;
    for (const ex of toAdd) {
      try {
        await createCategory({ name: ex.name, tags: [], exercise_type: ex.exercise_type });
        added++;
      } catch {
        // 중복 등 에러 무시하고 계속 진행
      }
    }
    setLoadingDefaults(false);
    setDefaultsResult(`${added}개 운동이 추가됐습니다.`);
    setTimeout(() => setDefaultsResult(null), 4000);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCategory({ name: newName.trim(), tags: newTags, exercise_type: newExerciseType });
      setNewName("");
      setNewTags([]);
      setNewExerciseType("anaerobic");
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number, name: string, tags: string[], exerciseType: ExerciseType) => {
    await updateCategory({ id, payload: { name, tags, exercise_type: exerciseType } });
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">운동 카테고리</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length}개의 카테고리
          </p>
        </div>
        <div className="flex gap-2">
          {!loadingDefaults && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadDefaults}
              disabled={loadingDefaults}
            >
              <Download size={14} className="mr-1" />
              기본 운동 불러오기
            </Button>
          )}
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus size={16} className="mr-1" />
              카테고리 추가
            </Button>
          )}
        </div>
      </div>

      {/* 기본 운동 불러오기 결과 */}
      {defaultsResult && (
        <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {defaultsResult}
        </div>
      )}

      {/* 신규 생성 폼 */}
      {showForm && (
        <Card className="space-y-4 border-primary-200 bg-primary-50">
          <h2 className="font-semibold text-gray-800">새 카테고리</h2>
          <Input
            label="운동 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="예: 벤치프레스"
            autoFocus
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">운동 타입</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "anaerobic", icon: <Zap size={14} />, label: "무산소" },
                  { value: "aerobic", icon: <Wind size={14} />, label: "유산소" },
                  { value: "count", icon: <Hash size={14} />, label: "갯수 카운트" },
                  { value: "duration", icon: <Timer size={14} />, label: "시간 기록" },
                ] as const
              ).map(({ value, icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNewExerciseType(value)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
                    newExerciseType === value
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">태그</p>
            <TagInput tags={newTags} onChange={setNewTags} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewTags([]);
                setNewExerciseType("anaerobic");
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={creating}
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              추가
            </Button>
          </div>
        </Card>
      )}

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">태그로 필터</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Tag size={12} />
                  {tag}
                  {active && <X size={12} />}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1 rounded-full text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      )}

      {/* 카테고리 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {selectedTags.length > 0
            ? "해당 태그의 카테고리가 없습니다."
            : "아직 카테고리가 없습니다. 추가해보세요!"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
