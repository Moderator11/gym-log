from pydantic import BaseModel, Field
from typing import List


class CategoryCreateRequest(BaseModel):
    """운동 카테고리 생성 요청"""
    name: str = Field(..., min_length=1, max_length=100)
    tags: List[str] = Field(default_factory=list)


class CategoryUpdateRequest(BaseModel):
    """운동 카테고리 수정 요청"""
    name: str = Field(..., min_length=1, max_length=100)
    tags: List[str] = Field(default_factory=list)


class CategoryResponse(BaseModel):
    """운동 카테고리 응답"""
    id: int
    name: str
    tags: List[str]
