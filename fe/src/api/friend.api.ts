import apiClient from "./client";
import { FriendInfo, PendingRequest, SentRequest, UserSearchResult, UserSuggestion, RankingEntry, RankingPeriod, RankingType } from "@/types/friend.types";
import { WorkoutSession } from "@/types/workout.types";

export const friendApi = {
  search: async (q: string): Promise<UserSearchResult[]> => {
    const response = await apiClient.get<UserSearchResult[]>("/friends/search", { params: { q } });
    return response.data;
  },

  sendRequest: async (addressee_username: string): Promise<void> => {
    await apiClient.post("/friends/request", { addressee_username });
  },

  getPendingRequests: async (): Promise<PendingRequest[]> => {
    const response = await apiClient.get<PendingRequest[]>("/friends/requests/pending");
    return response.data;
  },

  getSentRequests: async (): Promise<SentRequest[]> => {
    const response = await apiClient.get<SentRequest[]>("/friends/requests/sent");
    return response.data;
  },

  cancelRequest: async (friendshipId: number): Promise<void> => {
    await apiClient.delete(`/friends/requests/${friendshipId}`);
  },

  respondToRequest: async (friendship_id: number, action: "accept" | "decline"): Promise<void> => {
    await apiClient.put(`/friends/requests/${friendship_id}`, { action });
  },

  getFriends: async (): Promise<FriendInfo[]> => {
    const response = await apiClient.get<FriendInfo[]>("/friends");
    return response.data;
  },

  getFriendWorkouts: async (friendId: number): Promise<WorkoutSession[]> => {
    const response = await apiClient.get<WorkoutSession[]>(`/friends/${friendId}/workouts`);
    return response.data;
  },

  getSuggestions: async (): Promise<UserSuggestion[]> => {
    const response = await apiClient.get<UserSuggestion[]>("/friends/suggestions");
    return response.data;
  },

  removeFriend: async (friendshipId: number): Promise<void> => {
    await apiClient.delete(`/friends/${friendshipId}`);
  },

  getRankings: async (period: RankingPeriod, type: RankingType): Promise<RankingEntry[]> => {
    const response = await apiClient.get<RankingEntry[]>("/friends/rankings", {
      params: { period, type },
    });
    return response.data;
  },
};
