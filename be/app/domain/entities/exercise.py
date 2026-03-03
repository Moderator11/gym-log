from dataclasses import dataclass
from typing import Optional
from app.domain.value_objects.exercise_metrics import ExerciseMetrics


@dataclass
class Exercise:
    """운동 항목 엔티티"""
    id: Optional[int]
    workout_session_id: Optional[int]
    name: str
    sets: int
    metrics: ExerciseMetrics  # 무게 또는 시간
    
    def __str__(self):
        return f"{self.name} - {self.sets}세트 ({self.metrics})"