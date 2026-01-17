"""
User and UserProfile models for authentication and personalization
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, date
from enum import Enum
import json


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    HIGH = "high"


class GoalType(str, Enum):
    FAT_LOSS = "fat_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"


class User(SQLModel, table=True):
    """User account model"""
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    is_admin: bool = Field(default=False)  # Admin flag
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    profile: Optional["UserProfile"] = Relationship(back_populates="user")


class UserProfile(SQLModel, table=True):
    """User profile with health and nutrition preferences"""
    __tablename__ = "user_profiles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    
    # Personal info
    name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    
    # Physical stats
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = Field(default="moderate")
    
    # Goals (stored as JSON)
    target_goal: Optional[str] = None  # JSON: {type, daily_calories, protein_g, carbs_g, fats_g}
    
    # Preferences
    timezone: str = Field(default="UTC")
    dietary_preferences: Optional[str] = None  # JSON: ["veg", "gluten-free", etc.]
    allergies: Optional[str] = None  # JSON list
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: Optional[User] = Relationship(back_populates="profile")
    
    def get_target_goal(self) -> dict:
        """Parse target goal JSON"""
        if self.target_goal:
            return json.loads(self.target_goal)
        return {}
    
    def set_target_goal(self, goal: dict):
        """Set target goal as JSON"""
        self.target_goal = json.dumps(goal)
    
    def get_dietary_preferences(self) -> list:
        """Parse dietary preferences"""
        if self.dietary_preferences:
            return json.loads(self.dietary_preferences)
        return []
    
    def get_allergies(self) -> list:
        """Parse allergies"""
        if self.allergies:
            return json.loads(self.allergies)
        return []


# Response models
class UserCreate(SQLModel):
    """Schema for user registration"""
    email: str
    password: str
    name: Optional[str] = None


class UserLogin(SQLModel):
    """Schema for user login"""
    email: str
    password: str


class UserResponse(SQLModel):
    """Schema for user response (no password)"""
    id: int
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserProfileUpdate(SQLModel):
    """Schema for updating user profile"""
    name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    timezone: Optional[str] = None
    dietary_preferences: Optional[list[str]] = None
    allergies: Optional[list[str]] = None


class UserProfileResponse(SQLModel):
    """Schema for profile response"""
    id: int
    user_id: int
    name: Optional[str]
    dob: Optional[date]
    gender: Optional[str]
    height_cm: Optional[int]
    weight_kg: Optional[float]
    activity_level: Optional[str]
    timezone: str
    dietary_preferences: Optional[list[str]]
    allergies: Optional[list[str]]
    target_goal: Optional[dict]


class TokenResponse(SQLModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
