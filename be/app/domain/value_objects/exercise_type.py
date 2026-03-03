from enum import Enum


class ExerciseType(str, Enum):
    """운동 유형"""
    ANAEROBIC = "anaerobic"  # 무산소: weight_kg + reps
    AEROBIC = "aerobic"      # 유산소: distance_km + duration_seconds
