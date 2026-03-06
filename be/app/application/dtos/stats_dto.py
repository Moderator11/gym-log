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


class ExercisePR(BaseModel):
    """카테고리별 개인 최고 기록
    - anaerobic: best_weight_kg(최대 중량 뷰) / best_volume+best_volume_weight_kg+best_volume_reps(볼륨 뷰)
    - aerobic:   best_distance_km(거리 뷰) / best_avg_speed_kmh(평균 속도 뷰)
    - count:     best_reps_only(최대 횟수)
    - duration:  best_duration_seconds(최장 시간)
    """
    exercise_name: str
    exercise_type: str  # "anaerobic" | "aerobic" | "count" | "duration"
    # 무산소 - 중량 뷰 (최대 무게, 세트 무관)
    best_weight_kg: Optional[float] = None
    # 무산소 - 볼륨 뷰 (최대 weight × reps 세트)
    best_volume: Optional[float] = None
    best_volume_weight_kg: Optional[float] = None
    best_volume_reps: Optional[int] = None
    # 유산소 - 거리 뷰
    best_distance_km: Optional[float] = None
    # 유산소 - 평균 속도 뷰 (km/h)
    best_avg_speed_kmh: Optional[float] = None
    # 횟수 운동 (count)
    best_reps_only: Optional[int] = None
    # 시간 운동 (duration) + 유산소 보조 시간
    best_duration_seconds: Optional[int] = None
    achieved_date: str
