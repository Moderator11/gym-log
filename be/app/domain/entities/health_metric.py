from dataclasses import dataclass
from typing import Optional


@dataclass
class HealthMetric:
    """건강 지표 엔티티 (사용자 정의 지표, e.g. 체중/kg)"""
    id: Optional[int]
    user_id: int
    name: str
    unit: str
