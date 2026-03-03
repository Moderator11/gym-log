from dataclasses import dataclass, field
from typing import Optional, List
from app.domain.value_objects.exercise_set import ExerciseSet


@dataclass
class Exercise:
    """운동 항목 엔티티"""
    id: Optional[int]
    workout_session_id: Optional[int]
    name: str
    sets: List[ExerciseSet] = field(default_factory=list)

    def __str__(self):
        return f"{self.name} - {len(self.sets)}세트"