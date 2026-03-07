import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";

/* ── 유틸 ──────────────────────────────────────────────── */
const formatCountdown = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const playBeep = () => {
  try {
    const ctx = new AudioContext();
    [0, 0.28, 0.56].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.22);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.22);
    });
  } catch {
    // AudioContext 미지원 환경 무시
  }
};

const PRESETS = [
  { label: "30초", sec: 30 },
  { label: "1분", sec: 60 },
  { label: "1분 30초", sec: 90 },
  { label: "2분", sec: 120 },
  { label: "3분", sec: 180 },
];

const RING_R = 76;
const RING_CIRC = 2 * Math.PI * RING_R;

/* ── Props ─────────────────────────────────────────────── */
interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── 컴포넌트 ────────────────────────────────────────────── */
export const RestTimerModal = ({ isOpen, onClose }: RestTimerModalProps) => {
  const [preset, setPreset] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStart = () => {
    endRef.current = Date.now() + remaining * 1000;
    intervalRef.current = setInterval(() => {
      const rem = Math.ceil((endRef.current - Date.now()) / 1000);
      if (rem <= 0) {
        clearTimer();
        setRemaining(0);
        setRunning(false);
        setDone(true);
        playBeep();
      } else {
        setRemaining(rem);
      }
    }, 200);
    setRunning(true);
    setDone(false);
  };

  const handleStop = () => {
    clearTimer();
    setRunning(false);
  };

  const handleReset = () => {
    clearTimer();
    setRunning(false);
    setDone(false);
    setRemaining(preset);
  };

  const handlePreset = (sec: number) => {
    clearTimer();
    setRunning(false);
    setDone(false);
    setPreset(sec);
    setRemaining(sec);
  };

  /* 모달 닫힐 때 타이머 정리 */
  useEffect(() => {
    if (!isOpen) clearTimer();
    return () => clearTimer();
  }, [isOpen]);

  /* body overflow 잠금 */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = preset > 0 ? remaining / preset : 0;
  const dashOffset = RING_CIRC * (1 - progress);
  const ringColor =
    done || remaining === 0 ? "#ef4444" : progress <= 0.25 ? "#f97316" : "#6366f1";

  return (
    /* z-60 으로 edit modal(z-50) 위에 표시 */
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop — 클릭해도 닫히지 않도록 (운동 중 실수 방지) */}
        <div className="fixed inset-0 bg-black bg-opacity-60" />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">휴식 타이머</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 flex flex-col items-center gap-5">
            {/* 프리셋 */}
            <div className="flex flex-wrap justify-center gap-2">
              {PRESETS.map(({ label, sec }) => (
                <button
                  key={sec}
                  onClick={() => handlePreset(sec)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    preset === sec && !done
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* SVG 링 */}
            <div className="relative" style={{ width: 180, height: 180 }}>
              <svg width="180" height="180" className="-rotate-90">
                <circle cx="90" cy="90" r={RING_R} fill="none" stroke="#e5e7eb" strokeWidth="9" />
                <circle
                  cx="90" cy="90" r={RING_R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={dashOffset}
                  style={{ transition: running ? "stroke-dashoffset 0.2s linear, stroke 0.4s" : "stroke 0.4s" }}
                />
              </svg>
              <div className={`absolute inset-0 flex flex-col items-center justify-center select-none ${done ? "animate-pulse" : ""}`}>
                <span className="text-4xl font-mono font-bold tabular-nums" style={{ color: ringColor }}>
                  {formatCountdown(remaining)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">
                  {done ? "완료! 다음 세트로 GO 💪" : running ? "쉬는 중…" : ""}
                </span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4">
              <button
                onClick={running ? handleStop : handleStart}
                disabled={done || remaining === 0}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors text-white disabled:opacity-40 ${
                  running
                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                    : "bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
                }`}
                aria-label={running ? "일시정지" : "시작"}
              >
                {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <button
                onClick={handleReset}
                disabled={remaining === preset && !running && !done}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 active:bg-gray-400 disabled:opacity-40 shadow-md transition-colors"
                aria-label="초기화"
              >
                <RotateCcw size={19} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* 완료 후 닫기 안내 */}
            {done && (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                운동 재개하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
