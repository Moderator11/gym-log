from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.workout_session import WorkoutSession
from app.domain.entities.exercise import Exercise
from app.domain.repositories.workout_repository import WorkoutRepository
from app.domain.value_objects.exercise_set import ExerciseSet
from app.infrastructure.models import WorkoutSessionModel, ExerciseModel, ExerciseSetModel


class WorkoutRepositoryImpl(WorkoutRepository):
    """운동 세션 레포지토리 구현"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, session: WorkoutSession) -> WorkoutSession:
        db_session = WorkoutSessionModel(
            user_id=session.user_id,
            workout_date=session.workout_date,
            start_time=session.start_time,
            end_time=session.end_time,
            title=session.title,
            memo=session.memo,
            created_at=session.created_at
        )
        self.db.add(db_session)
        self.db.flush()

        for exercise in session.exercises:
            db_exercise = ExerciseModel(
                workout_session_id=db_session.id,
                name=exercise.name,
                exercise_type=exercise.exercise_type,
                sort_order=exercise.sort_order,
            )
            self.db.add(db_exercise)
            self.db.flush()

            for s in exercise.sets:
                db_set = ExerciseSetModel(
                    exercise_id=db_exercise.id,
                    set_number=s.set_number,
                    weight_kg=s.weight_kg,
                    reps=s.reps,
                    distance_km=s.distance_km,
                    duration_seconds=s.duration_seconds,
                )
                self.db.add(db_set)

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

        return [self._to_domain(s) for s in db_sessions]

    def update(self, session: WorkoutSession) -> WorkoutSession:
        db_session = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.id == session.id
        ).first()

        if not db_session:
            raise ValueError(f"Session {session.id} not found")

        db_session.workout_date = session.workout_date
        db_session.start_time = session.start_time
        db_session.end_time = session.end_time
        db_session.title = session.title
        db_session.memo = session.memo

        # 기존 운동 항목 삭제 (ORM을 통해 cascade로 세트도 함께 삭제)
        for db_ex in list(db_session.exercises):
            self.db.delete(db_ex)
        self.db.flush()

        # 새 운동 항목 추가
        for exercise in session.exercises:
            db_exercise = ExerciseModel(
                workout_session_id=db_session.id,
                name=exercise.name,
                exercise_type=exercise.exercise_type,
                sort_order=exercise.sort_order,
            )
            self.db.add(db_exercise)
            self.db.flush()

            for s in exercise.sets:
                db_set = ExerciseSetModel(
                    exercise_id=db_exercise.id,
                    set_number=s.set_number,
                    weight_kg=s.weight_kg,
                    reps=s.reps,
                    distance_km=s.distance_km,
                    duration_seconds=s.duration_seconds,
                )
                self.db.add(db_set)

        self.db.commit()
        self.db.refresh(db_session)
        return self._to_domain(db_session)

    def reorder_exercises(self, session_id: int, order_items: list) -> None:
        """운동 항목 순서 일괄 업데이트"""
        for item in order_items:
            db_ex = self.db.query(ExerciseModel).filter(
                ExerciseModel.id == item["id"],
                ExerciseModel.workout_session_id == session_id,
            ).first()
            if db_ex:
                db_ex.sort_order = item["sort_order"]
        self.db.commit()

    def delete(self, session_id: int) -> bool:
        db_session = self.db.query(WorkoutSessionModel).filter(
            WorkoutSessionModel.id == session_id
        ).first()

        if not db_session:
            return False

        self.db.delete(db_session)
        self.db.commit()
        return True


    def delete_exercises_by_name(self, user_id: int, exercise_name: str) -> int:
        """사용자의 모든 세션에서 이름이 일치하는 ExerciseModel(+하위 세트) 삭제"""
        exercises = (
            self.db.query(ExerciseModel)
            .join(WorkoutSessionModel, ExerciseModel.workout_session_id == WorkoutSessionModel.id)
            .filter(
                WorkoutSessionModel.user_id == user_id,
                ExerciseModel.name == exercise_name,
            )
            .all()
        )
        for ex in exercises:
            self.db.delete(ex)  # sets는 cascade="all, delete-orphan"으로 자동 삭제
        self.db.commit()
        return len(exercises)

    def _to_domain(self, db_session: WorkoutSessionModel) -> WorkoutSession:
        """DB 모델을 도메인 엔티티로 변환"""
        exercises = []
        for db_exercise in db_session.exercises:
            sets = [
                ExerciseSet(
                    set_number=db_set.set_number,
                    weight_kg=db_set.weight_kg,
                    reps=db_set.reps,
                    distance_km=db_set.distance_km,
                    duration_seconds=db_set.duration_seconds,
                )
                for db_set in db_exercise.sets
            ]
            exercise = Exercise(
                id=db_exercise.id,
                workout_session_id=db_exercise.workout_session_id,
                name=db_exercise.name,
                exercise_type=db_exercise.exercise_type,
                sort_order=getattr(db_exercise, 'sort_order', 0) or 0,
                sets=sets
            )
            exercises.append(exercise)

        return WorkoutSession(
            id=db_session.id,
            user_id=db_session.user_id,
            workout_date=db_session.workout_date,
            start_time=db_session.start_time,
            end_time=db_session.end_time,
            title=getattr(db_session, 'title', None),
            memo=getattr(db_session, 'memo', None),
            exercises=exercises,
            created_at=db_session.created_at
        )
