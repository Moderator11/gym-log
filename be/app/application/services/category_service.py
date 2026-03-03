from typing import List
from app.domain.entities.exercise_category import ExerciseCategory
from app.domain.repositories.category_repository import CategoryRepository


class CategoryService:
    """운동 카테고리 서비스"""

    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    def create_category(self, user_id: int, name: str) -> ExerciseCategory:
        """카테고리 생성"""
        category = ExerciseCategory(id=None, user_id=user_id, name=name)
        try:
            return self.category_repository.create(category)
        except Exception:
            raise ValueError("이미 존재하는 카테고리 이름입니다")

    def get_user_categories(self, user_id: int) -> List[ExerciseCategory]:
        """사용자의 모든 카테고리 조회"""
        return self.category_repository.find_by_user_id(user_id)

    def delete_category(self, category_id: int, user_id: int) -> bool:
        """카테고리 삭제 (소유자만)"""
        category = self.category_repository.find_by_id(category_id)
        if not category:
            raise ValueError("카테고리를 찾을 수 없습니다")
        if category.user_id != user_id:
            raise ValueError("권한이 없습니다")
        return self.category_repository.delete(category_id)
