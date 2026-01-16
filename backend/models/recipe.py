"""
Recipe and related Pydantic models
"""
from pydantic import BaseModel
from typing import Optional

class Nutrition(BaseModel):
    """Nutrition information for a recipe"""
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int

class Recipe(BaseModel):
    """Recipe model for API responses"""
    id: str
    name: str
    cuisine: str
    category: str
    fitness_tags: list[str]
    diet: str
    difficulty: str
    time_minutes: int
    required_ingredients: list[str]
    optional_ingredients: list[str]
    cookware: list[str]
    steps: list[str]
    common_mistakes: list[str]
    nutrition: Nutrition
    servings: int
    cooking_impact: Optional[str] = None
    suggested_ingredients: Optional[list[str]] = None  # AI suggestions
    recipe_suggestions: Optional[list[dict]] = None  # Popular recipes to try

class RecipeCard(BaseModel):
    """Simplified recipe for list views"""
    id: str
    name: str
    cuisine: str
    difficulty: str
    time_minutes: int
    required_ingredients: list[str]
    optional_ingredients: list[str]
    nutrition: Nutrition
    servings: int

class Drink(BaseModel):
    """Drink recipe model"""
    id: str
    name: str
    category: str
    diet: str
    time_minutes: int
    required_ingredients: list[str]
    optional_ingredients: list[str]
    steps: list[str]
    serving_size: str
    health_note: Optional[str]
    nutrition: Nutrition
