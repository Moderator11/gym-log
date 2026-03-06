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
    def update_health_sharing(self, user_id: int, health_sharing_enabled: bool) -> User:
        """건강 기록 공유 설정 업데이트"""
        pass

    @abstractmethod
    def find_suggestions(self, exclude_ids: List[int], limit: int = 5) -> List[User]:
        """친구 추천: 주어진 ID 목록을 제외한 랜덤 사용자 반환"""
        pass
    @abstractmethod
    def update_display_name(self, user_id: int, display_name: str) -> User:
        """표시용 이름 업데이트"""
        pass

    @abstractmethod
    def update_password(self, user_id: int, hashed_password: str) -> User:
        """비밀번호(해시) 업데이트"""
        pass

    @abstractmethod
    def delete(self, user_id: int) -> None:
        """사용자 삭제"""
        pass
