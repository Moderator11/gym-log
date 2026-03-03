from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.friendship_service import FriendshipService
from app.application.services.workout_service import WorkoutService
from app.application.dtos.friend_dto import (
    FriendRequestCreate,
    FriendRequestAction,
    FriendInfo,
    PendingRequestInfo,
    UserSearchResult,
    UserSuggestion,
)
from app.application.dtos.workout_dto import WorkoutSessionResponse
from app.presentation.dependencies import (
    get_current_user_id,
    get_friendship_service,
    get_workout_service
)

router = APIRouter(prefix="/friends", tags=["친구"])


@router.get("/search", response_model=List[UserSearchResult])
def search_users(
    q: str,
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """사용자 검색"""
    results = svc.search_users(q, user_id)
    return [UserSearchResult(**r) for r in results]


@router.post("/request", status_code=status.HTTP_201_CREATED)
def send_request(
    body: FriendRequestCreate,
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """친구 요청 보내기"""
    try:
        svc.send_request(user_id, body.addressee_username)
        return {"message": "친구 요청을 보냈습니다"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/requests/pending", response_model=List[PendingRequestInfo])
def get_pending_requests(
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """대기 중인 친구 요청 목록"""
    return [PendingRequestInfo(**r) for r in svc.get_pending_requests(user_id)]


@router.put("/requests/{friendship_id}", response_model=dict)
def respond_to_request(
    friendship_id: int,
    body: FriendRequestAction,
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """친구 요청에 응답"""
    try:
        svc.respond_to_request(friendship_id, user_id, body.action)
        return {"message": "처리되었습니다"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/suggestions", response_model=List[UserSuggestion])
def get_suggestions(
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """친구 추천 (최대 5명, 랜덤)"""
    return [UserSuggestion(**u) for u in svc.get_suggestions(user_id)]


@router.get("", response_model=List[FriendInfo])
def get_friends(
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service)
):
    """친구 목록"""
    return [FriendInfo(**f) for f in svc.get_friends(user_id)]


@router.get("/{friend_id}/workouts", response_model=List[WorkoutSessionResponse])
def get_friend_workouts(
    friend_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: FriendshipService = Depends(get_friendship_service),
    workout_svc: WorkoutService = Depends(get_workout_service)
):
    """친구의 운동 기록 조회"""
    if not svc.are_friends(user_id, friend_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="친구가 아닙니다")

    friend_user = svc.user_repository.find_by_id(friend_id)
    if not friend_user or not friend_user.sharing_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="운동 공유가 비활성화되어 있습니다")

    sessions = workout_svc.get_user_workout_sessions(friend_id)

    # Import here to avoid circular import
    from app.presentation.routers.workouts import _to_response
    return [_to_response(s) for s in sessions]
