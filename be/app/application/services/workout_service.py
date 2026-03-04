from typing import List
from datetime import date, time
from app.domain.entities.workout_session import WorkoutSession
from app.domain.entities.exercise import Exercise
from app.domain.repositories.workout_repository import WorkoutRepository
from app.domain.value_objects.exercise_set import ExerciseSet
from app.application.dtos.workout_dto import (
    WorkoutSessionCreateRequest,
    WorkoutSessionUpdateRequest,
    ExerciseReorderRequest,
    ExerciseRequest
)


class WorkoutService:
    """운동 세션 서비스"""

    def __init__(self, workout_repository: WorkoutRepository):
        self.workout_repository = workout_repository

    def create_workout_session(
        self,
        user_id: int,
        request: WorkoutSessionCreateRequest
    ) -> WorkoutSession:
        """운동 세션 생성"""
        exercises = [
            self._create_exercise(ex, idx)
            for idx, ex in enumerate(request.exercises)
        ]

        session = WorkoutSession(
            id=None,
            user_id=user_id,
            workout_date=request.workout_date,
            start_time=request.start_time,
            end_time=request.end_time,
            title=request.title,
            memo=request.memo,
            exercises=exercises
        )

        return self.workout_repository.create(session)

    def get_workout_session(self, session_id: int, user_id: int) -> WorkoutSession:
        """운동 세션 조회"""
        session = self.workout_repository.find_by_id(session_id)
        if not session:
            raise ValueError("세션을 찾을 수 없습니다")

        if session.user_id != user_id:
            raise ValueError("권한이 없습니다")

        return session

    def get_user_workout_sessions(self, user_id: int) -> List[WorkoutSession]:
        """사용자의 모든 운동 세션 조회"""
        return self.workout_repository.find_by_user_id(user_id)

    def update_workout_session(
        self,
        session_id: int,
        user_id: int,
        request: WorkoutSessionUpdateRequest
    ) -> WorkoutSession:
        """운동 세션 수정"""
        session = self.get_workout_session(session_id, user_id)

        if request.workout_date:
            session.workout_date = request.workout_date
        if request.start_time:
            session.start_time = request.start_time
        if request.end_time:
            session.end_time = request.end_time
        # title/memo: None이면 그대로 유지, 빈 문자열 포함 명시적으로 전달된 값은 갱신
        if request.title is not None:
            session.title = request.title if request.title.strip() else None
        if request.memo is not None:
            session.memo = request.memo if request.memo.strip() else None
        if request.exercises is not None:
            session.exercises = [
                self._create_exercise(ex, idx)
                for idx, ex in enumerate(request.exercises)
            ]

        return self.workout_repository.update(session)

    def delete_workout_session(self, session_id: int, user_id: int) -> bool:
        """운동 세션 삭제"""
        session = self.get_workout_session(session_id, user_id)
        return self.workout_repository.delete(session_id)

    def reorder_exercises(self, session_id: int, user_id: int, request: ExerciseReorderRequest) -> None:
        """운동 항목 순서 일괄 업데이트"""
        self.get_workout_session(session_id, user_id)  # 권한 검증
        items = [{'id': item.id, 'sort_order': item.sort_order} for item in request.items]
        self.workout_repository.reorder_exercises(session_id, items)

    def _create_exercise(self, request: ExerciseRequest, sort_order: int = 0) -> Exercise:
        """운동 항목 생성 헬퍼"""
        sets = [
            ExerciseSet(
                set_number=i + 1,
                weight_kg=s.weight_kg,
                reps=s.reps,
                distance_km=s.distance_km,
                duration_seconds=s.duration_seconds,
            )
            for i, s in enumerate(request.sets)
        ]

        return Exercise(
            id=None,
            workout_session_id=None,
            name=request.name,
            exercise_type=request.exercise_type,
            sort_order=sort_order,
            sets=sets
        )
