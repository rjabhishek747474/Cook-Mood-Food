"""
Global Cuisine Explorer API Routes
Get recipes by cuisine type with AI recommendations
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import os

from services.recipe_engine import recipe_engine
from models.recipe import RecipeCard, Recipe

router = APIRouter()

SUPPORTED_CUISINES = ["Indian", "Japanese", "Chinese", "Italian", "Mexican", "Thai", "Global"]

CUISINE_FACTS = {
    "Indian": "One of the world's most diverse cuisines with distinct regional flavors from Kashmir to Kerala.",
    "Japanese": "Known for precision, seasonality, and umami - the fifth taste discovered in Japan.",
    "Chinese": "8 great culinary traditions spanning 5000 years of history.",
    "Italian": "Mediterranean freshness meets generations of regional traditions.",
    "Mexican": "UNESCO-recognized cuisine blending indigenous and Spanish influences.",
    "Thai": "Perfect balance of sweet, sour, salty, and spicy in every dish.",
    "Global": "Fusion and modern interpretations from around the world."
}

class CuisineResponse(BaseModel):
    """Response for cuisine recipes"""
    cuisine: str
    recipes: list[RecipeCard]
    supported_cuisines: list[str] = SUPPORTED_CUISINES
    ai_recommendation: Optional[dict] = None
    cuisine_fact: Optional[str] = None

@router.get("/", response_model=CuisineResponse)
async def get_cuisine_recipes(
    cuisine: Literal["Indian", "Japanese", "Chinese", "Italian", "Mexican", "Thai", "Global"] = "Indian",
    diet: Optional[str] = None,
    include_ai: bool = True
):
    """
    Get recipes by cuisine type with AI recommendation of the day.
    
    Supported cuisines:
    - Indian, Japanese, Chinese, Italian, Mexican, Thai, Global
    """
    # Get database recipes
    recipes = recipe_engine.get_by_cuisine(cuisine=cuisine, diet=diet)
    
    ai_recommendation = None
    
    # Generate AI recommendation if enabled
    if include_ai and os.getenv("GEMINI_API_KEY"):
        try:
            from services.ai_service import generate_cuisine_recipe
            
            ai_recipe = await generate_cuisine_recipe(cuisine=cuisine, diet=diet)
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
                    "cultural_note": getattr(ai_recipe, 'cultural_note', f"Explore authentic {cuisine} flavors!"),
                    "region": getattr(ai_recipe, 'region', cuisine)
                }
                
                # Add AI recipe to top of list
                recipes = [ai_card] + recipes
                
        except Exception as e:
            print(f"Cuisine AI recommendation failed: {e}")
    
    return CuisineResponse(
        cuisine=cuisine,
        recipes=recipes,
        ai_recommendation=ai_recommendation,
        cuisine_fact=CUISINE_FACTS.get(cuisine)
    )

@router.get("/recommendation/{cuisine}")
async def get_cuisine_recommendation(
    cuisine: str,
    diet: Optional[str] = None,
    difficulty: str = "Easy"
):
    """Get AI-generated cuisine recipe recommendation of the day."""
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="AI features not available")
    
    if cuisine not in SUPPORTED_CUISINES:
        cuisine = "Global"
    
    try:
        from services.ai_service import generate_cuisine_recipe
        
        recipe = await generate_cuisine_recipe(cuisine=cuisine, diet=diet, difficulty=difficulty)
        if recipe:
            recipe_engine._ai_recipes[recipe.id] = recipe
            return {
                "cuisine": cuisine,
                "recipe": recipe,
                "cultural_note": getattr(recipe, 'cultural_note', CUISINE_FACTS.get(cuisine)),
                "message": f"Today's {cuisine} recommendation"
            }
        raise HTTPException(status_code=500, detail="Failed to generate recommendation")
        
    except Exception as e:
        print(f"Cuisine recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_cuisines():
    """Get list of supported cuisines with facts"""
    return {
        "cuisines": SUPPORTED_CUISINES,
        "facts": CUISINE_FACTS
    }

@router.get("/recipe/{recipe_id}", response_model=Recipe)
async def get_cuisine_recipe(recipe_id: str):
    """Get full recipe details"""
    recipe = recipe_engine.get_recipe_detail(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe
