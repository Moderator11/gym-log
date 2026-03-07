from datetime import datetime, date, time
from dataclasses import dataclass, field
from typing import Optional, List
from app.domain.entities.exercise import Exercise


@dataclass
class WorkoutSession:
    """운동 세션 엔티티"""
    id: Optional[int]
    user_id: int
    workout_date: date
    start_time: time
    end_time: time
    title: Optional[str] = None
    memo: Optional[str] = None
    exercises: List[Exercise] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)

    def add_exercise(self, exercise: Exercise):
        """운동 항목 추가"""
        self.exercises.append(exercise)

    def get_duration_minutes(self) -> int:
        """운동 시간 계산 (분). end_time < start_time이면 자정을 넘긴 것으로 간주해 하루를 더한다."""
        from datetime import timedelta
        start = datetime.combine(date.today(), self.start_time)
        end = datetime.combine(date.today(), self.end_time)
        if end < start:
            end += timedelta(days=1)
        return int((end - start).total_seconds() / 60)

    def __str__(self):
        return f"Workout on {self.workout_date} ({self.start_time} - {self.end_time})"
