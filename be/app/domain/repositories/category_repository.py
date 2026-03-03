from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.exercise_category import ExerciseCategory


class CategoryRepository(ABC):
    """운동 카테고리 레포지토리 인터페이스"""

    @abstractmethod
    def create(self, category: ExerciseCategory) -> ExerciseCategory:
        """카테고리 생성"""
        pass

    @abstractmethod
    def find_by_user_id(self, user_id: int) -> List[ExerciseCategory]:
        """사용자의 모든 카테고리 조회"""
        pass

    @abstractmethod
    def find_by_id(self, category_id: int) -> Optional[ExerciseCategory]:
        """ID로 카테고리 조회"""
        pass

    @abstractmethod
    def update(self, category: ExerciseCategory) -> ExerciseCategory:
        """카테고리 이름·태그 수정"""
        pass

    @abstractmethod
    def delete(self, category_id: int) -> bool:
        """카테고리 삭제"""
        pass
