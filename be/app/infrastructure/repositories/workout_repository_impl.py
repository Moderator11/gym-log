from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.workout_session import WorkoutSession
from app.domain.entities.exercise import Exercise
from app.domain.repositories.workout_repository import WorkoutRepository
from app.domain.value_objects.exercise_metrics import ExerciseMetrics
from app.infrastructure.models import WorkoutSessionModel, ExerciseModel


class WorkoutRepositoryImpl(WorkoutRepository):
    """운동 세션 레포지토리 구현"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, session: WorkoutSession) -> WorkoutSession:
        # 세션 생성
        db_session = WorkoutSessionModel(
            user_id=session.user_id,
            workout_date=session.workout_date,
            start_time=session.start_time,
            end_time=session.end_time,
            created_at=session.created_at
        )
        self.db.add(db_session)
        self.db.flush()
        
        # 운동 항목 생성
        for exercise in session.exercises:
            db_exercise = ExerciseModel(
                workout_session_id=db_session.id,
                name=exercise.name,
                sets=exercise.sets,
                weight_kg=exercise.metrics.weight_kg,
                duration_minutes=exercise.metrics.duration_minutes
            )
            self.db.add(db_exercise)
        
        self.db.commit()
        self.db.refresh(db_session)
        
        return self._to_domain(db_session)
    
    def find_by_id(self, session_id: int) -> Optional[WorkoutSession]:
        db_session = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.id == session_id
        ).first()
        
        if not db_session:
            return None
        
        return self._to_domain(db_session)
    
    def find_by_user_id(self, user_id: int) -> List[WorkoutSession]:
        db_sessions = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.user_id == user_id
        ).order_by(WorkoutSessionModel.workout_date.desc()).all()
        
        return [self._to_domain(session) for session in db_sessions]
    
    def update(self, session: WorkoutSession) -> WorkoutSession:
        db_session = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.id == session.id
        ).first()
        
        if not db_session:
            raise ValueError(f"Session {session.id} not found")
        
        # 세션 정보 업데이트
        db_session.workout_date = session.workout_date
        db_session.start_time = session.start_time
        db_session.end_time = session.end_time
        
        # 기존 운동 항목 삭제
        self.db.query(ExerciseModel).filter(
            ExerciseModel.workout_session_id == session.id
        ).delete()
        
        # 새 운동 항목 추가
        for exercise in session.exercises:
            db_exercise = ExerciseModel(
                workout_session_id=db_session.id,
                name=exercise.name,
                sets=exercise.sets,
                weight_kg=exercise.metrics.weight_kg,
                duration_minutes=exercise.metrics.duration_minutes
            )
            self.db.add(db_exercise)
        
        self.db.commit()
        self.db.refresh(db_session)
        
        return self._to_domain(db_session)
    
    def delete(self, session_id: int) -> bool:
        db_session = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.id == session_id
        ).first()
        
        if not db_session:
            return False
        
        self.db.delete(db_session)
        self.db.commit()
        return True
    
    def _to_domain(self, db_session: WorkoutSessionModel) -> WorkoutSession:
        """DB 모델을 도메인 엔티티로 변환"""
        exercises = []
        for db_exercise in db_session.exercises:
            metrics = ExerciseMetrics(
                weight_kg=db_exercise.weight_kg,
                duration_minutes=db_exercise.duration_minutes
            )
            exercise = Exercise(
                id=db_exercise.id,
                workout_session_id=db_exercise.workout_session_id,
                name=db_exercise.name,
                sets=db_exercise.sets,
                metrics=metrics
            )
            exercises.append(exercise)
        
        return WorkoutSession(
            id=db_session.id,
            user_id=db_session.user_id,
            workout_date=db_session.workout_date,
            start_time=db_session.start_time,
            end_time=db_session.end_time,
            exercises=exercises,
            created_at=db_session.created_at
        )