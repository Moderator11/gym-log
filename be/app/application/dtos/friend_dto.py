from pydantic import BaseModel


class FriendRequestCreate(BaseModel):
    """친구 요청 생성"""
    addressee_username: str


class FriendRequestAction(BaseModel):
    """친구 요청 응답"""
    action: str  # "accept" | "decline"


class FriendInfo(BaseModel):
    """친구 정보"""
    id: int
    friendship_id: int
    username: str
    display_name: str
    sharing_enabled: bool
    health_sharing_enabled: bool


class PendingRequestInfo(BaseModel):
    """대기 중인 친구 요청 정보 (받은 요청)"""
    friendship_id: int
    requester_id: int
    requester_username: str
    requester_display_name: str


class SentRequestInfo(BaseModel):
    """보낸 친구 요청 정보 (수락 대기 중)"""
    friendship_id: int
    addressee_id: int
    addressee_username: str
    addressee_display_name: str


class UserSearchResult(BaseModel):
    """사용자 검색 결과"""
    id: int
    username: str
    display_name: str
    friendship_status: str  # "none" | "pending_sent" | "pending_received" | "accepted"


class UserSuggestion(BaseModel):
    """친구 추천 결과"""
    id: int
    username: str
    display_name: str


class RankingEntry(BaseModel):
    """랭킹 항목"""
    rank: int
    user_id: int
    username: str
    display_name: str
    value: float   # 무산소: kg·회(볼륨), 유산소: km(거리)
    is_me: bool
