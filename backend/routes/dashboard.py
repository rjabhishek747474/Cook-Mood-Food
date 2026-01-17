"""
Dashboard routes for user overview and trends
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import date, datetime, timedelta
from typing import Optional

from database import get_session
from models.user import User, UserProfile
from models.meal_log import MealLog
from models.goal import Goal
from models.favorite import Favorite
from services.auth_service import get_current_user_required, get_current_user
from services.recipe_engine import recipe_engine

router = APIRouter()


@router.get("/today")
async def get_today_dashboard(
    current_user: Optional[User] = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get today at-a-glance dashboard"""
    today = date.today()
    
    # If not authenticated, return public dashboard
    if not current_user:
        # Get recipe of the day
        recipe_card, reason = recipe_engine.get_recipe_of_the_day()
        return {
            "authenticated": False,
            "date": today.isoformat(),
            "recipe_of_day": {
                "recipe": recipe_card.model_dump() if recipe_card else None,
                "reason": reason
            },
            "message": "Login to track your nutrition and meals"
        }
    
    # Get today's meals
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    meals_result = await session.execute(
        select(MealLog)
        .where(MealLog.user_id == current_user.id)
        .where(MealLog.logged_at >= start_of_day)
        .where(MealLog.logged_at <= end_of_day)
        .order_by(MealLog.logged_at)
    )
    meals = meals_result.scalars().all()
    
    # Calculate totals
    calories_total = sum(m.calories_total for m in meals)
    protein_total = sum(m.protein_total for m in meals)
    carbs_total = sum(m.carbs_total for m in meals)
    fats_total = sum(m.fats_total for m in meals)
    
    # Get active goals
    goals_result = await session.execute(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .where(Goal.is_active == True)
    )
    goals = goals_result.scalars().all()
    
    # Build goal progress
    goal_progress = []
    for g in goals:
        current = 0
        if g.kind == "calorie":
            current = calories_total
        elif g.kind == "protein":
            current = protein_total
        elif g.kind == "carbs":
            current = carbs_total
        elif g.kind == "fats":
            current = fats_total
        
        goal_progress.append({
            "kind": g.kind,
            "target": g.target_value,
            "current": current,
            "progress_percent": min(100, (current / g.target_value * 100) if g.target_value > 0 else 0)
        })
    
    # Get user profile for personalized recommendations
    profile_result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    
    # Generate action card based on progress
    action_card = None
    calorie_goal = next((g for g in goal_progress if g["kind"] == "calorie"), None)
    if calorie_goal:
        remaining = calorie_goal["target"] - calorie_goal["current"]
        if remaining > 500:
            action_card = {
                "type": "suggestion",
                "title": "You have calories remaining",
                "message": f"You still have {int(remaining)} calories to go. Consider a balanced snack!",
                "action": "Browse recipes",
                "action_url": "/fridge"
            }
        elif remaining < 0:
            action_card = {
                "type": "warning",
                "title": "Over your calorie goal",
                "message": f"You're {int(abs(remaining))} calories over today. Consider a lighter dinner.",
                "action": None
            }
        elif calorie_goal["progress_percent"] >= 80:
            action_card = {
                "type": "success",
                "title": "Great progress!",
                "message": "You're on track to hit your calorie goal today!",
                "action": None
            }
    
    # Recipe of the day
    recipe_card, reason = recipe_engine.get_recipe_of_the_day()
    
    return {
        "authenticated": True,
        "date": today.isoformat(),
        "user": {
            "email": current_user.email,
            "name": profile.name if profile else None
        },
        "nutrition": {
            "calories": calories_total,
            "protein_g": protein_total,
            "carbs_g": carbs_total,
            "fats_g": fats_total
        },
        "meals_count": len(meals),
        "goals": goal_progress,
        "action_card": action_card,
        "recipe_of_day": {
            "recipe": recipe_card.model_dump() if recipe_card else None,
            "reason": reason
        }
    }


@router.get("/trends")
async def get_nutrition_trends(
    days: int = Query(7, le=90),
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get nutrition trends over specified days"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    # Get all meals in date range
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    result = await session.execute(
        select(MealLog)
        .where(MealLog.user_id == current_user.id)
        .where(MealLog.logged_at >= start_datetime)
        .where(MealLog.logged_at <= end_datetime)
        .order_by(MealLog.logged_at)
    )
    meals = result.scalars().all()
    
    # Group by date
    daily_data = {}
    for d in range(days):
        day = start_date + timedelta(days=d)
        daily_data[day.isoformat()] = {
            "date": day.isoformat(),
            "calories": 0,
            "protein_g": 0,
            "carbs_g": 0,
            "fats_g": 0,
            "meals_count": 0
        }
    
    for meal in meals:
        day_key = meal.logged_at.date().isoformat()
        if day_key in daily_data:
            daily_data[day_key]["calories"] += meal.calories_total
            daily_data[day_key]["protein_g"] += meal.protein_total
            daily_data[day_key]["carbs_g"] += meal.carbs_total
            daily_data[day_key]["fats_g"] += meal.fats_total
            daily_data[day_key]["meals_count"] += 1
    
    # Calculate averages
    active_days = [d for d in daily_data.values() if d["meals_count"] > 0]
    avg_calories = sum(d["calories"] for d in active_days) / len(active_days) if active_days else 0
    avg_protein = sum(d["protein_g"] for d in active_days) / len(active_days) if active_days else 0
    avg_carbs = sum(d["carbs_g"] for d in active_days) / len(active_days) if active_days else 0
    avg_fats = sum(d["fats_g"] for d in active_days) / len(active_days) if active_days else 0
    
    return {
        "period": f"{days} days",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": list(daily_data.values()),
        "averages": {
            "calories": round(avg_calories),
            "protein_g": round(avg_protein, 1),
            "carbs_g": round(avg_carbs, 1),
            "fats_g": round(avg_fats, 1)
        },
        "active_days": len(active_days),
        "total_meals": sum(d["meals_count"] for d in daily_data.values())
    }
