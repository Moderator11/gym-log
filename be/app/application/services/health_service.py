from typing import List, Optional
from app.domain.entities.health_metric import HealthMetric
from app.domain.entities.health_record import HealthRecord, HealthRecordEntry
from app.domain.repositories.health_metric_repository import HealthMetricRepository
from app.domain.repositories.health_record_repository import HealthRecordRepository


class HealthService:
    """건강 기록 서비스"""

    def __init__(
        self,
        metric_repository: HealthMetricRepository,
        record_repository: HealthRecordRepository,
    ):
        self.metric_repo = metric_repository
        self.record_repo = record_repository

    # ── 지표 관리 ──────────────────────────────────────────────────────────

    def get_metrics(self, user_id: int) -> List[HealthMetric]:
        return self.metric_repo.find_by_user(user_id)

    def create_metric(self, user_id: int, name: str, unit: str) -> HealthMetric:
        metric = HealthMetric(id=None, user_id=user_id, name=name, unit=unit)
        return self.metric_repo.create(metric)

    def delete_metric(self, user_id: int, metric_id: int) -> None:
        metric = self.metric_repo.find_by_id(metric_id)
        if not metric or metric.user_id != user_id:
            raise ValueError("지표를 찾을 수 없습니다")
        self.metric_repo.delete(metric_id)

    # ── 기록 관리 ──────────────────────────────────────────────────────────

    def get_records(self, user_id: int) -> List[HealthRecord]:
        return self.record_repo.find_by_user(user_id)

    def get_record(self, user_id: int, record_id: int) -> HealthRecord:
        record = self.record_repo.find_by_id(record_id)
        if not record or record.user_id != user_id:
            raise ValueError("기록을 찾을 수 없습니다")
        return record

    def create_record(
        self,
        user_id: int,
        record_date: str,
        entries: List[dict],
    ) -> HealthRecord:
        record = HealthRecord(
            id=None,
            user_id=user_id,
            record_date=record_date,
            entries=[
                HealthRecordEntry(id=None, metric_id=e["metric_id"], value=e.get("value"))
                for e in entries
            ],
        )
        return self.record_repo.create(record)

    def update_record(
        self,
        user_id: int,
        record_id: int,
        record_date: str,
        entries: List[dict],
    ) -> HealthRecord:
        existing = self.record_repo.find_by_id(record_id)
        if not existing or existing.user_id != user_id:
            raise ValueError("기록을 찾을 수 없습니다")

        updated = HealthRecord(
            id=record_id,
            user_id=user_id,
            record_date=record_date,
            entries=[
                HealthRecordEntry(id=None, metric_id=e["metric_id"], value=e.get("value"))
                for e in entries
            ],
        )
        return self.record_repo.update(updated)

    def delete_record(self, user_id: int, record_id: int) -> None:
        existing = self.record_repo.find_by_id(record_id)
        if not existing or existing.user_id != user_id:
            raise ValueError("기록을 찾을 수 없습니다")
        self.record_repo.delete(record_id)

    # ── 통계 ──────────────────────────────────────────────────────────────

    def get_stats(self, user_id: int) -> List[dict]:
        """
        지표별 시계열 데이터 반환:
        [{ metric_id, metric_name, metric_unit, data: [{date, value}] }]
        """
        metrics = {m.id: m for m in self.metric_repo.find_by_user(user_id)}
        records = self.record_repo.find_by_user(user_id)

        series: dict[int, list] = {mid: [] for mid in metrics}
        for rec in sorted(records, key=lambda r: r.record_date):
            for entry in rec.entries:
                if entry.metric_id in series and entry.value is not None:
                    series[entry.metric_id].append(
                        {"date": rec.record_date, "value": entry.value}
                    )

        return [
            {
                "metric_id": mid,
                "metric_name": metrics[mid].name,
                "metric_unit": metrics[mid].unit,
                "data": points,
            }
            for mid, points in series.items()
            if points  # 데이터가 있는 지표만
        ]

    # ── 친구 공유 ─────────────────────────────────────────────────────────

    def get_friend_records(self, friend_id: int) -> List[HealthRecord]:
        """친구의 모든 기록 반환 (공유 여부는 라우터에서 확인)"""
        return self.record_repo.find_by_user(friend_id)

    def get_friend_stats(self, friend_id: int) -> List[dict]:
        """친구의 공유된 기록 기반 통계"""
        metrics = {m.id: m for m in self.metric_repo.find_by_user(friend_id)}
        records = self.record_repo.find_by_user(friend_id)

        series: dict[int, list] = {mid: [] for mid in metrics}
        for rec in sorted(records, key=lambda r: r.record_date):
            for entry in rec.entries:
                if entry.metric_id in series and entry.value is not None:
                    series[entry.metric_id].append(
                        {"date": rec.record_date, "value": entry.value}
                    )

        return [
            {
                "metric_id": mid,
                "metric_name": metrics[mid].name,
                "metric_unit": metrics[mid].unit,
                "data": points,
            }
            for mid, points in series.items()
            if points
        ]
