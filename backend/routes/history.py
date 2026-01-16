"""
History & Learning API Routes
Track cooked recipes and provide insights
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime, timedelta
import json
from collections import Counter

from database import get_session
from models.history import CookingHistory, HistoryEntry, InsightData
from services.recipe_engine import recipe_engine

router = APIRouter()

class SaveHistoryRequest(BaseModel):
    """Request to save cooking history"""
    recipe_id: str
    ingredients_used: list[str]

class HistoryResponse(BaseModel):
    """Response for history list"""
    entries: list[HistoryEntry]
    total: int

class InsightsResponse(BaseModel):
    """Response for nutrition insights"""
    insights: InsightData
    message: str

@router.post("/save")
async def save_to_history(
    request: SaveHistoryRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Save a cooked recipe to history.
    Auto-saves recipe with date, ingredients, and nutrition.
    """
    # Get recipe details
    recipe = recipe_engine.get_recipe_detail(request.recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Create history entry
    entry = CookingHistory(
        recipe_id=recipe.id,
        recipe_name=recipe.name,
        date_cooked=datetime.utcnow(),
        ingredients_used=json.dumps(request.ingredients_used),
        calories=recipe.nutrition.calories,
        protein_g=recipe.nutrition.protein_g,
        carbs_g=recipe.nutrition.carbs_g,
        fats_g=recipe.nutrition.fats_g
    )
    
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    
    return {"message": "Recipe saved to history", "id": entry.id}

@router.get("/", response_model=HistoryResponse)
async def get_history(
    limit: int = 20,
    offset: int = 0,
    session: AsyncSession = Depends(get_session)
):
    """Get cooking history, most recent first"""
    statement = (
        select(CookingHistory)
        .order_by(CookingHistory.date_cooked.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(statement)
    entries = result.scalars().all()
    
    # Convert to response model
    history_entries = [
        HistoryEntry(
            id=e.id,
            recipe_id=e.recipe_id,
            recipe_name=e.recipe_name,
            date_cooked=e.date_cooked,
            ingredients_used=json.loads(e.ingredients_used),
            calories=e.calories,
            protein_g=e.protein_g,
            carbs_g=e.carbs_g,
            fats_g=e.fats_g
        )
        for e in entries
    ]
    
    # Get total count
    count_statement = select(CookingHistory)
    count_result = await session.execute(count_statement)
    total = len(count_result.scalars().all())
    
    return HistoryResponse(entries=history_entries, total=total)

@router.get("/insights", response_model=InsightsResponse)
async def get_insights(
    days: int = 7,
    session: AsyncSession = Depends(get_session)
):
    """
    Get nutrition insights from cooking history.
    
    Analyzes:
    - Ingredient frequency
    - Average macros
    - Patterns (high-carb frequency, low-protein patterns)
    """
    # Get entries from last N days
    cutoff = datetime.utcnow() - timedelta(days=days)
    statement = select(CookingHistory).where(CookingHistory.date_cooked >= cutoff)
    result = await session.execute(statement)
    entries = result.scalars().all()
    
    if not entries:
        return InsightsResponse(
            insights=InsightData(
                total_recipes=0,
                avg_calories=0,
                avg_protein=0,
                avg_carbs=0,
                avg_fats=0,
                top_ingredients=[],
                patterns=[]
            ),
            message=f"No recipes cooked in the last {days} days"
        )
    
    # Calculate averages
    total = len(entries)
    avg_calories = sum(e.calories for e in entries) / total
    avg_protein = sum(e.protein_g for e in entries) / total
    avg_carbs = sum(e.carbs_g for e in entries) / total
    avg_fats = sum(e.fats_g for e in entries) / total
    
    # Ingredient frequency
    all_ingredients = []
    for e in entries:
        all_ingredients.extend(json.loads(e.ingredients_used))
    ingredient_counts = Counter(all_ingredients)
    top_ingredients = ingredient_counts.most_common(5)
    
    # Detect patterns
    patterns = []
    
    # High carb detection
    high_carb_count = sum(1 for e in entries if e.carbs_g > 40)
    if high_carb_count > total * 0.6:
        patterns.append("You've been eating carb-heavy meals frequently")
    
    # Low protein detection
    low_protein_count = sum(1 for e in entries if e.protein_g < 15)
    if low_protein_count > total * 0.5:
        patterns.append("Consider adding more protein to your meals")
    
    # Repeated ingredients
    if top_ingredients and top_ingredients[0][1] > total * 0.7:
        patterns.append(f"You use {top_ingredients[0][0]} very often - try some variety")
    
    if not patterns:
        patterns.append("Your eating habits look balanced!")
    
    return InsightsResponse(
        insights=InsightData(
            total_recipes=total,
            avg_calories=round(avg_calories, 1),
            avg_protein=round(avg_protein, 1),
            avg_carbs=round(avg_carbs, 1),
            avg_fats=round(avg_fats, 1),
            top_ingredients=top_ingredients,
            patterns=patterns
        ),
        message=f"Insights from {total} recipes in the last {days} days"
    )

@router.delete("/{entry_id}")
async def delete_history_entry(
    entry_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Delete a history entry"""
    statement = select(CookingHistory).where(CookingHistory.id == entry_id)
    result = await session.execute(statement)
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    
    await session.delete(entry)
    await session.commit()
    
    return {"message": "Entry deleted"}
