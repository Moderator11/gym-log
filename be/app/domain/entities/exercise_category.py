from dataclasses import dataclass
from typing import Optional


@dataclass
class ExerciseCategory:
    """운동 카테고리 엔티티 (사용자가 직접 만든 운동 이름 목록)"""
    id: Optional[int]
    user_id: int
    name: str

    def __str__(self):
        return self.name
