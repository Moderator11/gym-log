import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  User,
  Lock,
  Trash2,
  ChevronRight,
  CheckCircle,
  XCircle,
  Users,
  Pencil,
} from "lucide-react";

/* ── 섹션 래퍼 ─────────────────────────────────────── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </Card>
);

/* ── 인라인 피드백 메시지 ───────────────────────────── */
const Feedback = ({ ok, msg }: { ok: boolean; msg: string }) => (
  <p className={`flex items-center gap-1.5 text-sm mt-2 ${ok ? "text-green-600" : "text-red-500"}`}>
    {ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
    {msg}
  </p>
);

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* 서버에서 최신 정보 조회 */
  const { data: settings } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.getMe,
  });

  /* ── display_name 수정 ─────────────────────────────── */
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [nameFeedback, setNameFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const updateNameMutation = useMutation({
    mutationFn: (display_name: string) => authApi.updateDisplayName(display_name),
    onSuccess: (data) => {
      updateUser({ display_name: data.display_name });
      queryClient.setQueryData(["me"], data);
      setNameFeedback({ ok: true, msg: "사용자명이 변경되었습니다." });
      setEditingName(false);
    },
    onError: (e: Error) => {
      setNameFeedback({ ok: false, msg: e.message || "변경에 실패했습니다." });
    },
  });

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDisplayName.trim();
    if (!trimmed) return;
    setNameFeedback(null);
    updateNameMutation.mutate(trimmed);
  };

  /* ── 비밀번호 변경 ─────────────────────────────────── */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwFeedback, setPwFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const changePwMutation = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      authApi.changePassword(current, next),
    onSuccess: () => {
      setPwFeedback({ ok: true, msg: "비밀번호가 변경되었습니다." });
      setPwForm({ current: "", next: "", confirm: "" });
    },
    onError: (e: Error) => {
      setPwFeedback({ ok: false, msg: e.message || "변경에 실패했습니다." });
    },
  });

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwFeedback(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwFeedback({ ok: false, msg: "새 비밀번호가 일치하지 않습니다." });
      return;
    }
    if (pwForm.current === pwForm.next) {
      setPwFeedback({ ok: false, msg: "새 비밀번호는 현재 비밀번호와 달라야 합니다." });
      return;
    }
    changePwMutation.mutate({ current: pwForm.current, next: pwForm.next });
  };

  /* ── 회원 탈퇴 ─────────────────────────────────────── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteFeedback, setDeleteFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => authApi.deleteAccount(password),
    onSuccess: () => {
      logout();
      navigate("/login", { replace: true });
    },
    onError: (e: Error) => {
      setDeleteFeedback({ ok: false, msg: e.message || "탈퇴에 실패했습니다." });
    },
  });

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteFeedback(null);
    deleteAccountMutation.mutate(deletePassword);
  };

  const displayName = settings?.display_name ?? user?.display_name ?? "-";
  const username = settings?.username ?? user?.username ?? "-";
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="max-w-xl mx-auto space-y-5 py-2">
      <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>

      {/* ── 기본 정보 ─────────────────────────────────── */}
      <Section title="기본 정보">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">사용자명 (표시용)</p>
              {editingName ? (
                <form onSubmit={handleNameSubmit} className="flex gap-2 mt-1">
                  <Input
                    autoFocus
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder={displayName}
                    className="h-8 text-sm"
                  />
                  <Button type="submit" size="sm" isLoading={updateNameMutation.isPending}>
                    저장
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => { setEditingName(false); setNameFeedback(null); }}
                  >
                    취소
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <button
                    type="button"
                    onClick={() => { setNewDisplayName(displayName); setEditingName(true); setNameFeedback(null); }}
                    className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors flex-shrink-0"
                    title="수정"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )}
              {nameFeedback && <Feedback {...nameFeedback} />}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">아이디</p>
              <p className="text-sm text-gray-700">{username}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">가입일</p>
              <p className="text-sm text-gray-700">{createdAt}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 공유 설정 ─────────────────────────────────── */}
      <Section title="공유 설정">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">운동 기록 공유</p>
              <p className="text-xs text-gray-400 mt-0.5">친구에게 내 운동 기록 공개</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                settings?.sharing_enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {settings?.sharing_enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {settings?.sharing_enabled ? "공개" : "비공개"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">건강 기록 공유</p>
              <p className="text-xs text-gray-400 mt-0.5">친구에게 내 건강 기록 공개</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                settings?.health_sharing_enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {settings?.health_sharing_enabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {settings?.health_sharing_enabled ? "공개" : "비공개"}
            </span>
          </div>

          <Link
            to="/friends"
            className="flex items-center justify-between mt-1 px-3 py-2 rounded-lg bg-gray-50 hover:bg-primary-50 text-sm text-primary-600 font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users size={15} />
              친구 탭에서 공유 설정 변경하기
            </span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </Section>

      {/* ── 비밀번호 변경 ──────────────────────────────── */}
      <Section title="비밀번호 변경">
        <form onSubmit={handlePwSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">현재 비밀번호</label>
            <Input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="현재 비밀번호 입력"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">새 비밀번호</label>
            <Input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
              placeholder="새 비밀번호 입력"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">새 비밀번호 확인</label>
            <Input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="새 비밀번호 재입력"
              autoComplete="new-password"
            />
          </div>
          {pwFeedback && <Feedback {...pwFeedback} />}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={changePwMutation.isPending}
              disabled={!pwForm.current || !pwForm.next || !pwForm.confirm}
            >
              <Lock size={13} className="mr-1" />
              비밀번호 변경
            </Button>
          </div>
        </form>
      </Section>

      {/* ── 회원 탈퇴 ─────────────────────────────────── */}
      <Section title="회원 탈퇴">
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">탈퇴 시 모든 기록이 영구적으로 삭제됩니다.</p>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={13} className="mr-1" />
              탈퇴
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDeleteSubmit} className="space-y-3">
            <p className="text-sm text-red-600 font-medium">
              정말로 탈퇴하시겠습니까? 모든 운동·건강 기록이 삭제되며 복구할 수 없습니다.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                비밀번호를 입력하여 확인
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호 입력"
                autoFocus
              />
            </div>
            {deleteFeedback && <Feedback {...deleteFeedback} />}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteFeedback(null); }}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={deleteAccountMutation.isPending}
                disabled={!deletePassword}
              >
                탈퇴 확인
              </Button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
};
