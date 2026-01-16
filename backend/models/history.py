"""
History model for storing cooked recipes
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import json

class CookingHistory(SQLModel, table=True):
    """Database model for cooking history"""
    __tablename__ = "cooking_history"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    recipe_id: str
    recipe_name: str
    date_cooked: datetime = Field(default_factory=datetime.utcnow)
    ingredients_used: str  # JSON string of ingredients
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int
    
    def get_ingredients_list(self) -> list[str]:
        """Parse ingredients JSON"""
        return json.loads(self.ingredients_used)
    
    def set_ingredients_list(self, ingredients: list[str]):
        """Set ingredients as JSON"""
        self.ingredients_used = json.dumps(ingredients)

class HistoryEntry(SQLModel):
    """Response model for history entries"""
    id: int
    recipe_id: str
    recipe_name: str
    date_cooked: datetime
    ingredients_used: list[str]
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int

class InsightData(SQLModel):
    """Nutrition insights from history"""
    total_recipes: int
    avg_calories: float
    avg_protein: float
    avg_carbs: float
    avg_fats: float
    top_ingredients: list[tuple[str, int]]
    patterns: list[str]
