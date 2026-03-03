import apiClient from "./client";
import { DailyStats, CalendarDayInfo, StatsComparisonResponse, FriendStatsComparison } from "@/types/stats.types";

export const statsApi = {
  getComparison: async (): Promise<StatsComparisonResponse> => {
    const response = await apiClient.get<StatsComparisonResponse>("/stats/comparison");
    return response.data;
  },

  getCalendar: async (year: number, month: number): Promise<CalendarDayInfo[]> => {
    const response = await apiClient.get<CalendarDayInfo[]>("/stats/calendar", { params: { year, month } });
    return response.data;
  },

  getPeriodStats: async (period: "daily" | "weekly" | "monthly"): Promise<DailyStats[]> => {
    const response = await apiClient.get<DailyStats[]>("/stats/period", { params: { period } });
    return response.data;
  },

  getFriendComparison: async (friendId: number): Promise<FriendStatsComparison> => {
    const response = await apiClient.get<FriendStatsComparison>(`/stats/friends/${friendId}`);
    return response.data;
  },
};
