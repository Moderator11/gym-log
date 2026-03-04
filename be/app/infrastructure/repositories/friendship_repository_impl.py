from typing import List, Optional
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from app.domain.entities.friendship import Friendship
from app.domain.repositories.friendship_repository import FriendshipRepository
from app.infrastructure.models import FriendshipModel


class FriendshipRepositoryImpl(FriendshipRepository):
    """친구 관계 레포지토리 구현"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, friendship: Friendship) -> Friendship:
        db_f = FriendshipModel(
            requester_id=friendship.requester_id,
            addressee_id=friendship.addressee_id,
            status=friendship.status,
        )
        self.db.add(db_f)
        self.db.commit()
        self.db.refresh(db_f)
        return self._to_domain(db_f)

    def find_by_users(self, user1_id: int, user2_id: int) -> Optional[Friendship]:
        """두 사용자 간의 친구 관계 조회 (순서 무관)"""
        db_f = self.db.query(FriendshipModel).filter(
            or_(
                and_(FriendshipModel.requester_id == user1_id, FriendshipModel.addressee_id == user2_id),
                and_(FriendshipModel.requester_id == user2_id, FriendshipModel.addressee_id == user1_id),
            )
        ).first()
        return self._to_domain(db_f) if db_f else None

    def find_pending_for_user(self, user_id: int) -> List[Friendship]:
        """사용자가 받은 대기 중인 친구 요청"""
        db_list = self.db.query(FriendshipModel).filter(
            FriendshipModel.addressee_id == user_id,
            FriendshipModel.status == "pending",
        ).all()
        return [self._to_domain(f) for f in db_list]

    def find_accepted_for_user(self, user_id: int) -> List[Friendship]:
        """사용자의 승인된 친구 관계"""
        db_list = self.db.query(FriendshipModel).filter(
            or_(FriendshipModel.requester_id == user_id, FriendshipModel.addressee_id == user_id),
            FriendshipModel.status == "accepted",
        ).all()
        return [self._to_domain(f) for f in db_list]

    def find_pending_sent_by_user(self, user_id: int) -> List[Friendship]:
        """사용자가 보낸 대기 중인 친구 요청"""
        db_list = self.db.query(FriendshipModel).filter(
            FriendshipModel.requester_id == user_id,
            FriendshipModel.status == "pending",
        ).all()
        return [self._to_domain(f) for f in db_list]

    def update_status(self, friendship_id: int, status: str) -> Friendship:
        """친구 관계 상태 업데이트"""
        db_f = self.db.query(FriendshipModel).filter(FriendshipModel.id == friendship_id).first()
        if not db_f:
            raise ValueError("친구 관계를 찾을 수 없습니다")
        db_f.status = status
        self.db.commit()
        self.db.refresh(db_f)
        return self._to_domain(db_f)

    def delete(self, friendship_id: int) -> bool:
        """친구 관계 삭제"""
        db_f = self.db.query(FriendshipModel).filter(FriendshipModel.id == friendship_id).first()
        if not db_f:
            return False
        self.db.delete(db_f)
        self.db.commit()
        return True

    def _to_domain(self, db_f: FriendshipModel) -> Friendship:
        return Friendship(
            id=db_f.id,
            requester_id=db_f.requester_id,
            addressee_id=db_f.addressee_id,
            status=db_f.status
        )
