import random
from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.models import UserModel, FriendshipModel, HealthMetricModel, HealthRecordModel


class UserRepositoryImpl(UserRepository):
    """사용자 레포지토리 구현"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user: User) -> User:
        db_user = UserModel(
            username=user.username,
            display_name=user.display_name,
            hashed_password=user.hashed_password,
            created_at=user.created_at
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return self._to_user(db_user)
    
    def find_by_username(self, username: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.username == username).first()
        if not db_user:
            return None
        
        return self._to_user(db_user)
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None

        return self._to_user(db_user)

    def _to_user(self, db_user: UserModel) -> User:
        return User(
            id=db_user.id,
            username=db_user.username,
            display_name=db_user.display_name,
            hashed_password=db_user.hashed_password,
            created_at=db_user.created_at,
            sharing_enabled=db_user.sharing_enabled,
            health_sharing_enabled=db_user.health_sharing_enabled,
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

        return self._to_user(db_user)

    def update_health_sharing(self, user_id: int, health_sharing_enabled: bool):
        """건강 기록 공유 설정 업데이트"""
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("사용자를 찾을 수 없습니다")
        db_user.health_sharing_enabled = health_sharing_enabled
        self.db.commit()
        self.db.refresh(db_user)
        return self._to_user(db_user)

    def update_display_name(self, user_id: int, display_name: str) -> User:
        """표시용 이름 업데이트"""
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("사용자를 찾을 수 없습니다")
        db_user.display_name = display_name
        self.db.commit()
        self.db.refresh(db_user)
        return self._to_user(db_user)

    def update_password(self, user_id: int, hashed_password: str) -> User:
        """비밀번호(해시) 업데이트"""
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("사용자를 찾을 수 없습니다")
        db_user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(db_user)
        return self._to_user(db_user)

    def delete(self, user_id: int) -> None:
        """사용자 삭제 — ORM cascade 미설정 테이블을 먼저 명시적으로 제거"""
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise ValueError("사용자를 찾을 수 없습니다")

        # FriendshipModel (requester/addressee FK → users.id, cascade 없음)
        self.db.query(FriendshipModel).filter(
            (FriendshipModel.requester_id == user_id) |
            (FriendshipModel.addressee_id == user_id)
        ).delete(synchronize_session=False)

        # HealthRecordModel (cascade=all, delete-orphan 없음)
        self.db.query(HealthRecordModel).filter(
            HealthRecordModel.user_id == user_id
        ).delete(synchronize_session=False)

        # HealthMetricModel
        self.db.query(HealthMetricModel).filter(
            HealthMetricModel.user_id == user_id
        ).delete(synchronize_session=False)

        # UserModel 삭제 (workout_sessions, exercise_categories는 cascade 처리됨)
        self.db.delete(db_user)
        self.db.commit()
