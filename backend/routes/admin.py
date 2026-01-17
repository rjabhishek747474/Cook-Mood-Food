"""
Admin routes for managing users and system data
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from datetime import datetime, date, timedelta

from database import get_session
from models.user import User, UserProfile, UserResponse
from models.meal_log import MealLog
from models.favorite import Favorite
from models.goal import Goal
from models.history import CookingHistory
from services.auth_service import get_current_user_required

router = APIRouter()


async def require_admin(current_user: User = Depends(get_current_user_required)) -> User:
    """Dependency to require admin access"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session)
):
    """Get system statistics"""
    # User count
    users_result = await session.execute(select(func.count(User.id)))
    total_users = users_result.scalar_one()
    
    # Meal logs count
    meals_result = await session.execute(select(func.count(MealLog.id)))
    total_meals = meals_result.scalar_one()
    
    # Favorites count
    favorites_result = await session.execute(select(func.count(Favorite.id)))
    total_favorites = favorites_result.scalar_one()
    
    # Goals count
    goals_result = await session.execute(select(func.count(Goal.id)))
    total_goals = goals_result.scalar_one()
    
    # History count
    history_result = await session.execute(select(func.count(CookingHistory.id)))
    total_history = history_result.scalar_one()
    
    # Today's new users
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    today_users_result = await session.execute(
        select(func.count(User.id)).where(User.created_at >= start_of_day)
    )
    today_users = today_users_result.scalar_one()
    
    return {
        "total_users": total_users,
        "total_meal_logs": total_meals,
        "total_favorites": total_favorites,
        "total_goals": total_goals,
        "total_history": total_history,
        "today_new_users": today_users,
        "admin_email": admin.email
    }


@router.get("/users")
async def list_users(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session)
):
    """List all users (admin only)"""
    result = await session.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    users = result.scalars().all()
    
    # Get total count
    count_result = await session.execute(select(func.count(User.id)))
    total = count_result.scalar_one()
    
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "is_admin": u.is_admin,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.patch("/users/{user_id}/toggle-admin")
async def toggle_user_admin(
    user_id: int,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session)
):
    """Toggle admin status for a user"""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )
    
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = not user.is_admin
    await session.commit()
    
    return {"message": f"User {user.email} admin status: {user.is_admin}"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session)
):
    """Delete a user (admin only)"""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete related data
    await session.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    await session.execute(select(MealLog).where(MealLog.user_id == user_id))
    await session.execute(select(Favorite).where(Favorite.user_id == user_id))
    await session.execute(select(Goal).where(Goal.user_id == user_id))
    
    await session.delete(user)
    await session.commit()
    
    return {"message": f"User {user.email} deleted"}
