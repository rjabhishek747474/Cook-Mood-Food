"""
Goal model for user nutrition/fitness goals
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum
import json


class GoalKind(str, Enum):
    CALORIE = "calorie"
    PROTEIN = "protein"
    CARBS = "carbs"
    FATS = "fats"
    WEIGHT = "weight"


class Goal(SQLModel, table=True):
    """Database model for user goals"""
    __tablename__ = "goals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    kind: str  # calorie, protein, carbs, fats, weight
    target_value: float  # Target value (e.g., 2000 calories, 150g protein)
    current_value: float = Field(default=0.0)  # Current progress
    
    start_date: date = Field(default_factory=lambda: date.today())
    end_date: Optional[date] = None
    
    is_active: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response models
class GoalCreate(SQLModel):
    """Schema for creating a goal"""
    kind: str
    target_value: float
    end_date: Optional[date] = None


class GoalUpdate(SQLModel):
    """Schema for updating a goal"""
    target_value: Optional[float] = None
    is_active: Optional[bool] = None
    end_date: Optional[date] = None


class GoalResponse(SQLModel):
    """Schema for goal response"""
    id: int
    user_id: int
    kind: str
    target_value: float
    current_value: float
    progress_percent: float
    start_date: date
    end_date: Optional[date]
    is_active: bool


class GoalProgress(SQLModel):
    """Schema for goal progress summary"""
    goals: list[GoalResponse]
    daily_calories: int
    daily_protein: float
    daily_carbs: float
    daily_fats: float
