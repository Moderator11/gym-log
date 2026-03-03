from dataclasses import dataclass
from typing import Optional


@dataclass
class Friendship:
    """친구 관계 엔티티"""
    id: Optional[int]
    requester_id: int
    addressee_id: int
    status: str  # "pending" | "accepted" | "declined"
