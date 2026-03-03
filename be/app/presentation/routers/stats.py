from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.stats_service import StatsService
from app.application.services.friendship_service import FriendshipService
from app.application.dtos.stats_dto import DailyStats, CalendarDayInfo, StatsComparisonResponse, FriendStatsComparison
from app.presentation.dependencies import get_current_user_id, get_stats_service, get_friendship_service

router = APIRouter(prefix="/stats", tags=["통계"])


@router.get("/comparison", response_model=StatsComparisonResponse)
def get_comparison(
    user_id: int = Depends(get_current_user_id),
    svc: StatsService = Depends(get_stats_service)
):
    """어제와 오늘 통계 비교"""
    data = svc.get_comparison(user_id)
    return StatsComparisonResponse(
        today=DailyStats(**data["today"]),
        yesterday=DailyStats(**data["yesterday"]),
        volume_change=data["volume_change"],
        volume_change_pct=data["volume_change_pct"],
    )


@router.get("/calendar", response_model=List[CalendarDayInfo])
def get_calendar(
    year: int,
    month: int,
    user_id: int = Depends(get_current_user_id),
    svc: StatsService = Depends(get_stats_service)
):
    """월별 운동 일수 조회"""
    return [CalendarDayInfo(**d) for d in svc.get_calendar(user_id, year, month)]


@router.get("/period", response_model=List[DailyStats])
def get_period_stats(
    period: str = "daily",
    user_id: int = Depends(get_current_user_id),
    svc: StatsService = Depends(get_stats_service)
):
    """기간별 통계 조회 (daily/weekly/monthly)"""
    if period not in ("daily", "weekly", "monthly"):
        raise HTTPException(status_code=400, detail="period must be daily, weekly, or monthly")
    return [DailyStats(**d) for d in svc.get_period_stats(user_id, period)]


@router.get("/friends/{friend_id}", response_model=FriendStatsComparison)
def get_friend_comparison(
    friend_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: StatsService = Depends(get_stats_service),
    friend_svc: FriendshipService = Depends(get_friendship_service)
):
    """친구와의 통계 비교"""
    if not friend_svc.are_friends(user_id, friend_id):
        raise HTTPException(status_code=403, detail="친구가 아닙니다")

    friend = friend_svc.user_repository.find_by_id(friend_id)
    try:
        return svc.get_friend_stats_comparison(user_id, friend_id, friend.sharing_enabled)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
