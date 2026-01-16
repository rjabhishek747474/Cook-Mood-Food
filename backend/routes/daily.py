"""
Recipe of the Day API Routes
Get daily featured recipe
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.recipe_engine import recipe_engine
from models.recipe import RecipeCard, Recipe

router = APIRouter()

class DailyRecipeResponse(BaseModel):
    """Response for recipe of the day"""
    recipe: RecipeCard
    reason: str
    date: str

@router.get("/", response_model=DailyRecipeResponse)
async def get_recipe_of_day():
    """
    Get the recipe of the day.
    
    Selection criteria:
    - Uses common ingredients
    - Quick to make (under 20 minutes)
    - Beginner-friendly
    - Balanced macros
    
    Changes daily, no repeats within 7 days.
    """
    from datetime import date
    
    recipe, reason = recipe_engine.get_recipe_of_the_day()
    
    return DailyRecipeResponse(
        recipe=recipe,
        reason=reason,
        date=date.today().isoformat()
    )

@router.get("/detail", response_model=Recipe)
async def get_recipe_of_day_detail():
    """Get full details of recipe of the day"""
    card, _ = recipe_engine.get_recipe_of_the_day()
    recipe = recipe_engine.get_recipe_detail(card.id)
    
    if not recipe:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return recipe
