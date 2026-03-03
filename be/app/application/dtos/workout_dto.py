from pydantic import BaseModel, Field
from datetime import date, time
from typing import List, Optional


class ExerciseSetRequest(BaseModel):
    """운동 세트 요청 (무게 + 반복 횟수)"""
    weight_kg: float = Field(..., ge=0)
    reps: int = Field(..., ge=1)


class ExerciseSetResponse(BaseModel):
    """운동 세트 응답"""
    set_number: int
    weight_kg: float
    reps: int


class ExerciseRequest(BaseModel):
    """운동 항목 요청"""
    name: str = Field(..., min_length=1, max_length=100)
    sets: List[ExerciseSetRequest] = Field(..., min_items=1)


class ExerciseResponse(BaseModel):
    """운동 항목 응답"""
    id: int
    name: str
    sets: List[ExerciseSetResponse]


class WorkoutSessionCreateRequest(BaseModel):
    """운동 세션 생성 요청 (exercises는 빈 배열 허용)"""
    workout_date: date
    start_time: time
    end_time: time
    exercises: List[ExerciseRequest] = Field(default_factory=list)


class WorkoutSessionUpdateRequest(BaseModel):
    """운동 세션 수정 요청"""
    workout_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    exercises: Optional[List[ExerciseRequest]] = None


class WorkoutSessionResponse(BaseModel):
    """운동 세션 응답"""
    id: int
    user_id: int
    workout_date: date
    start_time: time
    end_time: time
    duration_minutes: int
    exercises: List[ExerciseResponse]
    created_at: str
