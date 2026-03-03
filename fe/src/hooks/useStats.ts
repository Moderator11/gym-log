import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats.api";

export const useStatsComparison = () =>
  useQuery({
    queryKey: ["stats", "comparison"],
    queryFn: statsApi.getComparison,
  });

export const useCalendar = (year: number, month: number) =>
  useQuery({
    queryKey: ["stats", "calendar", year, month],
    queryFn: () => statsApi.getCalendar(year, month),
  });

export const usePeriodStats = (period: "daily" | "weekly" | "monthly") =>
  useQuery({
    queryKey: ["stats", "period", period],
    queryFn: () => statsApi.getPeriodStats(period),
  });

export const useFriendComparison = (friendId: number | null) =>
  useQuery({
    queryKey: ["stats", "friend", friendId],
    queryFn: () => statsApi.getFriendComparison(friendId!),
    enabled: !!friendId,
  });
