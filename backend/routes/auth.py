"""
Authentication routes for user signup, login, and profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import timedelta
import json

from database import get_session
from models.user import (
    User, UserProfile, UserCreate, UserLogin, UserResponse,
    UserProfileUpdate, UserProfileResponse, TokenResponse
)
from services.auth_service import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user_required, get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    """Register a new user"""
    # Check if email already exists
    existing_user = await get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Create empty profile
    profile = UserProfile(
        user_id=user.id,
        name=user_data.name
    )
    session.add(profile)
    await session.commit()
    
    # Generate token
    access_token = create_access_token(
        data={"sub": str(user.id)},  # JWT sub must be string
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """Login with email and password"""
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},  # JWT sub must be string
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_current_profile(
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Get current user's profile"""
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        name=profile.name,
        dob=profile.dob,
        gender=profile.gender,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level,
        timezone=profile.timezone,
        dietary_preferences=profile.get_dietary_preferences(),
        allergies=profile.get_allergies(),
        target_goal=profile.get_target_goal()
    )


@router.patch("/me", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user_required),
    session: AsyncSession = Depends(get_session)
):
    """Update current user's profile"""
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "dietary_preferences" and value is not None:
            profile.dietary_preferences = json.dumps(value)
        elif field == "allergies" and value is not None:
            profile.allergies = json.dumps(value)
        else:
            setattr(profile, field, value)
    
    await session.commit()
    await session.refresh(profile)
    
    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        name=profile.name,
        dob=profile.dob,
        gender=profile.gender,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        activity_level=profile.activity_level,
        timezone=profile.timezone,
        dietary_preferences=profile.get_dietary_preferences(),
        allergies=profile.get_allergies(),
        target_goal=profile.get_target_goal()
    )
