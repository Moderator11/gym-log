from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """인증 서비스"""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def register_user(self, username: str, password: str, display_name: Optional[str] = None) -> User:
        """사용자 등록"""
        # 기존 사용자 확인
        existing_user = self.user_repository.find_by_username(username)
        if existing_user:
            raise ValueError("이미 사용 중인 아이디입니다")
        
        # 비밀번호 해시화
        hashed_password = pwd_context.hash(password)
        
        # 사용자 생성
        user = User(
            id=None,
            username=username,
            display_name=display_name if display_name else username,
            hashed_password=hashed_password,
            created_at=datetime.utcnow()
        )
        
        return self.user_repository.create(user)
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """사용자 인증"""
        user = self.user_repository.find_by_username(username)
        if not user:
            return None
        
        if not pwd_context.verify(password, user.hashed_password):
            return None
        
        return user
    
    def create_access_token(self, user_id: int) -> str:
        """액세스 토큰 생성"""
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": str(user_id), "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[int]:
        """토큰 검증"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return int(user_id)
        except:
            return None

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자 조회"""
        return self.user_repository.find_by_id(user_id)

    def update_sharing(self, user_id: int, sharing_enabled: bool) -> User:
        """사용자의 운동 공유 설정 업데이트"""
        return self.user_repository.update_sharing(user_id, sharing_enabled)

    def update_health_sharing(self, user_id: int, health_sharing_enabled: bool):
        """건강 기록 공유 설정 업데이트"""
        return self.user_repository.update_health_sharing(user_id, health_sharing_enabled)

    def update_display_name(self, user_id: int, display_name: str) -> User:
        """표시용 이름 수정"""
        return self.user_repository.update_display_name(user_id, display_name)

    def change_password(self, user_id: int, current_password: str, new_password: str) -> User:
        """비밀번호 변경 — 현재 비밀번호 검증 후 업데이트"""
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise ValueError("사용자를 찾을 수 없습니다")
        if not pwd_context.verify(current_password, user.hashed_password):
            raise ValueError("현재 비밀번호가 올바르지 않습니다")
        if current_password == new_password:
            raise ValueError("새 비밀번호는 현재 비밀번호와 달라야 합니다")
        hashed = pwd_context.hash(new_password)
        return self.user_repository.update_password(user_id, hashed)

    def delete_account(self, user_id: int, password: str) -> None:
        """회원 탈퇴 — 비밀번호 검증 후 삭제"""
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise ValueError("사용자를 찾을 수 없습니다")
        if not pwd_context.verify(password, user.hashed_password):
            raise ValueError("비밀번호가 올바르지 않습니다")
        self.user_repository.delete(user_id)
