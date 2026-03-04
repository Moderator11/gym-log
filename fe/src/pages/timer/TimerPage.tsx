import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";

/* ─── 유틸 ──────────────────────────────────────────────── */
/** ms → "MM:SS.cs" (스탑워치 표시) */
const formatStopwatch = (ms: number) => {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return {
    main: `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
    sub: String(cs).padStart(2, "0"),
  };
};

/** seconds → "MM:SS" (휴식 타이머 표시) */
const formatCountdown = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Web Audio API로 짧은 비프음 3회 재생 */
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

/* ─── 스탑워치 탭 ────────────────────────────────────────── */
const StopwatchTab = () => {
  const [elapsed, setElapsed] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const startRef = useRef<number>(0); // 시작 시점 = Date.now() - elapsed
  const rafRef = useRef<number>(0);

  const tick = () => {
    setElapsed(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleStart = () => {
    startRef.current = Date.now() - elapsed;
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
  };

  const handleStop = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  };

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(0);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const { main, sub } = formatStopwatch(elapsed);

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* 시간 표시 */}
      <div className="flex items-end gap-1 select-none">
        <span className="text-7xl font-mono font-bold text-gray-900 tabular-nums leading-none">
          {main}
        </span>
        <span className="text-3xl font-mono font-semibold text-gray-400 tabular-nums leading-none mb-1">
          .{sub}
        </span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={running ? handleStop : handleStart}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-colors text-white ${
            running
              ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
              : "bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
          }`}
          aria-label={running ? "일시정지" : "시작"}
        >
          {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </button>
        <button
          onClick={handleReset}
          disabled={elapsed === 0 && !running}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400 disabled:opacity-40 shadow-md transition-colors"
          aria-label="초기화"
        >
          <RotateCcw size={22} className="text-gray-700" />
        </button>
      </div>

      <p className="text-xs text-gray-400">
        {running ? "측정 중…" : elapsed > 0 ? "일시정지됨" : "시작 버튼을 누르세요"}
      </p>
    </div>
  );
};

/* ─── 휴식 타이머 탭 ─────────────────────────────────────── */
const PRESETS = [
  { label: "30초", sec: 30 },
  { label: "1분", sec: 60 },
  { label: "1분 30초", sec: 90 },
  { label: "2분", sec: 120 },
  { label: "3분", sec: 180 },
];
const RING_R = 88; // SVG 원 반지름
const RING_CIRC = 2 * Math.PI * RING_R;

const RestTimerTab = () => {
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

  useEffect(() => () => clearTimer(), []);

  const progress = preset > 0 ? remaining / preset : 0; // 1 = full
  const dashOffset = RING_CIRC * (1 - progress);

  /* 남은 시간에 따른 링 색상 */
  const ringColor =
    done || remaining === 0
      ? "#ef4444"       // 완료 - 빨강
      : progress <= 0.25
      ? "#f97316"       // 25% 이하 - 주황
      : "#6366f1";      // 그 외 - primary

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* 프리셋 버튼 */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map(({ label, sec }) => (
          <button
            key={sec}
            onClick={() => handlePreset(sec)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              preset === sec && !done
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG 원형 진행 링 + 숫자 */}
      <div className="relative" style={{ width: 210, height: 210 }}>
        <svg width="210" height="210" className="-rotate-90">
          {/* 배경 트랙 */}
          <circle
            cx="105"
            cy="105"
            r={RING_R}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* 진행 링 */}
          <circle
            cx="105"
            cy="105"
            r={RING_R}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: running ? "stroke-dashoffset 0.2s linear, stroke 0.4s" : "stroke 0.4s" }}
          />
        </svg>
        {/* 숫자 오버레이 */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center select-none ${
            done ? "animate-pulse" : ""
          }`}
        >
          <span
            className="text-5xl font-mono font-bold tabular-nums leading-none"
            style={{ color: ringColor }}
          >
            {formatCountdown(remaining)}
          </span>
          <span className="text-xs text-gray-400 mt-1.5">
            {done ? "완료!" : running ? "쉬는 중…" : ""}
          </span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={running ? handleStop : handleStart}
          disabled={done || remaining === 0}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-colors text-white disabled:opacity-40 ${
            running
              ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
              : "bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
          }`}
          aria-label={running ? "일시정지" : "시작"}
        >
          {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </button>
        <button
          onClick={handleReset}
          disabled={remaining === preset && !running && !done}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400 disabled:opacity-40 shadow-md transition-colors"
          aria-label="초기화"
        >
          <RotateCcw size={22} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

/* ─── 메인 페이지 ────────────────────────────────────────── */
type Tab = "stopwatch" | "rest";

export const TimerPage = () => {
  const [tab, setTab] = useState<Tab>("rest");

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">타이머</h1>
        <p className="text-sm text-gray-500 mt-0.5">스탑워치 · 휴식 타이머</p>
      </div>

      <Card>
        {/* 탭 */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          {(
            [
              { id: "rest", label: "휴식 타이머" },
              { id: "stopwatch", label: "스탑워치" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {tab === "stopwatch" ? <StopwatchTab /> : <RestTimerTab />}
      </Card>
    </div>
  );
};
