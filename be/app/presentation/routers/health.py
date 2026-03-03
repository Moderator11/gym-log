from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.health_service import HealthService
from app.application.services.friendship_service import FriendshipService
from app.application.dtos.health_dto import (
    HealthMetricCreate,
    HealthMetricResponse,
    HealthRecordCreate,
    HealthRecordUpdate,
    HealthRecordResponse,
    HealthRecordEntryResponse,
)
from app.presentation.dependencies import (
    get_current_user_id,
    get_health_service,
    get_friendship_service,
)

router = APIRouter(prefix="/health", tags=["건강 기록"])


# ── 헬퍼 ────────────────────────────────────────────────────────────────────

def _build_entry_response(entry, metrics_map: dict) -> HealthRecordEntryResponse:
    m = metrics_map.get(entry.metric_id)
    return HealthRecordEntryResponse(
        id=entry.id,
        metric_id=entry.metric_id,
        metric_name=m.name if m else "알 수 없음",
        metric_unit=m.unit if m else "",
        value=entry.value,
    )


def _build_record_response(record, metrics_map: dict) -> HealthRecordResponse:
    return HealthRecordResponse(
        id=record.id,
        record_date=record.record_date,
        is_shared=record.is_shared,
        entries=[_build_entry_response(e, metrics_map) for e in record.entries],
    )


# ── 지표 관리 ────────────────────────────────────────────────────────────────

@router.get("/metrics", response_model=List[HealthMetricResponse])
def get_metrics(
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """내 건강 지표 목록"""
    return [HealthMetricResponse(id=m.id, name=m.name, unit=m.unit)
            for m in svc.get_metrics(user_id)]


@router.post("/metrics", response_model=HealthMetricResponse, status_code=status.HTTP_201_CREATED)
def create_metric(
    body: HealthMetricCreate,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 지표 생성"""
    try:
        m = svc.create_metric(user_id, body.name, body.unit)
        return HealthMetricResponse(id=m.id, name=m.name, unit=m.unit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_metric(
    metric_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 지표 삭제"""
    try:
        svc.delete_metric(user_id, metric_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── 기록 관리 ────────────────────────────────────────────────────────────────

@router.get("/records", response_model=List[HealthRecordResponse])
def get_records(
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """내 건강 기록 목록"""
    metrics_map = {m.id: m for m in svc.get_metrics(user_id)}
    return [_build_record_response(r, metrics_map) for r in svc.get_records(user_id)]


@router.post("/records", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    body: HealthRecordCreate,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 기록 생성"""
    entries = [{"metric_id": e.metric_id, "value": e.value} for e in body.entries]
    record = svc.create_record(user_id, body.record_date, body.is_shared, entries)
    metrics_map = {m.id: m for m in svc.get_metrics(user_id)}
    return _build_record_response(record, metrics_map)


@router.get("/records/{record_id}", response_model=HealthRecordResponse)
def get_record(
    record_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 기록 단건 조회"""
    try:
        record = svc.get_record(user_id, record_id)
        metrics_map = {m.id: m for m in svc.get_metrics(user_id)}
        return _build_record_response(record, metrics_map)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/records/{record_id}", response_model=HealthRecordResponse)
def update_record(
    record_id: int,
    body: HealthRecordUpdate,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 기록 수정"""
    try:
        entries = [{"metric_id": e.metric_id, "value": e.value} for e in body.entries]
        record = svc.update_record(user_id, record_id, body.record_date, body.is_shared, entries)
        metrics_map = {m.id: m for m in svc.get_metrics(user_id)}
        return _build_record_response(record, metrics_map)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """건강 기록 삭제"""
    try:
        svc.delete_record(user_id, record_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── 통계 ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_health_stats(
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
):
    """내 건강 지표 시계열 통계"""
    return svc.get_stats(user_id)


# ── 친구 건강 기록 ────────────────────────────────────────────────────────────

@router.get("/friends/{friend_id}/records", response_model=List[HealthRecordResponse])
def get_friend_records(
    friend_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
    friend_svc: FriendshipService = Depends(get_friendship_service),
):
    """친구의 공유된 건강 기록 조회"""
    if not friend_svc.are_friends(user_id, friend_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="친구가 아닙니다")
    metrics_map = {m.id: m for m in svc.get_metrics(friend_id)}
    return [_build_record_response(r, metrics_map) for r in svc.get_friend_records(friend_id)]


@router.get("/friends/{friend_id}/stats")
def get_friend_health_stats(
    friend_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: HealthService = Depends(get_health_service),
    friend_svc: FriendshipService = Depends(get_friendship_service),
):
    """친구의 공유된 건강 지표 통계"""
    if not friend_svc.are_friends(user_id, friend_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="친구가 아닙니다")
    return svc.get_friend_stats(friend_id)
