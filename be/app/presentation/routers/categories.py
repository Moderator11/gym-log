from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.application.services.category_service import CategoryService
from app.application.dtos.category_dto import CategoryCreateRequest, CategoryResponse
from app.presentation.dependencies import get_category_service, get_current_user_id

router = APIRouter(prefix="/categories", tags=["운동 카테고리"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreateRequest,
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service)
):
    """운동 카테고리 생성"""
    try:
        category = category_service.create_category(user_id, request.name)
        return CategoryResponse(id=category.id, name=category.name)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[CategoryResponse])
def get_categories(
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service)
):
    """내 운동 카테고리 목록 조회"""
    categories = category_service.get_user_categories(user_id)
    return [CategoryResponse(id=c.id, name=c.name) for c in categories]


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    user_id: int = Depends(get_current_user_id),
    category_service: CategoryService = Depends(get_category_service)
):
    """운동 카테고리 삭제"""
    try:
        category_service.delete_category(category_id, user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
