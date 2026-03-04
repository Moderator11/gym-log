from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.workout_service import WorkoutService
from app.application.dtos.workout_dto import (
    WorkoutSessionCreateRequest,
    WorkoutSessionUpdateRequest,
    WorkoutSessionResponse,
    ExerciseResponse,
    ExerciseSetResponse
)
from app.presentation.dependencies import get_workout_service, get_current_user_id

router = APIRouter(prefix="/workouts", tags=["운동 기록"])


@router.post("", response_model=WorkoutSessionResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    request: WorkoutSessionCreateRequest,
    user_id: int = Depends(get_current_user_id),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """운동 세션 생성"""
    try:
        session = workout_service.create_workout_session(user_id, request)
        return _to_response(session)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[WorkoutSessionResponse])
def get_workouts(
    user_id: int = Depends(get_current_user_id),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """내 운동 세션 목록 조회"""
    sessions = workout_service.get_user_workout_sessions(user_id)
    return [_to_response(session) for session in sessions]


@router.get("/{session_id}", response_model=WorkoutSessionResponse)
def get_workout(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """운동 세션 상세 조회"""
    try:
        session = workout_service.get_workout_session(session_id, user_id)
        return _to_response(session)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{session_id}", response_model=WorkoutSessionResponse)
def update_workout(
    session_id: int,
    request: WorkoutSessionUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """운동 세션 수정"""
    try:
        session = workout_service.update_workout_session(session_id, user_id, request)
        return _to_response(session)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    """운동 세션 삭제"""
    try:
        workout_service.delete_workout_session(session_id, user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


def _to_response(session) -> WorkoutSessionResponse:
    """도메인 엔티티를 응답 DTO로 변환"""
    exercises = [
        ExerciseResponse(
            id=ex.id,
            name=ex.name,
            exercise_type=ex.exercise_type,
            sets=[
                ExerciseSetResponse(
                    set_number=s.set_number,
                    weight_kg=s.weight_kg,
                    reps=s.reps,
                    distance_km=s.distance_km,
                    duration_seconds=s.duration_seconds,
                )
                for s in ex.sets
            ]
        )
        for ex in session.exercises
    ]

    return WorkoutSessionResponse(
        id=session.id,
        user_id=session.user_id,
        workout_date=session.workout_date,
        start_time=session.start_time,
        end_time=session.end_time,
        title=session.title,
        memo=session.memo,
        duration_minutes=session.get_duration_minutes(),
        exercises=exercises,
        created_at=session.created_at.isoformat()
    )
