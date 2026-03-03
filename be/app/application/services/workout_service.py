from typing import List
from datetime import date, time
from app.domain.entities.workout_session import WorkoutSession
from app.domain.entities.exercise import Exercise
from app.domain.repositories.workout_repository import WorkoutRepository
from app.domain.value_objects.exercise_metrics import ExerciseMetrics
from app.application.dtos.workout_dto import (
    WorkoutSessionCreateRequest,
    WorkoutSessionUpdateRequest,
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
        # 운동 항목 생성
        exercises = [
            self._create_exercise(ex) 
            for ex in request.exercises
        ]
        
        # 세션 생성
        session = WorkoutSession(
            id=None,
            user_id=user_id,
            workout_date=request.workout_date,
            start_time=request.start_time,
            end_time=request.end_time,
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
        
        # 업데이트할 필드 적용
        if request.workout_date:
            session.workout_date = request.workout_date
        if request.start_time:
            session.start_time = request.start_time
        if request.end_time:
            session.end_time = request.end_time
        if request.exercises:
            session.exercises = [
                self._create_exercise(ex)
                for ex in request.exercises
            ]
        
        return self.workout_repository.update(session)
    
    def delete_workout_session(self, session_id: int, user_id: int) -> bool:
        """운동 세션 삭제"""
        session = self.get_workout_session(session_id, user_id)
        return self.workout_repository.delete(session_id)
    
    def _create_exercise(self, request: ExerciseRequest) -> Exercise:
        """운동 항목 생성 헬퍼"""
        metrics = ExerciseMetrics(
            weight_kg=request.metrics.weight_kg,
            duration_minutes=request.metrics.duration_minutes
        )
        
        return Exercise(
            id=None,
            workout_session_id=None,
            name=request.name,
            sets=request.sets,
            metrics=metrics
        )