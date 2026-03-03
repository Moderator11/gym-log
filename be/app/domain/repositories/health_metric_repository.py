from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.health_metric import HealthMetric


class HealthMetricRepository(ABC):
    """건강 지표 레포지토리 인터페이스"""

    @abstractmethod
    def create(self, metric: HealthMetric) -> HealthMetric:
        pass

    @abstractmethod
    def find_by_user(self, user_id: int) -> List[HealthMetric]:
        pass

    @abstractmethod
    def find_by_id(self, metric_id: int) -> Optional[HealthMetric]:
        pass

    @abstractmethod
    def delete(self, metric_id: int) -> None:
        pass
