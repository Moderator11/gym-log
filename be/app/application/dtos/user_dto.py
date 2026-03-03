from pydantic import BaseModel, Field
from datetime import datetime


class UserCreateRequest(BaseModel):
    """회원가입 요청"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class UserLoginRequest(BaseModel):
    """로그인 요청"""
    username: str
    password: str


class UserResponse(BaseModel):
    """사용자 응답"""
    id: int
    username: str
    created_at: datetime


class TokenResponse(BaseModel):
    """토큰 응답"""
    access_token: str
    token_type: str = "bearer"