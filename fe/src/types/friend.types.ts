export interface FriendInfo {
  id: number;
  friendship_id: number;
  username: string;
  display_name: string;
  sharing_enabled: boolean;
}

export interface PendingRequest {
  friendship_id: number;
  requester_id: number;
  requester_username: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  display_name: string;
  friendship_status: "none" | "pending_sent" | "pending_received" | "accepted";
}

export interface UserSuggestion {
  id: number;
  username: string;
  display_name: string;
}
