from dataclasses import dataclass
from typing import Optional


@dataclass
class ExerciseMetrics:
    """운동 측정값 (무게 또는 시간)"""
    weight_kg: Optional[float] = None
    duration_minutes: Optional[int] = None
    
    def __post_init__(self):
        if self.weight_kg is None and self.duration_minutes is None:
            raise ValueError("무게 또는 시간 중 하나는 반드시 입력해야 합니다")
        if self.weight_kg is not None and self.duration_minutes is not None:
            raise ValueError("무게와 시간은 동시에 입력할 수 없습니다")
    
    def __str__(self):
        if self.weight_kg is not None:
            return f"{self.weight_kg}kg"
        return f"{self.duration_minutes}분"