from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.friendship import Friendship


class FriendshipRepository(ABC):
    """친구 관계 레포지토리 인터페이스"""

    @abstractmethod
    def create(self, friendship: Friendship) -> Friendship:
        """친구 관계 생성"""
        pass

    @abstractmethod
    def find_by_users(self, user1_id: int, user2_id: int) -> Optional[Friendship]:
        """두 사용자 간의 친구 관계 조회 (순서 무관)"""
        pass

    @abstractmethod
    def find_pending_for_user(self, user_id: int) -> List[Friendship]:
        """사용자가 받은 대기 중인 친구 요청 조회"""
        pass

    @abstractmethod
    def find_accepted_for_user(self, user_id: int) -> List[Friendship]:
        """사용자의 승인된 친구 관계 조회"""
        pass

    @abstractmethod
    def find_pending_sent_by_user(self, user_id: int) -> List[Friendship]:
        """사용자가 보낸 대기 중인 친구 요청 조회"""
        pass

    @abstractmethod
    def update_status(self, friendship_id: int, status: str) -> Friendship:
        """친구 관계 상태 업데이트"""
        pass
