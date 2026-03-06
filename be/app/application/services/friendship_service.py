from typing import List, Optional
from datetime import date, timedelta
import calendar as cal_module
from app.domain.entities.friendship import Friendship
from app.domain.repositories.friendship_repository import FriendshipRepository
from app.domain.repositories.user_repository import UserRepository
from app.domain.repositories.workout_repository import WorkoutRepository


class FriendshipService:
    """친구 시스템 서비스"""

    def __init__(
        self,
        friendship_repository: FriendshipRepository,
        user_repository: UserRepository,
        workout_repository: Optional[WorkoutRepository] = None,
    ):
        self.friendship_repository = friendship_repository
        self.user_repository = user_repository
        self.workout_repository = workout_repository

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
            if existing.status in ("pending", "accepted"):
                raise ValueError("이미 친구 요청이 존재합니다")
            # declined 상태면 기존 레코드를 삭제하고 새 요청 생성
            self.friendship_repository.delete(existing.id)

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
                    "health_sharing_enabled": friend.health_sharing_enabled,
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
                    "requester_display_name": requester.display_name or requester.username,
                })
        return result

    def get_sent_requests(self, user_id: int) -> list:
        """사용자가 보낸 대기 중인 친구 요청 목록"""
        sent = self.friendship_repository.find_pending_sent_by_user(user_id)
        result = []
        for f in sent:
            addressee = self.user_repository.find_by_id(f.addressee_id)
            if addressee:
                result.append({
                    "friendship_id": f.id,
                    "addressee_id": f.addressee_id,
                    "addressee_username": addressee.username,
                    "addressee_display_name": addressee.display_name or addressee.username,
                })
        return result

    def cancel_request(self, user_id: int, friendship_id: int) -> None:
        """내가 보낸 친구 요청 철회"""
        sent = self.friendship_repository.find_pending_sent_by_user(user_id)
        target = next((f for f in sent if f.id == friendship_id), None)
        if not target:
            raise ValueError("보낸 친구 요청을 찾을 수 없습니다")
        self.friendship_repository.delete(friendship_id)

    def are_friends(self, user_id: int, other_id: int) -> bool:
        """두 사용자가 친구인지 확인"""
        f = self.friendship_repository.find_by_users(user_id, other_id)
        return f is not None and f.status == "accepted"

    def remove_friend(self, user_id: int, friendship_id: int) -> None:
        """친구 관계 삭제 (요청자 또는 수신자 본인만 가능)"""
        accepted = self.friendship_repository.find_accepted_for_user(user_id)
        target = next((f for f in accepted if f.id == friendship_id), None)
        if not target:
            raise ValueError("친구 관계를 찾을 수 없습니다")
        self.friendship_repository.delete(friendship_id)

    def get_rankings(self, user_id: int, period: str, exercise_type: str) -> list:
        """공유 중인 친구 + 본인의 운동 볼륨/거리 Top 10 랭킹"""
        if self.workout_repository is None:
            return []

        today = date.today()
        if period == "day":
            start_date, end_date = today, today
        elif period == "week":
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        else:  # month
            start_date = today.replace(day=1)
            _, last_day = cal_module.monthrange(today.year, today.month)
            end_date = today.replace(day=last_day)

        # 공유 활성화된 친구 목록 (본인 포함)
        accepted = self.friendship_repository.find_accepted_for_user(user_id)
        candidate_ids = [user_id]
        for f in accepted:
            fid = f.addressee_id if f.requester_id == user_id else f.requester_id
            friend = self.user_repository.find_by_id(fid)
            if friend and friend.sharing_enabled:
                candidate_ids.append(fid)

        results = []
        for uid in candidate_ids:
            sessions = self.workout_repository.find_by_user_id(uid)
            sessions = [s for s in sessions if start_date <= s.workout_date <= end_date]

            if exercise_type == "anaerobic":
                value = sum(
                    (s.weight_kg or 0) * (s.reps or 0)
                    for session in sessions
                    for ex in session.exercises
                    if ex.exercise_type == "anaerobic"
                    for s in ex.sets
                )
            else:  # aerobic
                value = sum(
                    (s.distance_km or 0)
                    for session in sessions
                    for ex in session.exercises
                    if ex.exercise_type == "aerobic"
                    for s in ex.sets
                )

            user = self.user_repository.find_by_id(uid)
            if user:
                results.append({
                    "user_id": uid,
                    "username": user.username,
                    "display_name": user.display_name or user.username,
                    "value": round(value, 2),
                    "is_me": uid == user_id,
                })

        results.sort(key=lambda x: x["value"], reverse=True)
        return [{"rank": i + 1, **r} for i, r in enumerate(results[:10])]

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
