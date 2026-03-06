import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriends, useRankings } from "@/hooks/useFriends";
import { useUserSettings } from "@/hooks/useUserSettings";
import { UserSearchResult, RankingPeriod, RankingType } from "@/types/friend.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Search, UserPlus, Check, X, Share2, EyeOff, Activity, Trophy, UserMinus, Clock, XCircle } from "lucide-react";

export const FriendsPage = () => {
  const navigate = useNavigate();
  const { friends, pendingRequests, sentRequests, suggestions, sendRequest, respondToRequest, removeFriend, cancelRequest, searchUsers } = useFriends();
  const { settings, updateSharing, updateHealthSharing, isUpdating } = useUserSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);
  const [removingFriend, setRemovingFriend] = useState<number | null>(null);
  const [cancelingRequest, setCancelingRequest] = useState<number | null>(null);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("week");
  const [rankingType, setRankingType] = useState<RankingType>("anaerobic");
  const rankingsQuery = useRankings(rankingPeriod, rankingType);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: number, username: string) => {
    setSendingRequest(userId);
    try {
      await sendRequest(username);
      // Update search results
      const updated = searchResults.map((r) =>
        r.id === userId ? { ...r, friendship_status: "pending_sent" as const } : r
      );
      setSearchResults(updated);
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleRespond = async (friendshipId: number, action: "accept" | "decline") => {
    try {
      await respondToRequest({ id: friendshipId, action });
    } catch (error) {
      console.error("Failed to respond:", error);
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!window.confirm("정말 친구를 삭제하시겠습니까?")) return;
    setRemovingFriend(friendshipId);
    try {
      await removeFriend(friendshipId);
    } catch (error) {
      console.error("Failed to remove friend:", error);
    } finally {
      setRemovingFriend(null);
    }
  };

  const handleCancelRequest = async (friendshipId: number) => {
    setCancelingRequest(friendshipId);
    try {
      await cancelRequest(friendshipId);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    } finally {
      setCancelingRequest(null);
    }
  };

  const handleToggleSharing = async () => {
    if (!settings) return;
    try {
      await updateSharing(!settings.sharing_enabled);
    } catch (error) {
      console.error("Failed to update sharing:", error);
    }
  };

  const handleToggleHealthSharing = async () => {
    if (!settings) return;
    try {
      await updateHealthSharing(!settings.health_sharing_enabled);
    } catch (error) {
      console.error("Failed to update health sharing:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">친구</h1>
        <p className="text-sm text-gray-500 mt-0.5">친구 추가 및 관리</p>
      </div>

      {/* 내 운동 공유 설정 */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 p-2 rounded-lg ${
                settings?.sharing_enabled
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {settings?.sharing_enabled ? <Share2 size={18} /> : <EyeOff size={18} />}
            </div>
            <div>
              <p className="font-semibold text-gray-800">내 운동 공유</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {settings?.sharing_enabled
                  ? "친구들이 내 운동 기록을 볼 수 있습니다"
                  : "친구들에게 내 운동 기록이 숨겨져 있습니다"}
              </p>
            </div>
          </div>

          {/* 토글 스위치 */}
          <button
            type="button"
            onClick={handleToggleSharing}
            disabled={isUpdating || !settings}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              settings?.sharing_enabled ? "bg-green-500" : "bg-gray-300"
            }`}
            title={settings?.sharing_enabled ? "공유 비활성화" : "공유 활성화"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings?.sharing_enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 내 건강 기록 공유 설정 */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 p-2 rounded-lg ${
                settings?.health_sharing_enabled
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Activity size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">내 건강 기록 공유</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {settings?.health_sharing_enabled
                  ? "친구들이 내 건강 기록을 볼 수 있습니다"
                  : "친구들에게 내 건강 기록이 숨겨져 있습니다"}
              </p>
            </div>
          </div>

          {/* 토글 스위치 */}
          <button
            type="button"
            onClick={handleToggleHealthSharing}
            disabled={isUpdating || !settings}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              settings?.health_sharing_enabled ? "bg-blue-500" : "bg-gray-300"
            }`}
            title={settings?.health_sharing_enabled ? "건강 기록 공유 비활성화" : "건강 기록 공유 활성화"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings?.health_sharing_enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* 추천 친구 */}
      {suggestions.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">추천 친구</h2>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{suggestion.display_name}</p>
                  <p className="text-xs text-gray-400">@{suggestion.username}</p>
                </div>
                <Button
                  size="sm"
                  isLoading={sendingRequest === suggestion.id}
                  onClick={async () => {
                    setSendingRequest(suggestion.id);
                    try {
                      await sendRequest(suggestion.username);
                    } catch (error) {
                      console.error("Failed to send request:", error);
                    } finally {
                      setSendingRequest(null);
                    }
                  }}
                >
                  <UserPlus size={14} className="mr-1" />
                  친구 요청
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 검색 */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-3">사용자 검색</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아이디로 검색…"
            className="flex-1"
          />
          <Button type="submit" isLoading={searching}>
            <Search size={16} className="mr-1" />
            검색
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{result.display_name}<span className="text-xs text-gray-400 font-normal ml-1">({result.username})</span></p>
                  <p className="text-xs text-gray-500">
                    {result.friendship_status === "none" && "친구 아님"}
                    {result.friendship_status === "pending_sent" && "요청 대기 중"}
                    {result.friendship_status === "pending_received" && "상대의 요청"}
                    {result.friendship_status === "accepted" && "친구"}
                  </p>
                </div>
                {result.friendship_status === "none" && (
                  <Button
                    size="sm"
                    isLoading={sendingRequest === result.id}
                    onClick={() => handleSendRequest(result.id, result.username)}
                  >
                    <UserPlus size={14} className="mr-1" />
                    친구 요청
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 보낸 친구 요청 (수락 대기 중) */}
      {sentRequests.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-yellow-500" />
            보낸 친구 요청 ({sentRequests.length})
          </h2>
          <div className="space-y-2">
            {sentRequests.map((req) => (
              <div key={req.friendship_id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {req.addressee_display_name}
                    <span className="text-xs text-gray-400 font-normal ml-1">(@{req.addressee_username})</span>
                  </p>
                  <p className="text-xs text-yellow-600 mt-0.5">수락 대기 중</p>
                </div>
                <button
                  type="button"
                  title="요청 철회"
                  disabled={cancelingRequest === req.friendship_id}
                  onClick={() => handleCancelRequest(req.friendship_id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle size={13} />
                  철회
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 받은 친구 요청 */}
      {pendingRequests.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">받은 친구 요청 ({pendingRequests.length})</h2>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.friendship_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {request.requester_display_name}
                    <span className="text-xs text-gray-400 font-normal ml-1">(@{request.requester_username})</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespond(request.friendship_id, "accept")}
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRespond(request.friendship_id, "decline")}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 친구 목록 */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-3">친구 목록 ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">아직 친구가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{friend.display_name}<span className="text-xs text-gray-400 font-normal ml-1">({friend.username})</span></p>
                  {friend.sharing_enabled ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                      <Share2 size={12} />
                      운동 공유 활성화
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">운동 공유 비활성화</p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {friend.sharing_enabled && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/friends/${friend.id}/workouts`)}
                    >
                      운동 보기
                    </Button>
                  )}
                  {friend.health_sharing_enabled && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/friends/${friend.id}/health`)}
                    >
                      <Activity size={13} className="mr-1" />
                      건강 보기
                    </Button>
                  )}
                  <button
                    type="button"
                    title="친구 삭제"
                    disabled={removingFriend === friend.friendship_id}
                    onClick={() => handleRemoveFriend(friend.friendship_id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserMinus size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* 친구 랭킹 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={18} />
          <h2 className="font-semibold text-gray-800">친구 랭킹 (Top 10)</h2>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(["day", "week", "month"] as RankingPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRankingPeriod(p)}
                className={`px-3 py-1.5 transition-colors ${
                  rankingPeriod === p
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p === "day" ? "오늘" : p === "week" ? "이번 주" : "이번 달"}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(["anaerobic", "aerobic"] as RankingType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRankingType(t)}
                className={`px-3 py-1.5 transition-colors ${
                  rankingType === t
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "anaerobic" ? "무산소 볼륨" : "유산소 거리"}
              </button>
            ))}
          </div>
        </div>

        {/* 랭킹 목록 */}
        {rankingsQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : !rankingsQuery.data || rankingsQuery.data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            공유 중인 친구가 없거나 해당 기간에 운동 기록이 없습니다
          </p>
        ) : (
          <ol className="space-y-2">
            {rankingsQuery.data.map((entry) => (
              <li
                key={entry.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.is_me ? "bg-primary-50 border border-primary-100" : "bg-gray-50"
                }`}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                    entry.rank === 1
                      ? "bg-yellow-400 text-white"
                      : entry.rank === 2
                      ? "bg-gray-300 text-gray-700"
                      : entry.rank === 3
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {entry.display_name}
                    {entry.is_me && <span className="ml-1 text-xs text-primary-600 font-normal">(나)</span>}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-700 tabular-nums flex-shrink-0">
                  {rankingType === "anaerobic"
                    ? `${entry.value.toLocaleString()} kg·회`
                    : `${entry.value.toFixed(2)} km`}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
};
