import { useState } from "react";
import { useHealthMetrics, useHealthRecords } from "@/hooks/useHealth";
import { HealthRecord, HealthMetric, HealthRecordEntryPayload } from "@/types/health.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Plus, Trash2, Pencil, Share2, EyeOff, Activity } from "lucide-react";

// ── 지표 관리 탭 ──────────────────────────────────────────────────────────

const MetricsTab = () => {
  const { metrics, isLoading, createMetric, deleteMetric, isCreating } = useHealthMetrics();
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUnit.trim()) return;
    setError("");
    try {
      await createMetric({ name: newName.trim(), unit: newUnit.trim() });
      setNewName("");
      setNewUnit("");
    } catch {
      setError("이미 존재하는 지표 이름입니다");
    }
  };

  if (isLoading) return <div className="text-center py-8 text-gray-400">불러오는 중…</div>;

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">새 지표 추가</h3>
        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="지표 이름 (e.g. 체중)"
            className="flex-1 min-w-28"
          />
          <Input
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="단위 (e.g. kg)"
            className="w-28"
          />
          <Button type="submit" isLoading={isCreating}>
            <Plus size={16} className="mr-1" />
            추가
          </Button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">내 지표 목록</h3>
        {metrics.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">등록된 지표가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{m.name}</span>
                  <span className="ml-2 text-sm text-gray-500 bg-gray-200 rounded px-1.5 py-0.5">{m.unit}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => deleteMetric(m.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ── 기록 폼 ───────────────────────────────────────────────────────────────

interface RecordFormProps {
  metrics: HealthMetric[];
  initial?: HealthRecord;
  onSubmit: (payload: {
    record_date: string;
    is_shared: boolean;
    entries: HealthRecordEntryPayload[];
  }) => Promise<void>;
  onCancel: () => void;
}

const RecordForm = ({ metrics, initial, onSubmit, onCancel }: RecordFormProps) => {
  const [date, setDate] = useState(initial?.record_date ?? new Date().toISOString().slice(0, 10));
  const [isShared, setIsShared] = useState(initial?.is_shared ?? false);
  const [values, setValues] = useState<Record<number, string>>(() => {
    if (!initial) return {};
    return Object.fromEntries(
      initial.entries.map((e) => [e.metric_id, e.value == null ? "" : String(e.value)])
    );
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const entries: HealthRecordEntryPayload[] = metrics.map((m) => ({
      metric_id: m.id,
      value: values[m.id] !== "" && values[m.id] != null ? parseFloat(values[m.id]) : null,
    }));
    await onSubmit({ record_date: date, is_shared: isShared, entries });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="날짜"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {metrics.length === 0 ? (
        <p className="text-sm text-gray-400">지표 관리 탭에서 먼저 지표를 추가해주세요</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">지표 값 (선택 입력)</p>
          {metrics.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <label className="w-28 text-sm text-gray-600 shrink-0">
                {m.name}
                <span className="ml-1 text-xs text-gray-400">({m.unit})</span>
              </label>
              <Input
                type="number"
                step="any"
                value={values[m.id] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [m.id]: e.target.value }))}
                placeholder="미입력 가능"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isShared}
          onChange={(e) => setIsShared(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600"
        />
        <span className="text-sm text-gray-700">친구에게 이 기록 공유</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="submit" isLoading={loading} className="flex-1">저장</Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
      </div>
    </form>
  );
};

// ── 기록 탭 ───────────────────────────────────────────────────────────────

const RecordsTab = () => {
  const { metrics } = useHealthMetrics();
  const { records, isLoading, createRecord, updateRecord, deleteRecord } = useHealthRecords();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HealthRecord | null>(null);

  const handleCreate = async (payload: any) => {
    await createRecord(payload);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (payload: any) => {
    if (!editTarget) return;
    await updateRecord({ id: editTarget.id, payload });
    setEditTarget(null);
  };

  if (isLoading) return <div className="text-center py-8 text-gray-400">불러오는 중…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} className="mr-1" />
          기록 추가
        </Button>
      </div>

      {records.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">아직 건강 기록이 없습니다</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <Card key={rec.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{rec.record_date}</span>
                  {rec.is_shared ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <Share2 size={11} /> 공유 중
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      <EyeOff size={11} /> 비공개
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setEditTarget(rec)}>
                    <Pencil size={13} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => deleteRecord(rec.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              {rec.entries.length === 0 ? (
                <p className="text-sm text-gray-400">기록된 지표 없음</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rec.entries.map((e) => (
                    <div key={e.id} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500">{e.metric_name}</p>
                      <p className="font-semibold text-gray-800">
                        {e.value == null ? (
                          <span className="text-gray-400 font-normal">-</span>
                        ) : (
                          `${e.value} ${e.metric_unit}`
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="건강 기록 추가">
        <RecordForm metrics={metrics} onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="건강 기록 수정">
        {editTarget && (
          <RecordForm
            metrics={metrics}
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
};

// ── 페이지 루트 ───────────────────────────────────────────────────────────

type Tab = "records" | "metrics";

export const HealthPage = () => {
  const [tab, setTab] = useState<Tab>("records");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Activity size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">건강 기록</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        {(["records", "metrics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "records" ? "기록" : "지표 관리"}
          </button>
        ))}
      </div>

      {tab === "records" ? <RecordsTab /> : <MetricsTab />}
    </div>
  );
};
