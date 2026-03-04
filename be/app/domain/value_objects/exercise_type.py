from enum import Enum


class ExerciseType(str, Enum):
    """운동 유형"""
    ANAEROBIC = "anaerobic"  # 무산소: weight_kg + reps
    AEROBIC = "aerobic"      # 유산소: distance_km + duration_seconds
    COUNT = "count"          # 단순 갯수: reps only (예: 턱걸이 개수)
    DURATION = "duration"    # 단순 시간: duration_seconds only (예: 플랭크)
