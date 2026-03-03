from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.health_record import HealthRecord


class HealthRecordRepository(ABC):
    """건강 기록 레포지토리 인터페이스"""

    @abstractmethod
    def create(self, record: HealthRecord) -> HealthRecord:
        pass

    @abstractmethod
    def find_by_user(self, user_id: int) -> List[HealthRecord]:
        pass

    @abstractmethod
    def find_by_id(self, record_id: int) -> Optional[HealthRecord]:
        pass

    @abstractmethod
    def update(self, record: HealthRecord) -> HealthRecord:
        pass

    @abstractmethod
    def delete(self, record_id: int) -> None:
        pass

    @abstractmethod
    def find_shared_by_user(self, user_id: int) -> List[HealthRecord]:
        """is_shared=True 인 기록만 반환"""
        pass
