from typing import List
from app.domain.entities.friendship import Friendship
from app.domain.repositories.friendship_repository import FriendshipRepository
from app.domain.repositories.user_repository import UserRepository


class FriendshipService:
    """친구 시스템 서비스"""

    def __init__(self, friendship_repository: FriendshipRepository, user_repository: UserRepository):
        self.friendship_repository = friendship_repository
        self.user_repository = user_repository

    def search_users(self, query: str, current_user_id: int) -> list:
        """username으로 유저 검색 (자기 자신 제외)"""
        user = self.user_repository.find_by_username(query)
        if not user or user.id == current_user_id:
            return []

        friendship = self.friendship_repository.find_by_users(current_user_id, user.id)
        status = "none"
        if friendship:
            if friendship.status == "accepted":
                status = "accepted"
            elif friendship.status == "pending":
                if friendship.requester_id == current_user_id:
                    status = "pending_sent"
                else:
                    status = "pending_received"

        return [{"id": user.id, "username": user.username, "display_name": user.display_name or user.username, "friendship_status": status}]

    def send_request(self, requester_id: int, addressee_username: str) -> Friendship:
        """친구 요청 보내기"""
        addressee = self.user_repository.find_by_username(addressee_username)
        if not addressee:
            raise ValueError("사용자를 찾을 수 없습니다")

        if addressee.id == requester_id:
            raise ValueError("자기 자신에게 친구 요청을 보낼 수 없습니다")

        existing = self.friendship_repository.find_by_users(requester_id, addressee.id)
        if existing:
            raise ValueError("이미 친구 요청이 존재합니다")

        friendship = Friendship(
            id=None,
            requester_id=requester_id,
            addressee_id=addressee.id,
            status="pending"
        )
        return self.friendship_repository.create(friendship)

    def respond_to_request(self, friendship_id: int, user_id: int, action: str) -> Friendship:
        """친구 요청에 응답"""
        pending = self.friendship_repository.find_pending_for_user(user_id)
        target = next((f for f in pending if f.id == friendship_id), None)
        if not target:
            raise ValueError("친구 요청을 찾을 수 없습니다")

        status = "accepted" if action == "accept" else "declined"
        return self.friendship_repository.update_status(friendship_id, status)

    def get_friends(self, user_id: int) -> list:
        """사용자의 친구 목록 조회"""
        accepted = self.friendship_repository.find_accepted_for_user(user_id)
        result = []
        for f in accepted:
            friend_id = f.addressee_id if f.requester_id == user_id else f.requester_id
            friend = self.user_repository.find_by_id(friend_id)
            if friend:
                result.append({
                    "id": friend.id,
                    "friendship_id": f.id,
                    "username": friend.username,
                    "display_name": friend.display_name or friend.username,
                    "sharing_enabled": friend.sharing_enabled,
                })
        return result

    def get_pending_requests(self, user_id: int) -> list:
        """사용자가 받은 대기 중인 친구 요청 목록"""
        pending = self.friendship_repository.find_pending_for_user(user_id)
        result = []
        for f in pending:
            requester = self.user_repository.find_by_id(f.requester_id)
            if requester:
                result.append({
                    "friendship_id": f.id,
                    "requester_id": f.requester_id,
                    "requester_username": requester.username,
                })
        return result

    def are_friends(self, user_id: int, other_id: int) -> bool:
        """두 사용자가 친구인지 확인"""
        f = self.friendship_repository.find_by_users(user_id, other_id)
        return f is not None and f.status == "accepted"

    def get_suggestions(self, user_id: int, limit: int = 5) -> list:
        """친구 추천: 자신, 이미 친구, 요청 중인 유저를 제외한 랜덤 사용자"""
        exclude_ids = {user_id}

        # 이미 수락된 친구
        for f in self.friendship_repository.find_accepted_for_user(user_id):
            exclude_ids.add(f.requester_id)
            exclude_ids.add(f.addressee_id)

        # 대기 중인 요청 (sent + received)
        for f in self.friendship_repository.find_pending_for_user(user_id):
            exclude_ids.add(f.requester_id)
            exclude_ids.add(f.addressee_id)

        # 내가 보낸 대기 요청도 제외
        for f in self.friendship_repository.find_pending_sent_by_user(user_id):
            exclude_ids.add(f.requester_id)
            exclude_ids.add(f.addressee_id)

        users = self.user_repository.find_suggestions(list(exclude_ids), limit)
        return [{"id": u.id, "username": u.username, "display_name": u.display_name or u.username} for u in users]
