"""
Favorite model for saving favorite recipes
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Favorite(SQLModel, table=True):
    """Database model for favorite recipes"""
    __tablename__ = "favorites"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    recipe_id: str = Field(index=True)
    recipe_name: str
    recipe_type: str = Field(default="recipe")  # recipe or drink
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response models
class FavoriteCreate(SQLModel):
    """Schema for adding a favorite"""
    recipe_id: str
    recipe_name: str
    recipe_type: str = "recipe"


class FavoriteResponse(SQLModel):
    """Schema for favorite response"""
    id: int
    user_id: int
    recipe_id: str
    recipe_name: str
    recipe_type: str
    created_at: datetime
