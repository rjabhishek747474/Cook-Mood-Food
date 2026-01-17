"""
Meal logging routes for tracking daily food intake
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime, date, timedelta
import json

from database import get_session
from models.user import User
from models.meal_log import (
    MealLog, MealLogCreate, MealLogResponse, MealItem, DailySummary
)
from services.auth_service import get_current_user_required

router = APIRouter()


@router.post("/", response_model=MealLogResponse, status_code=status.HTTP_201_CREATED)
async def log_meal(
    meal_data: MealLogCreate,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Log a new meal"""
    # Create meal log
    meal = MealLog(
        user_id=current_user.id,
        meal_type=meal_data.meal_type,
        notes=meal_data.notes,
        logged_at=meal_data.logged_at or datetime.utcnow()
    )
    
    # Set items and compute totals
    items_list = [item.model_dump() for item in meal_data.items]
    meal.set_items(items_list)
    
    session.add(meal)
    await session.commit()
    await session.refresh(meal)
    
    return MealLogResponse(
        id=meal.id,
        user_id=meal.user_id,
        logged_at=meal.logged_at,
        meal_type=meal.meal_type,
        items=meal.get_items(),
        calories_total=meal.calories_total,
        protein_total=meal.protein_total,
        carbs_total=meal.carbs_total,
        fats_total=meal.fats_total,
        notes=meal.notes
    )


@router.get("/today", response_model=DailySummary)
async def get_today_meals(
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get all meals logged today with summary"""
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    result = await session.execute(
        select(MealLog)
        .where(MealLog.user_id == current_user.id)
        .where(MealLog.logged_at >= start_of_day)
        .where(MealLog.logged_at <= end_of_day)
        .order_by(MealLog.logged_at)
    )
    meals = result.scalars().all()
    
    # Build response
    meal_responses = [
        MealLogResponse(
            id=m.id,
            user_id=m.user_id,
            logged_at=m.logged_at,
            meal_type=m.meal_type,
            items=m.get_items(),
            calories_total=m.calories_total,
            protein_total=m.protein_total,
            carbs_total=m.carbs_total,
            fats_total=m.fats_total,
            notes=m.notes
        )
        for m in meals
    ]
    
    return DailySummary(
        date=today.isoformat(),
        calories_total=sum(m.calories_total for m in meals),
        protein_total=sum(m.protein_total for m in meals),
        carbs_total=sum(m.carbs_total for m in meals),
        fats_total=sum(m.fats_total for m in meals),
        meals_count=len(meals),
        meals=meal_responses
    )


@router.get("/", response_model=list[MealLogResponse])
async def get_meals(
    date_filter: date = Query(None, alias="date"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get meals with optional date filter"""
    query = select(MealLog).where(MealLog.user_id == current_user.id)
    
    if date_filter:
        start = datetime.combine(date_filter, datetime.min.time())
        end = datetime.combine(date_filter, datetime.max.time())
        query = query.where(MealLog.logged_at >= start).where(MealLog.logged_at <= end)
    
    query = query.order_by(MealLog.logged_at.desc()).limit(limit)
    
    result = await session.execute(query)
    meals = result.scalars().all()
    
    return [
        MealLogResponse(
            id=m.id,
            user_id=m.user_id,
            logged_at=m.logged_at,
            meal_type=m.meal_type,
            items=m.get_items(),
            calories_total=m.calories_total,
            protein_total=m.protein_total,
            carbs_total=m.carbs_total,
            fats_total=m.fats_total,
            notes=m.notes
        )
        for m in meals
    ]


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Delete a meal log"""
    result = await session.execute(
        select(MealLog)
        .where(MealLog.id == meal_id)
        .where(MealLog.user_id == current_user.id)
    )
    meal = result.scalar_one_or_none()
    
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    
    await session.delete(meal)
    await session.commit()
