"""
Fridge Recipes API Routes
Generate unique recipes based on available ingredients using AI
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import random

from services.recipe_engine import recipe_engine
from services.normalizer import normalizer
from models.recipe import RecipeCard, Recipe

router = APIRouter()

class FridgeRequest(BaseModel):
    """Request body for fridge recipe generation"""
    ingredients: str  # Comma-separated ingredients
    diet: Optional[str] = None  # veg, egg, non-veg
    cuisine: Optional[str] = None  # Indian, Japanese, Chinese, etc.
    servings: Optional[int] = 2  # Number of people (1-10)
    serving_size: Optional[int] = 200  # Grams per serving (100-500)

class RecipeSuggestion(BaseModel):
    """A suggested recipe the user could make with more ingredients"""
    name: str
    region: str
    missing_ingredients: list[str]

class FridgeResponse(BaseModel):
    """Response for fridge recipe generation"""
    normalized_ingredients: list[str]
    recipes: list[RecipeCard]
    message: str
    ai_generated: bool = False
    suggested_ingredients: list[str] = []  # 3-6 suggested additions
    recipe_suggestions: list[RecipeSuggestion] = []  # 2 popular recipes

@router.post("/match", response_model=FridgeResponse)
async def create_recipes(request: FridgeRequest):
    """
    CREATE unique recipes based on available ingredients - ALWAYS returns a recipe.
    
    Algorithm:
    1. Always use AI to generate a recipe (never returns empty)
    2. Adjusts ingredient quantities based on servings (1-10 people)
    3. Suggests 3-6 ingredients to enhance the recipe
    4. Suggests 2 popular recipes with missing ingredients
    """
    # Parse and normalize ingredients
    normalized = normalizer.parse_input(request.ingredients)
    
    if not normalized:
        raise HTTPException(
            status_code=400, 
            detail="Please enter at least one ingredient"
        )
    
    # Validate servings
    servings = max(1, min(10, request.servings or 2))
    serving_size = max(100, min(500, request.serving_size or 200))
    
    # ALWAYS try AI generation - never return empty
    if os.getenv("GEMINI_API_KEY"):
        try:
            from services.ai_service import generate_recipe_with_ai
            
            # Random cuisine styles for variety if not specified
            cuisines = ["Indian", "Chinese", "Italian", "Japanese", "Mexican", "Thai"]
            selected_cuisine = request.cuisine or random.choice(cuisines)
            
            print(f"AI Creation: Generating recipe for {servings} people, {serving_size}g/serving")
            
            ai_recipe = await generate_recipe_with_ai(
                ingredients=normalized,
                diet=request.diet,
                cuisine=selected_cuisine,
                servings=servings,
                serving_size=serving_size
            )
            
            using_backup = False
            
            # If AI fails (returns None), use backup generator
            if not ai_recipe:
                print("AI generation failed/returned None. Using backup generator.")
                from services.backup_generator import generate_backup_recipe
                ai_recipe = generate_backup_recipe(
                    ingredients=normalized,
                    diet=request.diet,
                    servings=servings,
                    serving_size=serving_size
                )
                using_backup = True
            
            if ai_recipe:
                print(f"Creation successful: {ai_recipe.name} (Backup: {using_backup})")
                
                # Convert to RecipeCard
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
                
                # Store AI recipe in engine cache for later retrieval
                recipe_engine._ai_recipes[ai_recipe.id] = ai_recipe
                
                # Extract suggestions
                suggested_ingredients = getattr(ai_recipe, 'suggested_ingredients', []) or []
                recipe_suggestions_raw = getattr(ai_recipe, 'recipe_suggestions', []) or []
                
                # Convert raw suggestions to RecipeSuggestion objects
                recipe_suggestions = []
                for sug in recipe_suggestions_raw[:2]:
                    if isinstance(sug, dict):
                        recipe_suggestions.append(RecipeSuggestion(
                            name=sug.get('name', 'Unknown Recipe'),
                            region=sug.get('region', 'Global'),
                            missing_ingredients=sug.get('missing_ingredients', [])
                        ))
                
                # Also get similar database recipes as suggestions
                db_recipes = recipe_engine.match_by_ingredients(
                    available=normalized,
                    max_missing=2,
                    diet=request.diet
                )[:2]
                
                all_recipes = [ai_card] + db_recipes
                
                msg_prefix = "✨ Created" if not using_backup else "Created"
                msg_suffix = "" if not using_backup else " (AI unavailable, using backup)"
                
                return FridgeResponse(
                    normalized_ingredients=normalized,
                    recipes=all_recipes,
                    message=f"{msg_prefix} '{ai_recipe.name}' for {servings} people{msg_suffix}",
                    ai_generated=not using_backup,
                    suggested_ingredients=suggested_ingredients[:6],
                    recipe_suggestions=recipe_suggestions
                )
                
        except Exception as e:
            print(f"AI/Backup creation failed: {e}")
            import traceback
            traceback.print_exc()

    # Fallback: Search database (last resort)
    recipes = recipe_engine.match_by_ingredients(
        available=normalized,
        max_missing=2,
        diet=request.diet
    )
    
    # Even without AI, suggest some common ingredients
    common_suggestions = [
        "onion - base for most dishes",
        "garlic - adds depth of flavor", 
        "tomato - natural sweetness and tang",
        "ginger - warming spice",
        "green chili - adds heat",
        "coriander leaves - fresh garnish"
    ]
    
    return FridgeResponse(
        normalized_ingredients=normalized,
        recipes=recipes,
        message=f"Found {len(recipes)} recipe(s) - enable AI for unique creations!",
        ai_generated=False,
        suggested_ingredients=common_suggestions[:4],
        recipe_suggestions=[]
    )

@router.get("/recipe/{recipe_id}", response_model=Recipe)
async def get_recipe(recipe_id: str):
    """Get full recipe details by ID"""
    recipe = recipe_engine.get_recipe_detail(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe
