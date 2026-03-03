import { useState } from "react";
import { useStatsComparison, usePeriodStats } from "@/hooks/useStats";
import { useHealthStats } from "@/hooks/useHealth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const StatsPage = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const comparisonQuery = useStatsComparison();
  const periodStatsQuery = usePeriodStats(period);
  const healthStatsQuery = useHealthStats();

  const comparison = comparisonQuery.data;
  const periodStats = periodStatsQuery.data || [];
  const healthSeries = healthStatsQuery.data || [];

  const getPeriodLabel = () => {
    if (period === "daily") return "지난 7일";
    if (period === "weekly") return "지난 8주";
    return "지난 12개월";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <p className="text-sm text-gray-500 mt-0.5">운동 기록 분석</p>
      </div>

      {/* 어제/오늘 비교 */}
      {comparison && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">어제 vs 오늘</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">오늘 무산소 볼륨</p>
              <p className="text-2xl font-bold text-blue-600">{comparison.today.total_anaerobic_volume}</p>
              <p className="text-xs text-gray-500 mt-1">{comparison.today.workout_count}개 운동</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">어제 무산소 볼륨</p>
              <p className="text-2xl font-bold text-gray-600">{comparison.yesterday.total_anaerobic_volume}</p>
              <p className="text-xs text-gray-500 mt-1">{comparison.yesterday.workout_count}개 운동</p>
            </div>

            <div className={`rounded-lg p-4 ${comparison.volume_change >= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-xs text-gray-600 font-medium mb-1">볼륨 변화</p>
              <div className="flex items-center gap-2">
                {comparison.volume_change >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
                <div>
                  <p className={`text-2xl font-bold ${comparison.volume_change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {comparison.volume_change > 0 ? "+" : ""}{comparison.volume_change}
                  </p>
                  {comparison.volume_change_pct !== null && (
                    <p className="text-xs text-gray-500">
                      {comparison.volume_change_pct > 0 ? "+" : ""}{comparison.volume_change_pct}%
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
                  <th className="text-left py-2 px-3 font-medium text-gray-600">날짜</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">운동</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">세트</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">무산소 볼륨</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">유산소 거리</th>
                </tr>
              </thead>
              <tbody>
                {periodStats.map((stat, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{stat.date}</td>
                    <td className="text-right py-2 px-3">{stat.workout_count}</td>
                    <td className="text-right py-2 px-3">{stat.total_sets}</td>
                    <td className="text-right py-2 px-3 font-medium">{stat.total_anaerobic_volume}</td>
                    <td className="text-right py-2 px-3">{stat.total_aerobic_distance.toFixed(1)}km</td>
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

      {/* 건강 지표 추이 */}
      {healthSeries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">건강 지표 추이</h2>
          {healthSeries.map((series) => (
            <Card key={series.metric_id}>
              <h3 className="font-semibold text-gray-800 mb-4">
                {series.metric_name}
                <span className="ml-2 text-sm font-normal text-gray-400">({series.metric_unit})</span>
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={series.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
