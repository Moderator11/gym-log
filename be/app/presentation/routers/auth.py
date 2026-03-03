from fastapi import APIRouter, Depends, HTTPException, status
from app.application.services.auth_service import AuthService
from app.application.dtos.user_dto import (
    UserCreateRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse
)
from app.presentation.dependencies import get_auth_service

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