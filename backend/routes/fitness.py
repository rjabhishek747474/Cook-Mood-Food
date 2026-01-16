"""
Fitness Recipes API Routes
Get recipes optimized for fitness goals with AI recommendations
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import os

from services.recipe_engine import recipe_engine
from models.recipe import RecipeCard, Recipe

router = APIRouter()

NUTRITION_DISCLAIMER = "Nutrition values are estimates based on standard raw ingredients. Actual values may vary based on portion sizes and cooking methods."

GOAL_TIPS = {
    "fat_loss": "Focus on high protein, low calorie foods. Avoid hidden sugars and processed foods.",
    "muscle_gain": "Consume protein within 30 mins post-workout. Aim for 1.6-2.2g protein per kg bodyweight.",
    "maintenance": "Balance your macros and listen to your body's hunger cues."
}

class FitnessResponse(BaseModel):
    """Response for fitness recipes"""
    goal: str
    recipes: list[RecipeCard]
    disclaimer: str
    ai_recommendation: Optional[dict] = None
    daily_tip: Optional[str] = None

@router.get("/", response_model=FitnessResponse)
async def get_fitness_recipes(
    goal: Literal["fat_loss", "muscle_gain", "maintenance"] = "maintenance",
    diet: Optional[str] = None,
    include_ai: bool = True
):
    """
    Get recipes filtered by fitness goal with AI recommendation of the day.
    
    Goals:
    - fat_loss: Low calorie, low fat, high protein recipes
    - muscle_gain: High protein recipes
    - maintenance: Balanced macros
    """
    # Get database recipes
    recipes = recipe_engine.get_fitness_recipes(goal=goal, diet=diet)
    
    ai_recommendation = None
    
    # Generate AI recommendation if enabled
    if include_ai and os.getenv("GEMINI_API_KEY"):
        try:
            from services.ai_service import generate_fitness_recipe
            
            ai_recipe = await generate_fitness_recipe(goal=goal, diet=diet)
            if ai_recipe:
                # Convert to RecipeCard format
                ai_card = RecipeCard(
                    id=ai_recipe.id,
                    name=ai_recipe.name,
                    cuisine=ai_recipe.cuisine,
                    difficulty=ai_recipe.difficulty,
                    time_minutes=ai_recipe.time_minutes,
                    required_ingredients=ai_recipe.required_ingredients,
                    optional_ingredients=ai_recipe.optional_ingredients or [],
                    nutrition=ai_recipe.nutrition,
                    servings=ai_recipe.servings
                )
                
                # Store for later retrieval
                recipe_engine._ai_recipes[ai_recipe.id] = ai_recipe
                
                ai_recommendation = {
                    "recipe": ai_card.model_dump(),
                    "fitness_tip": getattr(ai_recipe, 'fitness_tip', GOAL_TIPS.get(goal, '')),
                    "why_this_helps": getattr(ai_recipe, 'cooking_impact', f"Optimized for {goal.replace('_', ' ')}")
                }
                
                # Add AI recipe to top of list
                recipes = [ai_card] + recipes
                
        except Exception as e:
            print(f"Fitness AI recommendation failed: {e}")
    
    return FitnessResponse(
        goal=goal,
        recipes=recipes,
        disclaimer=NUTRITION_DISCLAIMER,
        ai_recommendation=ai_recommendation,
        daily_tip=GOAL_TIPS.get(goal)
    )

@router.get("/recommendation/{goal}")
async def get_fitness_recommendation(
    goal: Literal["fat_loss", "muscle_gain", "maintenance"],
    diet: Optional[str] = None
):
    """Get AI-generated fitness recipe recommendation of the day."""
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="AI features not available")
    
    try:
        from services.ai_service import generate_fitness_recipe
        
        recipe = await generate_fitness_recipe(goal=goal, diet=diet)
        if recipe:
            recipe_engine._ai_recipes[recipe.id] = recipe
            return {
                "goal": goal,
                "recipe": recipe,
                "tip": getattr(recipe, 'fitness_tip', GOAL_TIPS.get(goal)),
                "message": f"Today's {goal.replace('_', ' ')} recommendation"
            }
        raise HTTPException(status_code=500, detail="Failed to generate recommendation")
        
    except Exception as e:
        print(f"Fitness recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recipe/{recipe_id}", response_model=Recipe)
async def get_fitness_recipe(recipe_id: str):
    """Get full recipe details with nutrition info"""
    recipe = recipe_engine.get_recipe_detail(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe
