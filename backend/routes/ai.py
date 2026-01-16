"""
AI-powered Recipe Generation Routes
Generate recipes using Gemini AI
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

from models.recipe import Recipe, RecipeCard, Nutrition

router = APIRouter()

# Check if AI is available
def is_ai_available() -> bool:
    return bool(os.getenv("GEMINI_API_KEY"))

class AIRecipeRequest(BaseModel):
    """Request for AI recipe generation"""
    ingredients: str  # Comma-separated ingredients
    diet: Optional[str] = None  # veg, egg, non-veg
    cuisine: Optional[str] = None  # Indian, Japanese, Chinese, Global
    goal: Optional[str] = None  # fat_loss, muscle_gain, maintenance

class AIRecipeResponse(BaseModel):
    """Response for AI recipe generation"""
    recipe: Recipe
    ai_generated: bool = True
    message: str

@router.get("/status")
async def ai_status():
    """Check if AI features are available"""
    available = is_ai_available()
    return {
        "ai_available": available,
        "message": "AI features enabled" if available else "Set GEMINI_API_KEY to enable AI features"
    }

@router.post("/generate", response_model=AIRecipeResponse)
async def generate_ai_recipe(request: AIRecipeRequest):
    """
    Generate a recipe using Gemini AI.
    
    This endpoint uses AI to create a custom recipe based on:
    - Available ingredients
    - Diet preference
    - Cuisine preference
    - Fitness goal
    """
    if not is_ai_available():
        raise HTTPException(
            status_code=503,
            detail="AI features not available. Set GEMINI_API_KEY environment variable."
        )
    
    # Import here to avoid errors when API key not set
    from services.ai_service import generate_recipe_with_ai
    from services.normalizer import normalizer
    
    # Parse ingredients
    ingredients = normalizer.parse_input(request.ingredients)
    
    if not ingredients:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one ingredient"
        )
    
    # Generate recipe with AI
    recipe = await generate_recipe_with_ai(
        ingredients=ingredients,
        diet=request.diet,
        cuisine=request.cuisine,
        goal=request.goal
    )
    
    if not recipe:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate recipe. Please try again."
        )
    
    return AIRecipeResponse(
        recipe=recipe,
        ai_generated=True,
        message=f"AI-generated recipe using: {', '.join(ingredients)}"
    )

@router.post("/substitute")
async def suggest_substitutes(
    missing: str,
    available: str
):
    """
    Get AI suggestions for ingredient substitutes.
    
    - missing: The ingredient you're missing
    - available: Comma-separated list of available ingredients
    """
    if not is_ai_available():
        raise HTTPException(
            status_code=503,
            detail="AI features not available"
        )
    
    from services.ai_service import suggest_ingredient_substitutes
    from services.normalizer import normalizer
    
    available_list = normalizer.parse_input(available)
    
    substitutes = await suggest_ingredient_substitutes(
        missing_ingredient=missing,
        available_ingredients=available_list
    )
    
    return {
        "missing": missing,
        "substitutes": substitutes,
        "message": f"Found {len(substitutes)} possible substitutes"
    }
