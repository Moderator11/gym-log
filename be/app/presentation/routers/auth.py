from fastapi import APIRouter, Depends, HTTPException, status
from app.application.services.auth_service import AuthService
from app.application.dtos.user_dto import (
    UserCreateRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    UserSettingsUpdateRequest,
    UserSettingsResponse
)
from app.presentation.dependencies import get_auth_service, get_current_user_id

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: UserCreateRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """회원가입"""
    try:
        user = auth_service.register_user(request.username, request.password)
        return UserResponse(
            id=user.id,
            username=user.username,
            created_at=user.created_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
def login(
    request: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """로그인"""
    user = auth_service.authenticate_user(request.username, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자명 또는 비밀번호가 올바르지 않습니다"
        )

    access_token = auth_service.create_access_token(user.id)
    return TokenResponse(access_token=access_token)


@router.get("/users/me", response_model=UserSettingsResponse)
def get_me(
    user_id: int = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
):
    """현재 사용자 정보 조회"""
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    return UserSettingsResponse(
        sharing_enabled=user.sharing_enabled,
        username=user.username
    )


@router.put("/users/me/settings", response_model=UserSettingsResponse)
def update_settings(
    request: UserSettingsUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service)
):
    """현재 사용자 설정 업데이트"""
    try:
        user = auth_service.update_sharing(user_id, request.sharing_enabled)
        return UserSettingsResponse(
            sharing_enabled=user.sharing_enabled,
            username=user.username
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )