from pydantic import BaseModel, Field
from datetime import datetime


class UserCreateRequest(BaseModel):
    """회원가입 요청"""
    username: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class UserLoginRequest(BaseModel):
    """로그인 요청"""
    username: str
    password: str


class UserResponse(BaseModel):
    """사용자 응답"""
    id: int
    username: str
    display_name: str
    created_at: datetime


class TokenResponse(BaseModel):
    """토큰 응답"""
    access_token: str
    token_type: str = "bearer"


class UserSettingsUpdateRequest(BaseModel):
    """사용자 설정 업데이트 요청"""
    sharing_enabled: bool
    health_sharing_enabled: bool


class UserSettingsResponse(BaseModel):
    """사용자 설정 응답"""
    sharing_enabled: bool
    health_sharing_enabled: bool
    username: str
    display_name: str
    created_at: datetime


class UpdateDisplayNameRequest(BaseModel):
    """사용자명(표시용) 수정 요청"""
    display_name: str = Field(..., min_length=1, max_length=50)


class UpdatePasswordRequest(BaseModel):
    """비밀번호 수정 요청"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=1)


class DeleteAccountRequest(BaseModel):
    """회원 탈퇴 요청"""
    password: str = Field(..., min_length=1)