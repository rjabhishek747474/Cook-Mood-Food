"""
Authentication service using Clerk and PyJWT
"""
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import os

from database import get_session
from models.user import User
from services.clerk_auth import verify_clerk_token, get_user_from_clerk_token

# Use HTTPBearer for standard Bearer token extraction
security = HTTPBearer(auto_error=False)

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> Optional[User]:
    """Get current user from Clerk token"""
    if not auth:
        return None
    
    token = auth.credentials
    try:
        # Verify with Clerk
        payload = await verify_clerk_token(token)
        # Get user from DB (sync or create)
        user = await get_user_from_clerk_token(session, payload)
        return user
    except Exception:
        return None

async def get_current_user_required(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    """Get current user or raise 401"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not auth:
        raise credentials_exception
        
    token = auth.credentials
    try:
        # Verify with Clerk
        payload = await verify_clerk_token(token)
        # Get user from DB
        user = await get_user_from_clerk_token(session, payload)
        if not user:
            raise credentials_exception
        return user
    except Exception as e:
        print(f"Auth error: {e}")
        raise credentials_exception

# Deprecated functions from old implementation
# Kept as stubs if needed, or removed if mostly unused.
# create_access_token was used in auth.py (refactored).
# get_password_hash / authenticate_user were used in auth.py.

def get_password_hash(password: str) -> str:
    raise NotImplementedError("Passwords managed by Clerk")

async def authenticate_user(session, email, password):
    raise NotImplementedError("Authentication managed by Clerk")
