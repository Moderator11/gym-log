from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.health_metric import HealthMetric
from app.domain.repositories.health_metric_repository import HealthMetricRepository
from app.infrastructure.models import HealthMetricModel


class HealthMetricRepositoryImpl(HealthMetricRepository):
    """건강 지표 레포지토리 구현"""

    def __init__(self, db: Session):
        self.db = db

    def _to_domain(self, m: HealthMetricModel) -> HealthMetric:
        return HealthMetric(id=m.id, user_id=m.user_id, name=m.name, unit=m.unit)

    def create(self, metric: HealthMetric) -> HealthMetric:
        db_m = HealthMetricModel(
            user_id=metric.user_id,
            name=metric.name,
            unit=metric.unit,
        )
        self.db.add(db_m)
        self.db.commit()
        self.db.refresh(db_m)
        return self._to_domain(db_m)

    def find_by_user(self, user_id: int) -> List[HealthMetric]:
        rows = self.db.query(HealthMetricModel).filter(
            HealthMetricModel.user_id == user_id
        ).order_by(HealthMetricModel.name).all()
        return [self._to_domain(r) for r in rows]

    def find_by_id(self, metric_id: int) -> Optional[HealthMetric]:
        row = self.db.query(HealthMetricModel).filter(
            HealthMetricModel.id == metric_id
        ).first()
        return self._to_domain(row) if row else None

    def delete(self, metric_id: int) -> None:
        row = self.db.query(HealthMetricModel).filter(
            HealthMetricModel.id == metric_id
        ).first()
        if row:
            self.db.delete(row)
            self.db.commit()
