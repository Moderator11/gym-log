from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.workout_session import WorkoutSession


class WorkoutRepository(ABC):
    """운동 세션 레포지토리 인터페이스"""
    
    @abstractmethod
    def create(self, session: WorkoutSession) -> WorkoutSession:
        """운동 세션 생성"""
        pass
    
    @abstractmethod
    def find_by_id(self, session_id: int) -> Optional[WorkoutSession]:
        """ID로 조회"""
        pass
    
    @abstractmethod
    def find_by_user_id(self, user_id: int) -> List[WorkoutSession]:
        """사용자 ID로 모든 세션 조회"""
        pass
    
    @abstractmethod
    def update(self, session: WorkoutSession) -> WorkoutSession:
        """세션 업데이트"""
        pass
    
    @abstractmethod
    def delete(self, session_id: int) -> bool:
        """세션 삭제"""
        pass