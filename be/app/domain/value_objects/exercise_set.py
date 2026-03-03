from dataclasses import dataclass
from typing import Optional


@dataclass
class ExerciseSet:
    """운동 세트 (무산소: 무게+반복, 유산소: 거리+시간)"""
    set_number: int
    weight_kg: Optional[float] = None   # anaerobic
    reps: Optional[int] = None          # anaerobic
    distance_km: Optional[float] = None # aerobic
    duration_seconds: Optional[int] = None  # aerobic

    def __str__(self):
        if self.weight_kg is not None and self.reps is not None:
            return f"세트 {self.set_number}: {self.weight_kg}kg × {self.reps}회"
        elif self.distance_km is not None and self.duration_seconds is not None:
            return f"세트 {self.set_number}: {self.distance_km}km × {self.duration_seconds}초"
        return f"세트 {self.set_number}"
