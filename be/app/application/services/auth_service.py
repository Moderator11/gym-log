from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository

# 설정
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """인증 서비스"""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def register_user(self, username: str, password: str) -> User:
        """사용자 등록"""
        # 기존 사용자 확인
        existing_user = self.user_repository.find_by_username(username)
        if existing_user:
            raise ValueError("이미 존재하는 사용자명입니다")
        
        # 비밀번호 해시화
        hashed_password = pwd_context.hash(password)
        
        # 사용자 생성
        user = User(
            id=None,
            username=username,
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