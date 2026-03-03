from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Float, ForeignKey
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
    sets = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    workout_session = relationship("WorkoutSessionModel", back_populates="exercises")