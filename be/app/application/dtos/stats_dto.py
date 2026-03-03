from pydantic import BaseModel
from typing import List, Optional


class DailyStats(BaseModel):
    """일일 통계"""
    date: str
    workout_count: int
    total_exercises: int
    total_sets: int
    total_anaerobic_volume: float
    total_aerobic_distance: float
    total_aerobic_duration: int


class CalendarDayInfo(BaseModel):
    """달력 날짜 정보"""
    date: str
    workout_count: int


class StatsComparisonResponse(BaseModel):
    """통계 비교 응답"""
    today: DailyStats
    yesterday: DailyStats
    volume_change: float
    volume_change_pct: Optional[float]


class FriendStatsComparison(BaseModel):
    """친구와의 통계 비교"""
    my_7day_volume: float
    friend_7day_volume: float
    my_workout_count: int
    friend_workout_count: int
