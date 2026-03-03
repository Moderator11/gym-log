from typing import Optional
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
            created_at=db_user.created_at
        )
    
    def find_by_username(self, username: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at
        )
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            username=db_user.username,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at
        )