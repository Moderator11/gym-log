from pydantic import BaseModel, Field
from datetime import date, time
from typing import List, Optional


class ExerciseSetRequest(BaseModel):
    """운동 세트 요청 (무산소: weight_kg+reps, 유산소: distance_km+duration_seconds)"""
    weight_kg: Optional[float] = Field(default=None, ge=0)
    reps: Optional[int] = Field(default=None, ge=1)
    distance_km: Optional[float] = Field(default=None, ge=0)
    duration_seconds: Optional[int] = Field(default=None, ge=1)


class ExerciseSetResponse(BaseModel):
    """운동 세트 응답"""
    set_number: int
    weight_kg: Optional[float] = None
    reps: Optional[int] = None
    distance_km: Optional[float] = None
    duration_seconds: Optional[int] = None


class ExerciseRequest(BaseModel):
    """운동 항목 요청"""
    name: str = Field(..., min_length=1, max_length=100)
    exercise_type: str = Field(default="anaerobic")
    sets: List[ExerciseSetRequest] = Field(default_factory=list)


class ExerciseResponse(BaseModel):
    """운동 항목 응답"""
    id: int
    name: str
    exercise_type: str
    sets: List[ExerciseSetResponse]


class WorkoutSessionCreateRequest(BaseModel):
    """운동 세션 생성 요청 (exercises는 빈 배열 허용)"""
    workout_date: date
    start_time: time
    end_time: time
    title: Optional[str] = Field(default=None, max_length=100)
    memo: Optional[str] = Field(default=None, max_length=2000)
    exercises: List[ExerciseRequest] = Field(default_factory=list)


class WorkoutSessionUpdateRequest(BaseModel):
    """운동 세션 수정 요청"""
    workout_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    title: Optional[str] = Field(default=None, max_length=100)
    memo: Optional[str] = Field(default=None, max_length=2000)
    exercises: Optional[List[ExerciseRequest]] = None


class WorkoutSessionResponse(BaseModel):
    """운동 세션 응답"""
    id: int
    user_id: int
    workout_date: date
    start_time: time
    end_time: time
    title: Optional[str] = None
    memo: Optional[str] = None
    duration_minutes: int
    exercises: List[ExerciseResponse]
    created_at: str
