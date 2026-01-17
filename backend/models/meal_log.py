"""
MealLog model for tracking daily food intake
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import json


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class MealLog(SQLModel, table=True):
    """Database model for meal logging"""
    __tablename__ = "meal_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    logged_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    meal_type: str = Field(default="snack")  # breakfast, lunch, dinner, snack
    
    # Items logged (JSON array of {food_item, grams, calories, protein_g, carbs_g, fats_g})
    items: str = Field(default="[]")
    
    # Totals (computed from items)
    calories_total: int = Field(default=0)
    protein_total: float = Field(default=0.0)
    carbs_total: float = Field(default=0.0)
    fats_total: float = Field(default=0.0)
    
    # Optional metadata
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def get_items(self) -> list:
        """Parse items JSON"""
        return json.loads(self.items) if self.items else []
    
    def set_items(self, items_list: list):
        """Set items as JSON and compute totals"""
        self.items = json.dumps(items_list)
        # Compute totals
        self.calories_total = sum(item.get("calories", 0) for item in items_list)
        self.protein_total = sum(item.get("protein_g", 0) for item in items_list)
        self.carbs_total = sum(item.get("carbs_g", 0) for item in items_list)
        self.fats_total = sum(item.get("fats_g", 0) for item in items_list)


# Request/Response models
class MealItem(SQLModel):
    """Individual item in a meal"""
    food_name: str
    grams: Optional[float] = None
    quantity: Optional[str] = None  # e.g., "1 cup", "2 pieces"
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float


class MealLogCreate(SQLModel):
    """Schema for creating a meal log"""
    meal_type: str = "snack"
    items: list[MealItem]
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None


class MealLogResponse(SQLModel):
    """Schema for meal log response"""
    id: int
    user_id: int
    logged_at: datetime
    meal_type: str
    items: list[dict]
    calories_total: int
    protein_total: float
    carbs_total: float
    fats_total: float
    notes: Optional[str]


class DailySummary(SQLModel):
    """Daily nutrition summary"""
    date: str
    calories_total: int
    protein_total: float
    carbs_total: float
    fats_total: float
    meals_count: int
    meals: list[MealLogResponse]
