"""
Drinks Section API Routes
Get drink recipes by category with AI recommendations
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import os

from services.recipe_engine import recipe_engine
from models.recipe import Drink

router = APIRouter()

DRINK_CATEGORIES = ["healthy", "energy", "protein", "detox", "refreshing", "traditional"]

CATEGORY_DESCRIPTIONS = {
    "healthy": "Nutrient-rich smoothies and wellness drinks",
    "energy": "Natural energy boosters for pre/post workout",
    "protein": "High-protein shakes for muscle recovery",
    "detox": "Cleansing drinks for digestion and hydration",
    "refreshing": "Cool, hydrating drinks for hot days",
    "traditional": "Classic Indian beverages - lassi, chaas, nimbu pani"
}

class DrinksResponse(BaseModel):
    """Response for drinks list"""
    category: Optional[str]
    drinks: list[Drink]
    categories: list[str] = DRINK_CATEGORIES
    ai_recommendation: Optional[dict] = None
    category_description: Optional[str] = None

@router.get("/", response_model=DrinksResponse)
async def get_drinks(
    category: Optional[str] = None,
    include_ai: bool = True
):
    """
    Get drink recipes with AI recommendation of the day.
    
    Categories:
    - healthy: Smoothies, nutrient-rich beverages
    - energy: Natural energy boosters
    - protein: High-protein shakes
    - detox: Cleansing drinks
    - refreshing: Cool, hydrating drinks
    - traditional: Classic Indian beverages
    """
    # Validate category
    if category and category not in DRINK_CATEGORIES:
        category = None
    
    # Get database drinks
    drinks = recipe_engine.get_drinks(category=category)
    
    ai_recommendation = None
    
    # Generate AI recommendation if enabled
    if include_ai and os.getenv("GEMINI_API_KEY"):
        try:
            from services.ai_service import generate_drink_recipe
            
            ai_drink = await generate_drink_recipe(
                category=category or "healthy",
                diet="veg"
            )
            
            if ai_drink:
                ai_recommendation = {
                    "drink": ai_drink,
                    "best_time": ai_drink.get('best_time', 'Anytime'),
                    "health_note": ai_drink.get('health_note', 'Stay hydrated!'),
                    "variations": ai_drink.get('variations', [])
                }
                
        except Exception as e:
            print(f"Drinks AI recommendation failed: {e}")
    
    return DrinksResponse(
        category=category,
        drinks=drinks,
        ai_recommendation=ai_recommendation,
        category_description=CATEGORY_DESCRIPTIONS.get(category) if category else None
    )

@router.get("/recommendation/{category}")
async def get_drink_recommendation(
    category: str,
    goal: Optional[str] = None
):
    """Get AI-generated drink recommendation of the day."""
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="AI features not available")
    
    if category not in DRINK_CATEGORIES:
        category = "healthy"
    
    try:
        from services.ai_service import generate_drink_recipe
        
        drink = await generate_drink_recipe(category=category, goal=goal)
        if drink:
            return {
                "category": category,
                "drink": drink,
                "best_time": drink.get('best_time', 'Anytime'),
                "health_note": drink.get('health_note'),
                "message": f"Today's {category} drink recommendation"
            }
        raise HTTPException(status_code=500, detail="Failed to generate recommendation")
        
    except Exception as e:
        print(f"Drink recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
async def list_categories():
    """Get list of drink categories with descriptions"""
    return {
        "categories": DRINK_CATEGORIES,
        "descriptions": CATEGORY_DESCRIPTIONS
    }

@router.get("/{drink_id}", response_model=Drink)
async def get_drink(drink_id: str):
    """Get full drink details"""
    drink = recipe_engine.get_drink_detail(drink_id)
    if not drink:
        raise HTTPException(status_code=404, detail="Drink not found")
    return drink
