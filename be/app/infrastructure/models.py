from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Float, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database import Base


class UserModel(Base):
    """사용자 테이블"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)  # 사용자명(표시용), NULL이면 username 사용
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    sharing_enabled = Column(Boolean, nullable=False, server_default="0")
    health_sharing_enabled = Column(Boolean, nullable=False, server_default="0")

    workout_sessions = relationship("WorkoutSessionModel", back_populates="user")
    exercise_categories = relationship("ExerciseCategoryModel", back_populates="user", cascade="all, delete-orphan")


class ExerciseCategoryModel(Base):
    """사용자 정의 운동 카테고리 테이블"""
    __tablename__ = "exercise_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    exercise_type = Column(String, nullable=False, server_default="anaerobic")

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_category_user_name"),
    )

    user = relationship("UserModel", back_populates="exercise_categories")
    tags = relationship(
        "CategoryTagModel",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="CategoryTagModel.name",
    )


class CategoryTagModel(Base):
    """카테고리 태그 테이블 (향후 공유/친구 시스템에서 공개 태그 필터링에 활용)"""
    __tablename__ = "category_tags"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("exercise_categories.id"), nullable=False)
    name = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("category_id", "name", name="uq_tag_category_name"),
    )

    category = relationship("ExerciseCategoryModel", back_populates="tags")


class WorkoutSessionModel(Base):
    """운동 세션 테이블"""
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    title = Column(String, nullable=True)   # 선택적 제목
    memo = Column(String, nullable=True)    # 선택적 메모
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserModel", back_populates="workout_sessions")
    exercises = relationship("ExerciseModel", back_populates="workout_session", cascade="all, delete-orphan", order_by="ExerciseModel.sort_order")


class ExerciseModel(Base):
    """운동 항목 테이블"""
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    name = Column(String, nullable=False)
    exercise_type = Column(String, nullable=False, server_default="anaerobic")
    sort_order = Column(Integer, nullable=True)  # 운동 항목 순서

    workout_session = relationship("WorkoutSessionModel", back_populates="exercises")
    sets = relationship("ExerciseSetModel", back_populates="exercise", cascade="all, delete-orphan", order_by="ExerciseSetModel.set_number")


class ExerciseSetModel(Base):
    """운동 세트 테이블 (세트별 무게 및 반복 횟수, 또는 거리 및 시간)"""
    __tablename__ = "exercise_sets"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=True)
    reps = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    exercise = relationship("ExerciseModel", back_populates="sets")


class FriendshipModel(Base):
    """친구 관계 테이블"""
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending/accepted/declined

    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friendship"),
    )

    requester = relationship("UserModel", foreign_keys=[requester_id])
    addressee = relationship("UserModel", foreign_keys=[addressee_id])

class HealthMetricModel(Base):
    """건강 지표 테이블 (사용자 정의, e.g. 체중/kg)"""
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    unit = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_metric_user_name"),
    )

    user = relationship("UserModel")
    entries = relationship("HealthRecordEntryModel", back_populates="metric")


class HealthRecordModel(Base):
    """건강 기록 테이블"""
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_date = Column(String, nullable=False)  # YYYY-MM-DD
    user = relationship("UserModel")
    entries = relationship(
        "HealthRecordEntryModel",
        back_populates="record",
        cascade="all, delete-orphan",
    )


class HealthRecordEntryModel(Base):
    """건강 기록 항목 테이블 (지표 하나의 값)"""
    __tablename__ = "health_record_entries"

    id = Column(Integer, primary_key=True, index=True)
    health_record_id = Column(Integer, ForeignKey("health_records.id"), nullable=False)
    metric_id = Column(Integer, ForeignKey("health_metrics.id"), nullable=False)
    value = Column(Float, nullable=True)  # 비어 있을 수 있음

    record = relationship("HealthRecordModel", back_populates="entries")
    metric = relationship("HealthMetricModel", back_populates="entries")
