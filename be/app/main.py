from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.presentation.routers import auth, workouts

# 데이터베이스 초기화
init_db()

app = FastAPI(
    title="운동 기록 API",
    description="DDD 패턴으로 구현한 운동 기록 백엔드",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(workouts.router)


@app.get("/")
def root():
    return {"message": "운동 기록 API에 오신 것을 환영합니다!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}