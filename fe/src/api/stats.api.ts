import apiClient from "./client";
import { DailyStats, CalendarDayInfo, StatsComparisonResponse, FriendStatsComparison } from "@/types/stats.types";
import { getTodayDate } from "@/utils/time.util";

export const statsApi = {
  getComparison: async (): Promise<StatsComparisonResponse> => {
    const response = await apiClient.get<StatsComparisonResponse>("/stats/comparison", {
      params: { today: getTodayDate() },
    });
    return response.data;
  },

  getCalendar: async (year: number, month: number): Promise<CalendarDayInfo[]> => {
    const response = await apiClient.get<CalendarDayInfo[]>("/stats/calendar", { params: { year, month } });
    return response.data;
  },

  getPeriodStats: async (period: "daily" | "weekly" | "monthly"): Promise<DailyStats[]> => {
    const response = await apiClient.get<DailyStats[]>("/stats/period", {
      params: { period, today: getTodayDate() },
    });
    return response.data;
  },

  getFriendComparison: async (friendId: number): Promise<FriendStatsComparison> => {
    const response = await apiClient.get<FriendStatsComparison>(`/stats/friends/${friendId}`);
    return response.data;
  },
};
