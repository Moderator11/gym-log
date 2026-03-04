import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendApi } from "@/api/friend.api";
import { RankingPeriod, RankingType } from "@/types/friend.types";
import { useCallback } from "react";

export const useFriends = () => {
  const queryClient = useQueryClient();

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: friendApi.getFriends,
  });

  const pendingQuery = useQuery({
    queryKey: ["friends", "pending"],
    queryFn: friendApi.getPendingRequests,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (username: string) => friendApi.sendRequest(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "accept" | "decline" }) =>
      friendApi.respondToRequest(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "pending"] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendshipId: number) => friendApi.removeFriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const suggestionsQuery = useQuery({
    queryKey: ["friends", "suggestions"],
    queryFn: friendApi.getSuggestions,
  });

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) return [];
      return friendApi.search(query);
    },
    []
  );

  return {
    friends: friendsQuery.data ?? [],
    pendingRequests: pendingQuery.data ?? [],
    suggestions: suggestionsQuery.data ?? [],
    isLoading: friendsQuery.isLoading,
    sendRequest: sendRequestMutation.mutateAsync,
    respondToRequest: respondMutation.mutateAsync,
    removeFriend: removeFriendMutation.mutateAsync,
    isSending: sendRequestMutation.isPending,
    searchUsers,
  };
};

export const useRankings = (period: RankingPeriod, type: RankingType) => {
  return useQuery({
    queryKey: ["friend-rankings", period, type],
    queryFn: () => friendApi.getRankings(period, type),
  });
};

export const useFriendWorkouts = (friendId: number | null) => {
  return useQuery({
    queryKey: ["friend-workouts", friendId],
    queryFn: () => friendApi.getFriendWorkouts(friendId!),
    enabled: !!friendId,
  });
};
