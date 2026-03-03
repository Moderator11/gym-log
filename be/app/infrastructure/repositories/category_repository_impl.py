from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.exercise_category import ExerciseCategory
from app.domain.repositories.category_repository import CategoryRepository
from app.infrastructure.models import ExerciseCategoryModel, CategoryTagModel


class CategoryRepositoryImpl(CategoryRepository):
    """운동 카테고리 레포지토리 구현"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, category: ExerciseCategory) -> ExerciseCategory:
        db_category = ExerciseCategoryModel(
            user_id=category.user_id,
            name=category.name,
            exercise_type=category.exercise_type,
        )
        self.db.add(db_category)
        self.db.flush()

        for tag_name in category.tags:
            self.db.add(CategoryTagModel(category_id=db_category.id, name=tag_name))

        self.db.commit()
        self.db.refresh(db_category)
        return self._to_domain(db_category)

    def find_by_user_id(self, user_id: int) -> List[ExerciseCategory]:
        db_categories = (
            self.db.query(ExerciseCategoryModel)
            .filter(ExerciseCategoryModel.user_id == user_id)
            .order_by(ExerciseCategoryModel.name)
            .all()
        )
        return [self._to_domain(c) for c in db_categories]

    def find_by_id(self, category_id: int) -> Optional[ExerciseCategory]:
        db_category = (
            self.db.query(ExerciseCategoryModel)
            .filter(ExerciseCategoryModel.id == category_id)
            .first()
        )
        if not db_category:
            return None
        return self._to_domain(db_category)

    def update(self, category: ExerciseCategory) -> ExerciseCategory:
        db_category = (
            self.db.query(ExerciseCategoryModel)
            .filter(ExerciseCategoryModel.id == category.id)
            .first()
        )
        if not db_category:
            raise ValueError(f"Category {category.id} not found")

        db_category.name = category.name
        db_category.exercise_type = category.exercise_type

        # 태그 전체 교체
        self.db.query(CategoryTagModel).filter(
            CategoryTagModel.category_id == category.id
        ).delete()
        for tag_name in category.tags:
            self.db.add(CategoryTagModel(category_id=category.id, name=tag_name))

        self.db.commit()
        self.db.refresh(db_category)
        return self._to_domain(db_category)

    def delete(self, category_id: int) -> bool:
        db_category = (
            self.db.query(ExerciseCategoryModel)
            .filter(ExerciseCategoryModel.id == category_id)
            .first()
        )
        if not db_category:
            return False
        self.db.delete(db_category)
        self.db.commit()
        return True

    def _to_domain(self, db_category: ExerciseCategoryModel) -> ExerciseCategory:
        return ExerciseCategory(
            id=db_category.id,
            user_id=db_category.user_id,
            name=db_category.name,
            tags=[t.name for t in db_category.tags],
            exercise_type=db_category.exercise_type,
        )
