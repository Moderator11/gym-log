from dataclasses import dataclass


@dataclass
class ExerciseSet:
    """운동 세트 (무게 + 반복 횟수)"""
    set_number: int
    weight_kg: float
    reps: int

    def __str__(self):
        return f"세트 {self.set_number}: {self.weight_kg}kg × {self.reps}회"
