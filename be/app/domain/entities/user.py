from datetime import datetime
from typing import Optional
from dataclasses import dataclass


@dataclass
class User:
    """사용자 엔티티"""
    id: Optional[int]
    username: str
    hashed_password: str
    created_at: datetime
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()