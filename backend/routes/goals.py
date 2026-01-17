"""
Goals routes for managing nutrition/fitness goals
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import date, datetime, timedelta

from database import get_session
from models.user import User
from models.goal import Goal, GoalCreate, GoalUpdate, GoalResponse, GoalProgress
from models.meal_log import MealLog
from services.auth_service import get_current_user_required

router = APIRouter()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Create or update a goal (only one active goal per kind)"""
    # Deactivate existing goal of same kind
    result = await session.execute(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .where(Goal.kind == goal_data.kind)
        .where(Goal.is_active == True)
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.is_active = False
        await session.commit()
    
    # Create new goal
    goal = Goal(
        user_id=current_user.id,
        kind=goal_data.kind,
        target_value=goal_data.target_value,
        end_date=goal_data.end_date
    )
    
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        kind=goal.kind,
        target_value=goal.target_value,
        current_value=goal.current_value,
        progress_percent=min(100, (goal.current_value / goal.target_value * 100) if goal.target_value > 0 else 0),
        start_date=goal.start_date,
        end_date=goal.end_date,
        is_active=goal.is_active
    )


@router.get("/", response_model=list[GoalResponse])
async def get_goals(
    active_only: bool = True,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get user's goals"""
    query = select(Goal).where(Goal.user_id == current_user.id)
    if active_only:
        query = query.where(Goal.is_active == True)
    
    result = await session.execute(query.order_by(Goal.created_at.desc()))
    goals = result.scalars().all()
    
    return [
        GoalResponse(
            id=g.id,
            user_id=g.user_id,
            kind=g.kind,
            target_value=g.target_value,
            current_value=g.current_value,
            progress_percent=min(100, (g.current_value / g.target_value * 100) if g.target_value > 0 else 0),
            start_date=g.start_date,
            end_date=g.end_date,
            is_active=g.is_active
        )
        for g in goals
    ]


@router.get("/progress", response_model=GoalProgress)
async def get_goal_progress(
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get goal progress with today's nutrition totals"""
    # Get today's meals
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    meals_result = await session.execute(
        select(MealLog)
        .where(MealLog.user_id == current_user.id)
        .where(MealLog.logged_at >= start_of_day)
        .where(MealLog.logged_at <= end_of_day)
    )
    meals = meals_result.scalars().all()
    
    daily_calories = sum(m.calories_total for m in meals)
    daily_protein = sum(m.protein_total for m in meals)
    daily_carbs = sum(m.carbs_total for m in meals)
    daily_fats = sum(m.fats_total for m in meals)
    
    # Get active goals and update current values
    goals_result = await session.execute(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .where(Goal.is_active == True)
    )
    goals = goals_result.scalars().all()
    
    goal_responses = []
    for g in goals:
        # Update current value based on kind
        if g.kind == "calorie":
            g.current_value = daily_calories
        elif g.kind == "protein":
            g.current_value = daily_protein
        elif g.kind == "carbs":
            g.current_value = daily_carbs
        elif g.kind == "fats":
            g.current_value = daily_fats
        
        goal_responses.append(GoalResponse(
            id=g.id,
            user_id=g.user_id,
            kind=g.kind,
            target_value=g.target_value,
            current_value=g.current_value,
            progress_percent=min(100, (g.current_value / g.target_value * 100) if g.target_value > 0 else 0),
            start_date=g.start_date,
            end_date=g.end_date,
            is_active=g.is_active
        ))
    
    await session.commit()
    
    return GoalProgress(
        goals=goal_responses,
        daily_calories=daily_calories,
        daily_protein=daily_protein,
        daily_carbs=daily_carbs,
        daily_fats=daily_fats
    )


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Update a goal"""
    result = await session.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .where(Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    goal.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(goal)
    
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        kind=goal.kind,
        target_value=goal.target_value,
        current_value=goal.current_value,
        progress_percent=min(100, (goal.current_value / goal.target_value * 100) if goal.target_value > 0 else 0),
        start_date=goal.start_date,
        end_date=goal.end_date,
        is_active=goal.is_active
    )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Delete a goal"""
    result = await session.execute(
        select(Goal)
        .where(Goal.id == goal_id)
        .where(Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    await session.delete(goal)
    await session.commit()
