# Python 3.11 slim 이미지 사용
FROM python:3.11-slim

# 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 작업 디렉토리 생성
WORKDIR /app

# 의존성 파일 먼저 복사 (Docker 캐시 활용)
COPY requirements.txt .

# pip 업그레이드 및 패키지 설치
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 프로젝트 전체 복사
COPY . .

# DB 볼륨 마운트 대상 디렉토리 생성 (volume mount 전에 존재해야 권한 정상 적용)
RUN mkdir -p /app/data

# FastAPI 실행 포트
EXPOSE 8000

# FastAPI 실행 (app.main 기준)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]