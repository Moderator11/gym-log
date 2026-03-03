from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database import Base


class UserModel(Base):
    """사용자 테이블"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_sessions = relationship("WorkoutSessionModel", back_populates="user")
    exercise_categories = relationship("ExerciseCategoryModel", back_populates="user", cascade="all, delete-orphan")


class ExerciseCategoryModel(Base):
    """사용자 정의 운동 카테고리 테이블"""
    __tablename__ = "exercise_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_category_user_name"),
    )

    user = relationship("UserModel", back_populates="exercise_categories")


class WorkoutSessionModel(Base):
    """운동 세션 테이블"""
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserModel", back_populates="workout_sessions")
    exercises = relationship("ExerciseModel", back_populates="workout_session", cascade="all, delete-orphan")


class ExerciseModel(Base):
    """운동 항목 테이블"""
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    name = Column(String, nullable=False)

    workout_session = relationship("WorkoutSessionModel", back_populates="exercises")
    sets = relationship("ExerciseSetModel", back_populates="exercise", cascade="all, delete-orphan", order_by="ExerciseSetModel.set_number")


class ExerciseSetModel(Base):
    """운동 세트 테이블 (세트별 무게 및 반복 횟수)"""
    __tablename__ = "exercise_sets"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)

    exercise = relationship("ExerciseModel", back_populates="sets")