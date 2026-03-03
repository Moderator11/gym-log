from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class ExerciseCategory:
    """운동 카테고리 엔티티.

    향후 친구 시스템에서 공개 카테고리 공유를 위해 user_id 소유 개념이
    명확히 분리되어 있으며, tags 로 카테고리를 분류할 수 있습니다.
    """
    id: Optional[int]
    user_id: int
    name: str
    tags: List[str] = field(default_factory=list)
    exercise_type: str = "anaerobic"

    def __str__(self):
        return self.name
