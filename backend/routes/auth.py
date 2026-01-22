"""
Authentication routes using Clerk
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import os

from database import get_session
from models.user import User, UserProfile, UserCreate, UserProfileResponse, UserProfileUpdate
from services.clerk_auth import verify_clerk_token

router = APIRouter()

async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session)
) -> User:
    """
    Dependency to get current user from Clerk Token
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer Token")
    
    token = auth_header.split(" ")[1]
    
    # 1. Verify Token with Clerk
    try:
        claims = await verify_clerk_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
        
    # 2. Sync User with local DB
    # Clerk 'sub' is the User ID
    clerk_id = claims.get("sub")
    email = claims.get("email") # Note: might need to parse emails claim if complex
    
    # Fallback if email not in top level claims (Clerk implementation varies)
    # Usually we get user info from Clerk API if needed, but for MVP trust token
    
    # Check if user exists by Clerk ID (or Email as fallback)
    # Ideally add clerk_id to User model. For now, we reuse 'email' if available.
    
    if not email:
        # Try to find email in other claims or error
        # Assuming MVP setup for now
        pass 

    # Find user
    statement = select(User).where(User.email == email) # Using email for now
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    if not user:
        # Create new user
        user = User(
            email=email,
            hashed_password="CLERK_AUTH_NO_PASSWORD",
            is_active=True,
            is_verified=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # Create Profile
        profile = UserProfile(user_id=user.id, name="New User")
        session.add(profile)
        await session.commit()
        
    return user

@router.get("/me", response_model=UserProfileResponse)
async def get_current_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Get current user's profile"""
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
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
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Update current user's profile"""
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
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
