from pydantic import BaseModel
from typing import List, Optional


# ── 지표 ────────────────────────────────────────────────────────────────────

class HealthMetricCreate(BaseModel):
    name: str
    unit: str


class HealthMetricResponse(BaseModel):
    id: int
    name: str
    unit: str


# ── 기록 ────────────────────────────────────────────────────────────────────

class HealthRecordEntryCreate(BaseModel):
    metric_id: int
    value: Optional[float] = None


class HealthRecordCreate(BaseModel):
    record_date: str            # YYYY-MM-DD
    entries: List[HealthRecordEntryCreate] = []


class HealthRecordUpdate(BaseModel):
    record_date: str
    entries: List[HealthRecordEntryCreate] = []


class HealthRecordEntryResponse(BaseModel):
    id: int
    metric_id: int
    metric_name: str
    metric_unit: str
    value: Optional[float]


class HealthRecordResponse(BaseModel):
    id: int
    record_date: str
    entries: List[HealthRecordEntryResponse]
