import { useState } from "react";
import {
  useStatsComparison,
  usePeriodStats,
  useCalendar,
  usePR,
} from "@/hooks/useStats";
import { useHealthStats } from "@/hooks/useHealth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExercisePR } from "@/types/stats.types";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
  Wind,
  Hash,
  Timer,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ────────────────────── 헬퍼 ────────────────────── */
const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}시간 ${String(m).padStart(2, "0")}분 ${String(s).padStart(2, "0")}초`;
  if (m > 0) return `${m}분 ${String(s).padStart(2, "0")}초`;
  return `${s}초`;
};

/* ────────────────────── PR 섹션 컴포넌트 ────────────────────── */
const PRSection = ({ prData }: { prData: ExercisePR[] }) => {
  const [anaerobicView, setAnaerobicView] = useState<"weight" | "volume">(
    "weight",
  );
  const [aerobicView, setAerobicView] = useState<"distance" | "speed">(
    "distance",
  );

  const anaerobic = prData.filter((p) => p.exercise_type === "anaerobic");
  const aerobic = prData.filter((p) => p.exercise_type === "aerobic");
  const count = prData.filter((p) => p.exercise_type === "count");
  const duration = prData.filter((p) => p.exercise_type === "duration");

  if (prData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        아직 기록된 운동이 없습니다.
      </div>
    );
  }

  const ToggleBtn = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
        active
          ? "bg-gray-700 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* 무산소 */}
      {anaerobic.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-600">무산소</h3>
            </div>
            <div className="flex gap-1">
              <ToggleBtn
                active={anaerobicView === "weight"}
                onClick={() => setAnaerobicView("weight")}
              >
                최대 중량
              </ToggleBtn>
              <ToggleBtn
                active={anaerobicView === "volume"}
                onClick={() => setAnaerobicView("volume")}
              >
                볼륨
              </ToggleBtn>
            </div>
          </div>
          <div className="space-y-2">
            {anaerobic.map((pr) => (
              <div
                key={pr.exercise_name}
                className="flex items-start justify-between bg-blue-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {pr.exercise_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pr.achieved_date}
                  </p>
                </div>
                <div className="text-right">
                  {anaerobicView === "weight" ? (
                    pr.best_weight_kg != null ? (
                      <p className="font-bold text-blue-600 text-sm">
                        {pr.best_weight_kg} kg
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">기록 없음</p>
                    )
                  ) : pr.best_volume != null ? (
                    <>
                      <p className="font-bold text-blue-600 text-sm">
                        {pr.best_volume_weight_kg}kg × {pr.best_volume_reps}회
                      </p>
                      <p className="text-xs text-gray-500">
                        볼륨 {pr.best_volume}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">기록 없음</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 유산소 */}
      {aerobic.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Wind size={14} className="text-green-500" />
              <h3 className="text-sm font-semibold text-gray-600">유산소</h3>
            </div>
            <div className="flex gap-1">
              <ToggleBtn
                active={aerobicView === "distance"}
                onClick={() => setAerobicView("distance")}
              >
                최대 거리
              </ToggleBtn>
              <ToggleBtn
                active={aerobicView === "speed"}
                onClick={() => setAerobicView("speed")}
              >
                평균 속도
              </ToggleBtn>
            </div>
          </div>
          <div className="space-y-2">
            {aerobic.map((pr) => (
              <div
                key={pr.exercise_name}
                className="flex items-start justify-between bg-green-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {pr.exercise_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pr.achieved_date}
                  </p>
                </div>
                <div className="text-right">
                  {aerobicView === "distance" ? (
                    pr.best_distance_km != null ? (
                      <>
                        <p className="font-bold text-green-600 text-sm">
                          {pr.best_distance_km} km
                        </p>
                        {pr.best_duration_seconds != null && (
                          <p className="text-xs text-gray-500">
                            {formatDuration(pr.best_duration_seconds)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">기록 없음</p>
                    )
                  ) : pr.best_avg_speed_kmh != null ? (
                    <p className="font-bold text-green-600 text-sm">
                      {pr.best_avg_speed_kmh} km/h
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      거리+시간 기록 필요
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 횟수 */}
      {count.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Hash size={14} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-600">횟수</h3>
          </div>
          <div className="space-y-2">
            {count.map((pr) => (
              <div
                key={pr.exercise_name}
                className="flex items-start justify-between bg-purple-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {pr.exercise_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pr.achieved_date}
                  </p>
                </div>
                <div className="text-right">
                  {pr.best_reps_only != null ? (
                    <p className="font-bold text-purple-600 text-sm">
                      최대 {pr.best_reps_only}회
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">기록 없음</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시간 */}
      {duration.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Timer size={14} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-600">시간</h3>
          </div>
          <div className="space-y-2">
            {duration.map((pr) => (
              <div
                key={pr.exercise_name}
                className="flex items-start justify-between bg-orange-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {pr.exercise_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pr.achieved_date}
                  </p>
                </div>
                <div className="text-right">
                  {pr.best_duration_seconds != null ? (
                    <p className="font-bold text-orange-600 text-sm">
                      {formatDuration(pr.best_duration_seconds)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">기록 없음</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────── 메인 페이지 ────────────────────── */
export const StatsPage = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // 1-indexed

  const comparisonQuery = useStatsComparison();
  const periodStatsQuery = usePeriodStats(period);
  const healthStatsQuery = useHealthStats();
  const calendarQuery = useCalendar(calYear, calMonth);
  const prQuery = usePR();

  const comparison = comparisonQuery.data;
  const periodStats = periodStatsQuery.data || [];
  const healthSeries = healthStatsQuery.data || [];

  const calDaysInMonth = new Date(calYear, calMonth, 0).getDate();
  const calStartWeekday = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun
  const calWorkoutDates = new Set(
    (calendarQuery.data || [])
      .filter((d) => d.workout_count > 0)
      .map((d) => d.date),
  );

  const handleCalPrev = () => {
    if (calMonth === 1) {
      setCalYear(calYear - 1);
      setCalMonth(12);
    } else setCalMonth(calMonth - 1);
  };
  const handleCalNext = () => {
    if (calMonth === 12) {
      setCalYear(calYear + 1);
      setCalMonth(1);
    } else setCalMonth(calMonth + 1);
  };

  const getPeriodLabel = () => {
    if (period === "daily") return "지난 7일";
    if (period === "weekly") return "지난 8주";
    return "지난 12개월";
  };

  const getComparisonLabel = (daysAgo: number) => {
    if (daysAgo === 1) return "어제 vs 오늘";
    return `${daysAgo}일 전 vs 오늘`;
  };

  const getPastLabel = (daysAgo: number) => {
    if (daysAgo === 1) return "어제";
    return `${daysAgo}일 전`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <p className="text-sm text-gray-500 mt-0.5">운동 기록 분석</p>
      </div>

      {/* 마지막 운동일 vs 오늘 비교 */}
      {comparison && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">
            {getComparisonLabel(comparison.days_ago)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">
                오늘 무산소 볼륨
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {comparison.today.total_anaerobic_volume}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.today.workout_count}개 운동
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">
                {getPastLabel(comparison.days_ago)} 무산소 볼륨
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {comparison.yesterday.total_anaerobic_volume}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {comparison.yesterday.workout_count}개 운동
              </p>
            </div>

            <div
              className={`rounded-lg p-4 ${comparison.volume_change >= 0 ? "bg-green-50" : "bg-red-50"}`}
            >
              <p className="text-xs text-gray-600 font-medium mb-1">
                볼륨 변화
              </p>
              <div className="flex items-center gap-2">
                {comparison.volume_change >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
                <div>
                  <p
                    className={`text-2xl font-bold ${comparison.volume_change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {comparison.volume_change > 0 ? "+" : ""}
                    {comparison.volume_change}
                  </p>
                  {comparison.volume_change_pct !== null && (
                    <p className="text-xs text-gray-500">
                      {comparison.volume_change_pct > 0 ? "+" : ""}
                      {comparison.volume_change_pct}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 기간별 분석 */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">기간별 분석</h2>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "primary" : "secondary"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === "daily" && "일별"}
              {p === "weekly" && "주별"}
              {p === "monthly" && "월별"}
            </Button>
          ))}
        </div>

        {/* 통계 테이블 */}
        {periodStatsQuery.isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : periodStats.length > 0 ? (
          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">
                    날짜
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">
                    운동
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">
                    세트
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">
                    무산소 볼륨
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">
                    유산소 거리
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodStats.map((stat, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3">{stat.date}</td>
                    <td className="text-right py-2 px-3">
                      {stat.workout_count}
                    </td>
                    <td className="text-right py-2 px-3">{stat.total_sets}</td>
                    <td className="text-right py-2 px-3 font-medium">
                      {stat.total_anaerobic_volume}
                    </td>
                    <td className="text-right py-2 px-3">
                      {stat.total_aerobic_distance.toFixed(1)}km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {getPeriodLabel()} 동안의 운동 기록이 없습니다.
          </div>
        )}
      </Card>

      {/* 월별 캘린더 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">월별 운동 기록</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCalPrev}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="이전 달"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-700 w-20 text-center">
              {calYear}년 {calMonth}월
            </span>
            <button
              onClick={handleCalNext}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="다음 달"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div
              key={d}
              className="text-center text-xs text-gray-400 font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        {calendarQuery.isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* 첫 날 이전 빈 칸 */}
            {Array.from({ length: calStartWeekday }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {/* 날짜 셀 */}
            {Array.from({ length: calDaysInMonth }, (_, i) => i + 1).map(
              (day) => {
                const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const hasWorkout = calWorkoutDates.has(dateStr);
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-full text-sm
                    ${
                      hasWorkout
                        ? "bg-primary-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </div>
                );
              },
            )}
          </div>
        )}
      </Card>

      {/* 카테고리별 PR 기록 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-yellow-500" />
          <h2 className="font-semibold text-gray-800">
            카테고리별 개인 최고 기록 (PR)
          </h2>
        </div>
        {prQuery.isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : (
          <PRSection prData={prQuery.data ?? []} />
        )}
      </Card>

      {/* 건강 지표 추이 */}
      {healthSeries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            건강 지표 추이
          </h2>
          {healthSeries.map((series) => (
            <Card key={series.metric_id}>
              <h3 className="font-semibold text-gray-800 mb-4">
                {series.metric_name}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({series.metric_unit})
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={series.data}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: string | number | undefined) => [
                      value != null ? `${value} ${series.metric_unit}` : "-",
                      series.metric_name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
