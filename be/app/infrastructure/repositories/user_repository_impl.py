import random
from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.models import UserModel


class UserRepositoryImpl(UserRepository):
    """사용자 레포지토리 구현"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user: User) -> User:
        db_user = UserModel(
            username=user.username,
            hashed_password=user.hashed_password,
            created_at=user.created_at
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled
        )
    
    def find_by_username(self, username: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled
        )
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None

        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled
        )

    def _to_user(self, db_user: UserModel) -> User:
        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled,
        )

    def find_suggestions(self, exclude_ids: List[int], limit: int = 5) -> List[User]:
        """친구 추천: 주어진 ID 목록을 제외한 랜덤 사용자 반환"""
        db_users = (
            self.db.query(UserModel)
            .filter(UserModel.id.notin_(exclude_ids))
            .all()
        )
        sample = random.sample(db_users, min(limit, len(db_users)))
        return [self._to_user(u) for u in sample]

    def update_sharing(self, user_id: int, sharing_enabled: bool) -> User:
        """사용자의 운동 공유 설정 업데이트"""
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("사용자를 찾을 수 없습니다")

        db_user.sharing_enabled = sharing_enabled
        self.db.commit()
        self.db.refresh(db_user)

        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled
        )