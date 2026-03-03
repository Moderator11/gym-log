from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.entities.health_record import HealthRecord, HealthRecordEntry
from app.domain.repositories.health_record_repository import HealthRecordRepository
from app.infrastructure.models import HealthRecordModel, HealthRecordEntryModel


class HealthRecordRepositoryImpl(HealthRecordRepository):
    """건강 기록 레포지토리 구현"""

    def __init__(self, db: Session):
        self.db = db

    def _to_domain(self, r: HealthRecordModel) -> HealthRecord:
        entries = [
            HealthRecordEntry(
                id=e.id,
                metric_id=e.metric_id,
                value=e.value,
            )
            for e in r.entries
        ]
        return HealthRecord(
            id=r.id,
            user_id=r.user_id,
            record_date=r.record_date,
            is_shared=r.is_shared,
            entries=entries,
        )

    def _load(self, record_id: int) -> Optional[HealthRecordModel]:
        return (
            self.db.query(HealthRecordModel)
            .options(joinedload(HealthRecordModel.entries))
            .filter(HealthRecordModel.id == record_id)
            .first()
        )

    def create(self, record: HealthRecord) -> HealthRecord:
        db_r = HealthRecordModel(
            user_id=record.user_id,
            record_date=record.record_date,
            is_shared=record.is_shared,
        )
        self.db.add(db_r)
        self.db.flush()  # ID 확보

        for entry in record.entries:
            db_e = HealthRecordEntryModel(
                health_record_id=db_r.id,
                metric_id=entry.metric_id,
                value=entry.value,
            )
            self.db.add(db_e)

        self.db.commit()
        self.db.refresh(db_r)
        return self._to_domain(self._load(db_r.id))

    def find_by_user(self, user_id: int) -> List[HealthRecord]:
        rows = (
            self.db.query(HealthRecordModel)
            .options(joinedload(HealthRecordModel.entries))
            .filter(HealthRecordModel.user_id == user_id)
            .order_by(HealthRecordModel.record_date.desc())
            .all()
        )
        return [self._to_domain(r) for r in rows]

    def find_by_id(self, record_id: int) -> Optional[HealthRecord]:
        row = self._load(record_id)
        return self._to_domain(row) if row else None

    def update(self, record: HealthRecord) -> HealthRecord:
        db_r = self._load(record.id)
        if not db_r:
            raise ValueError("건강 기록을 찾을 수 없습니다")

        db_r.record_date = record.record_date
        db_r.is_shared = record.is_shared

        # 기존 항목 삭제 후 재삽입 (간단하고 안전)
        for e in list(db_r.entries):
            self.db.delete(e)
        self.db.flush()

        for entry in record.entries:
            db_e = HealthRecordEntryModel(
                health_record_id=db_r.id,
                metric_id=entry.metric_id,
                value=entry.value,
            )
            self.db.add(db_e)

        self.db.commit()
        self.db.refresh(db_r)
        return self._to_domain(self._load(db_r.id))

    def delete(self, record_id: int) -> None:
        row = self.db.query(HealthRecordModel).filter(
            HealthRecordModel.id == record_id
        ).first()
        if row:
            self.db.delete(row)
            self.db.commit()

    def find_shared_by_user(self, user_id: int) -> List[HealthRecord]:
        rows = (
            self.db.query(HealthRecordModel)
            .options(joinedload(HealthRecordModel.entries))
            .filter(
                HealthRecordModel.user_id == user_id,
                HealthRecordModel.is_shared == True,
            )
            .order_by(HealthRecordModel.record_date.desc())
            .all()
        )
        return [self._to_domain(r) for r in rows]
