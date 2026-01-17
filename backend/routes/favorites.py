"""
Favorites routes for saving favorite recipes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from database import get_session
from models.user import User
from models.favorite import Favorite, FavoriteCreate, FavoriteResponse
from services.auth_service import get_current_user_required

router = APIRouter()


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Add a recipe to favorites"""
    # Check if already favorited
    existing = await session.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .where(Favorite.recipe_id == favorite_data.recipe_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipe already in favorites"
        )
    
    favorite = Favorite(
        user_id=current_user.id,
        recipe_id=favorite_data.recipe_id,
        recipe_name=favorite_data.recipe_name,
        recipe_type=favorite_data.recipe_type
    )
    
    session.add(favorite)
    await session.commit()
    await session.refresh(favorite)
    
    return FavoriteResponse(
        id=favorite.id,
        user_id=favorite.user_id,
        recipe_id=favorite.recipe_id,
        recipe_name=favorite.recipe_name,
        recipe_type=favorite.recipe_type,
        created_at=favorite.created_at
    )


@router.get("/", response_model=list[FavoriteResponse])
async def get_favorites(
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get all user's favorites"""
    result = await session.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    favorites = result.scalars().all()
    
    return [
        FavoriteResponse(
            id=f.id,
            user_id=f.user_id,
            recipe_id=f.recipe_id,
            recipe_name=f.recipe_name,
            recipe_type=f.recipe_type,
            created_at=f.created_at
        )
        for f in favorites
    ]


@router.get("/check/{recipe_id}")
async def check_favorite(
    recipe_id: str,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Check if a recipe is favorited"""
    result = await session.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .where(Favorite.recipe_id == recipe_id)
    )
    favorite = result.scalar_one_or_none()
    return {"is_favorited": favorite is not None, "favorite_id": favorite.id if favorite else None}


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Remove a recipe from favorites"""
    result = await session.execute(
        select(Favorite)
        .where(Favorite.id == favorite_id)
        .where(Favorite.user_id == current_user.id)
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    await session.delete(favorite)
    await session.commit()


@router.delete("/recipe/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite_by_recipe(
    recipe_id: str,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Remove a recipe from favorites by recipe ID"""
    result = await session.execute(
        select(Favorite)
        .where(Favorite.recipe_id == recipe_id)
        .where(Favorite.user_id == current_user.id)
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    await session.delete(favorite)
    await session.commit()
