from pydantic import BaseModel, Field


class CategoryCreateRequest(BaseModel):
    """운동 카테고리 생성 요청"""
    name: str = Field(..., min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    """운동 카테고리 응답"""
    id: int
    name: str
