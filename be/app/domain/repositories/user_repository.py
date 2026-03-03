from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.user import User


class UserRepository(ABC):
    """사용자 레포지토리 인터페이스"""
    
    @abstractmethod
    def create(self, user: User) -> User:
        """사용자 생성"""
        pass
    
    @abstractmethod
    def find_by_username(self, username: str) -> Optional[User]:
        """사용자명으로 조회"""
        pass
    
    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]:
        """ID로 조회"""
        pass

    @abstractmethod
    def update_sharing(self, user_id: int, sharing_enabled: bool) -> User:
        """사용자 공유 설정 업데이트"""
        pass

    @abstractmethod
    def find_suggestions(self, exclude_ids: List[int], limit: int = 5) -> List[User]:
        """친구 추천: 주어진 ID 목록을 제외한 랜덤 사용자 반환"""
        pass