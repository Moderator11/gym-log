from abc import ABC, abstractmethod
from typing import Optional
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