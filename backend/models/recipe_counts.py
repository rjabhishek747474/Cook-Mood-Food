"""
Recipe Counts Model
Track how many users made/loved each recipe
"""
from sqlmodel import SQLModel, Field
from datetime import datetime


class RecipeCounts(SQLModel, table=True):
    """Track made and loved counts per recipe"""
    __tablename__ = "recipe_counts"
    
    recipe_id: str = Field(primary_key=True, max_length=100)
    made_count: int = Field(default=0)
    loved_count: int = Field(default=0)
    last_made: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
