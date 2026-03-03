from pydantic import BaseModel, Field, validator
from datetime import date, time
from typing import List, Optional


class ExerciseMetricsRequest(BaseModel):
    """운동 측정값 요청"""
    weight_kg: Optional[float] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, ge=1)
    
    @validator('duration_minutes')
    def validate_metrics(cls, v, values):
        weight = values.get('weight_kg')
        if weight is None and v is None:
            raise ValueError('무게 또는 시간 중 하나는 반드시 입력해야 합니다')
        if weight is not None and v is not None:
            raise ValueError('무게와 시간은 동시에 입력할 수 없습니다')
        return v


class ExerciseRequest(BaseModel):
    """운동 항목 요청"""
    name: str = Field(..., min_length=1, max_length=100)
    sets: int = Field(..., ge=1, le=100)
    metrics: ExerciseMetricsRequest


class ExerciseResponse(BaseModel):
    """운동 항목 응답"""
    id: int
    name: str
    sets: int
    weight_kg: Optional[float]
    duration_minutes: Optional[int]


class WorkoutSessionCreateRequest(BaseModel):
    """운동 세션 생성 요청"""
    workout_date: date
    start_time: time
    end_time: time
    exercises: List[ExerciseRequest] = Field(..., min_items=1)


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