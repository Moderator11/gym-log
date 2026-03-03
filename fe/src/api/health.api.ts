import apiClient from "./client";
import {
  HealthMetric,
  HealthRecord,
  HealthStatsSeries,
  HealthRecordPayload,
} from "@/types/health.types";

export const healthApi = {
  // ── 지표 ──────────────────────────────────────────────────────────────
  getMetrics: async (): Promise<HealthMetric[]> => {
    const res = await apiClient.get<HealthMetric[]>("/health/metrics");
    return res.data;
  },

  createMetric: async (name: string, unit: string): Promise<HealthMetric> => {
    const res = await apiClient.post<HealthMetric>("/health/metrics", { name, unit });
    return res.data;
  },

  deleteMetric: async (metricId: number): Promise<void> => {
    await apiClient.delete(`/health/metrics/${metricId}`);
  },

  // ── 기록 ──────────────────────────────────────────────────────────────
  getRecords: async (): Promise<HealthRecord[]> => {
    const res = await apiClient.get<HealthRecord[]>("/health/records");
    return res.data;
  },

  getRecord: async (id: number): Promise<HealthRecord> => {
    const res = await apiClient.get<HealthRecord>(`/health/records/${id}`);
    return res.data;
  },

  createRecord: async (payload: HealthRecordPayload): Promise<HealthRecord> => {
    const res = await apiClient.post<HealthRecord>("/health/records", payload);
    return res.data;
  },

  updateRecord: async (id: number, payload: HealthRecordPayload): Promise<HealthRecord> => {
    const res = await apiClient.put<HealthRecord>(`/health/records/${id}`, payload);
    return res.data;
  },

  deleteRecord: async (id: number): Promise<void> => {
    await apiClient.delete(`/health/records/${id}`);
  },

  // ── 통계 ──────────────────────────────────────────────────────────────
  getStats: async (): Promise<HealthStatsSeries[]> => {
    const res = await apiClient.get<HealthStatsSeries[]>("/health/stats");
    return res.data;
  },

  // ── 친구 ──────────────────────────────────────────────────────────────
  getFriendRecords: async (friendId: number): Promise<HealthRecord[]> => {
    const res = await apiClient.get<HealthRecord[]>(`/health/friends/${friendId}/records`);
    return res.data;
  },

  getFriendStats: async (friendId: number): Promise<HealthStatsSeries[]> => {
    const res = await apiClient.get<HealthStatsSeries[]>(`/health/friends/${friendId}/stats`);
    return res.data;
  },
};
