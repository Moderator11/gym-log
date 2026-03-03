from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.infrastructure.repositories.user_repository_impl import UserRepositoryImpl
from app.infrastructure.repositories.workout_repository_impl import WorkoutRepositoryImpl
from app.infrastructure.repositories.category_repository_impl import CategoryRepositoryImpl
from app.application.services.auth_service import AuthService
from app.application.services.workout_service import WorkoutService
from app.application.services.category_service import CategoryService

security = HTTPBearer()


def get_user_repository(db: Session = Depends(get_db)) -> UserRepositoryImpl:
    """사용자 레포지토리 의존성"""
    return UserRepositoryImpl(db)


def get_workout_repository(db: Session = Depends(get_db)) -> WorkoutRepositoryImpl:
    """운동 레포지토리 의존성"""
    return WorkoutRepositoryImpl(db)


def get_category_repository(db: Session = Depends(get_db)) -> CategoryRepositoryImpl:
    """카테고리 레포지토리 의존성"""
    return CategoryRepositoryImpl(db)


def get_auth_service(
    user_repository: UserRepositoryImpl = Depends(get_user_repository)
) -> AuthService:
    """인증 서비스 의존성"""
    return AuthService(user_repository)


def get_workout_service(
    workout_repository: WorkoutRepositoryImpl = Depends(get_workout_repository)
) -> WorkoutService:
    """운동 서비스 의존성"""
    return WorkoutService(workout_repository)


def get_category_service(
    category_repository: CategoryRepositoryImpl = Depends(get_category_repository)
) -> CategoryService:
    """카테고리 서비스 의존성"""
    return CategoryService(category_repository)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> int:
    """현재 사용자 ID 가져오기"""
    token = credentials.credentials
    user_id = auth_service.verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요합니다"
        )

    return user_id
