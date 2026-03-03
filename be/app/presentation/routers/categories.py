from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.category_service import CategoryService
from app.application.dtos.category_dto import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryResponse,
)
from app.presentation.dependencies import get_category_service, get_current_user_id

router = APIRouter(prefix="/categories", tags=["운동 카테고리"])


def _to_response(category) -> CategoryResponse:
    return CategoryResponse(id=category.id, name=category.name, tags=category.tags)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreateRequest,
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service),
):
    """운동 카테고리 생성"""
    try:
        category = category_service.create_category(user_id, request.name, request.tags)
        return _to_response(category)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[CategoryResponse])
def get_categories(
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service),
):
    """내 운동 카테고리 목록 조회"""
    categories = category_service.get_user_categories(user_id)
    return [_to_response(c) for c in categories]


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    request: CategoryUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service),
):
    """운동 카테고리 수정 (이름 + 태그)"""
    try:
        category = category_service.update_category(
            category_id, user_id, request.name, request.tags
        )
        return _to_response(category)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service),
):
    """운동 카테고리 삭제"""
    try:
        category_service.delete_category(category_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
