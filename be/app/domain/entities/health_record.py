from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class HealthRecordEntry:
    """건강 기록 항목 (지표 하나의 값)"""
    id: Optional[int]
    metric_id: int
    value: Optional[float]  # 비어 있을 수 있음


@dataclass
class HealthRecord:
    """건강 기록 엔티티"""
    id: Optional[int]
    user_id: int
    record_date: str   # YYYY-MM-DD
    entries: List[HealthRecordEntry] = field(default_factory=list)
