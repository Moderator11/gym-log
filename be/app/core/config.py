import os
from dotenv import load_dotenv

# .env 파일이 있으면 로드 (없어도 환경변수에서 직접 읽음)
load_dotenv()

# ── JWT ──────────────────────────────────────────────────────────────
SECRET_KEY: str = os.environ.get(
    "SECRET_KEY",
    "INSECURE_DEV_KEY_CHANGE_THIS_IN_PRODUCTION",
)
ALGORITHM: str = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS: int = int(os.environ.get("ACCESS_TOKEN_EXPIRE_DAYS", "30"))

# ── Database ─────────────────────────────────────────────────────────
# 컨테이너 내부 기본값: /app/data/gym_log.db (volume mount 대상)
DATABASE_URL: str = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./data/gym_log.db",
)

# ── CORS ─────────────────────────────────────────────────────────────
# 여러 origin은 쉼표로 구분: "http://localhost:3000,https://example.com"
# 개발 기본값 "*" 는 모든 origin 허용 (프로덕션에서는 반드시 명시)
_cors_raw: str = os.environ.get("CORS_ORIGINS", "*")
CORS_ORIGINS: list[str] = [o.strip() for o in _cors_raw.split(",")]
