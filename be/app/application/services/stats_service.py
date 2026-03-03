from typing import List, Optional
from datetime import date, timedelta, datetime
from app.domain.repositories.workout_repository import WorkoutRepository


class StatsService:
    """운동 통계 서비스"""

    def __init__(self, workout_repository: WorkoutRepository):
        self.workout_repository = workout_repository

    def _compute_daily(self, sessions: list, target_date: date) -> dict:
        """특정 날짜의 통계 계산"""
        day_sessions = [s for s in sessions if s.workout_date == target_date]
        total_exercises = sum(len(s.exercises) for s in day_sessions)
        total_sets = 0
        anaerobic_volume = 0.0
        aerobic_distance = 0.0
        aerobic_duration = 0

        for s in day_sessions:
            for ex in s.exercises:
                for st in ex.sets:
                    total_sets += 1
                    if st.weight_kg is not None and st.reps is not None:
                        anaerobic_volume += st.weight_kg * st.reps
                    if st.distance_km is not None:
                        aerobic_distance += st.distance_km
                    if st.duration_seconds is not None:
                        aerobic_duration += st.duration_seconds

        return {
            "date": str(target_date),
            "workout_count": len(day_sessions),
            "total_exercises": total_exercises,
            "total_sets": total_sets,
            "total_anaerobic_volume": round(anaerobic_volume, 2),
            "total_aerobic_distance": round(aerobic_distance, 2),
            "total_aerobic_duration": aerobic_duration,
        }

    def get_comparison(self, user_id: int) -> dict:
        """어제와 오늘의 통계 비교"""
        sessions = self.workout_repository.find_by_user_id(user_id)
        today = date.today()
        yesterday = today - timedelta(days=1)

        today_stats = self._compute_daily(sessions, today)
        yesterday_stats = self._compute_daily(sessions, yesterday)

        volume_change = today_stats["total_anaerobic_volume"] - yesterday_stats["total_anaerobic_volume"]
        if yesterday_stats["total_anaerobic_volume"] > 0:
            volume_change_pct = round((volume_change / yesterday_stats["total_anaerobic_volume"]) * 100, 1)
        else:
            volume_change_pct = None

        return {
            "today": today_stats,
            "yesterday": yesterday_stats,
            "volume_change": round(volume_change, 2),
            "volume_change_pct": volume_change_pct,
        }

    def get_calendar(self, user_id: int, year: int, month: int) -> List[dict]:
        """월별 운동 일수 조회"""
        sessions = self.workout_repository.find_by_user_id(user_id)
        from collections import Counter

        count = Counter(
            str(s.workout_date)
            for s in sessions
            if s.workout_date.year == year and s.workout_date.month == month
        )
        return [{"date": d, "workout_count": c} for d, c in sorted(count.items())]

    def get_period_stats(self, user_id: int, period: str, ref_date: Optional[date] = None) -> List[dict]:
        """기간별 통계 조회 (daily: 7일, weekly: 8주, monthly: 12개월)"""
        sessions = self.workout_repository.find_by_user_id(user_id)
        today = ref_date or date.today()

        if period == "daily":
            dates = [today - timedelta(days=i) for i in range(6, -1, -1)]
            return [self._compute_daily(sessions, d) for d in dates]

        if period == "weekly":
            result = []
            for w in range(7, -1, -1):
                week_start = today - timedelta(days=today.weekday() + w * 7)
                week_sessions = [
                    s for s in sessions
                    if week_start <= s.workout_date <= week_start + timedelta(days=6)
                ]
                anaerobic_volume = sum(
                    (st.weight_kg or 0) * (st.reps or 0)
                    for s in week_sessions for ex in s.exercises for st in ex.sets
                )
                result.append({
                    "date": str(week_start),
                    "workout_count": len(week_sessions),
                    "total_exercises": sum(len(s.exercises) for s in week_sessions),
                    "total_sets": sum(len(ex.sets) for s in week_sessions for ex in s.exercises),
                    "total_anaerobic_volume": round(anaerobic_volume, 2),
                    "total_aerobic_distance": round(sum((st.distance_km or 0) for s in week_sessions for ex in s.exercises for st in ex.sets), 2),
                    "total_aerobic_duration": sum((st.duration_seconds or 0) for s in week_sessions for ex in s.exercises for st in ex.sets),
                })
            return result

        if period == "monthly":
            result = []
            for m in range(11, -1, -1):
                month_date = (datetime(today.year, today.month, 1) - timedelta(days=m * 30)).date()
                month_sessions = [
                    s for s in sessions
                    if s.workout_date.year == month_date.year and s.workout_date.month == month_date.month
                ]
                anaerobic_volume = sum(
                    (st.weight_kg or 0) * (st.reps or 0)
                    for s in month_sessions for ex in s.exercises for st in ex.sets
                )
                result.append({
                    "date": f"{month_date.year}-{str(month_date.month).zfill(2)}",
                    "workout_count": len(month_sessions),
                    "total_exercises": sum(len(s.exercises) for s in month_sessions),
                    "total_sets": sum(len(ex.sets) for s in month_sessions for ex in s.exercises),
                    "total_anaerobic_volume": round(anaerobic_volume, 2),
                    "total_aerobic_distance": round(sum((st.distance_km or 0) for s in month_sessions for ex in s.exercises for st in ex.sets), 2),
                    "total_aerobic_duration": sum((st.duration_seconds or 0) for s in month_sessions for ex in s.exercises for st in ex.sets),
                })
            return result

        return []

    def get_friend_stats_comparison(self, user_id: int, friend_id: int, friend_sharing_enabled: bool) -> dict:
        """친구와의 통계 비교"""
        if not friend_sharing_enabled:
            raise ValueError("친구가 운동 공유를 비활성화했습니다")

        sessions_me = self.workout_repository.find_by_user_id(user_id)
        sessions_friend = self.workout_repository.find_by_user_id(friend_id)
        today = date.today()

        def compute_7day_volume(sessions):
            total = 0.0
            for s in sessions:
                if (today - timedelta(days=6)) <= s.workout_date <= today:
                    for ex in s.exercises:
                        for st in ex.sets:
                            total += (st.weight_kg or 0) * (st.reps or 0)
            return round(total, 2)

        return {
            "my_7day_volume": compute_7day_volume(sessions_me),
            "friend_7day_volume": compute_7day_volume(sessions_friend),
            "my_workout_count": sum(1 for s in sessions_me if (today - timedelta(days=6)) <= s.workout_date <= today),
            "friend_workout_count": sum(1 for s in sessions_friend if (today - timedelta(days=6)) <= s.workout_date <= today),
        }
