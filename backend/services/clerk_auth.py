"""
Clerk Authentication Service (Server-side)
Helper to verify JWT tokens from Clerk against JWKS
"""
import httpx
import jwt
from jwt.algorithms import RSAAlgorithm
import json
import os
from fastapi import HTTPException, status
import base64

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "sk_test_PLACEHOLDER")
# Clerk Frontend API URL (usually inferred, but we fetch JWKS from it)
# https://<your-clerk-domain>/.well-known/jwks.json
# For simplicity, we assume generic or require env var
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL") 
# If not provided, we might need to derive it from Client or Publishable Key?
# Actually, the Issuer in the token is what we need to validate.

async def verify_clerk_token(token: str):
    """
    Verify Clerk JWT Token.
    1. Decode header to get kid.
    2. Fetch JWKS from issuer (or cached).
    3. Verify signature.
    """
    try:
        # 1. Peek header to get 'kid' and 'iss'
        header = jwt.get_unverified_header(token)
        payload = jwt.decode(token, options={"verify_signature": False})
        
        issuer = payload.get("iss")
        if not issuer:
             raise HTTPException(status_code=401, detail="Invalid token: no issuer")
        
        # 2. Fetch JWKS (Cache this in production!)
        jwks_url = f"{issuer}/.well-known/jwks.json"
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url)
            resp.raise_for_status()
            jwks = resp.json()
        
        # 3. Find matching key
        public_key = None
        for key in jwks["keys"]:
            if key["kid"] == header["kid"]:
                public_key = RSAAlgorithm.from_jwk(json.dumps(key))
                break
        
        if not public_key:
            raise HTTPException(status_code=401, detail="Invalid token: key not found")
        
        # 4. Verify
        decoded = jwt.decode(token, public_key, algorithms=["RS256"], audience=None, issuer=issuer)
        return decoded

    except Exception as e:
        print(f"Token Verification Failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

from models.user import User, UserProfile
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import datetime

async def get_user_from_clerk_token(session: AsyncSession, payload: dict) -> User:
    """
    Get or Create User based on Clerk Token.
    """
    # Clerk payload usually has 'email' or 'emails' ?
    # Standard claims might not include email unless requested?
    # Usually we get user_id ('sub').
    # But to sync with local DB, we need email (if we use email as key).
    
    clerk_id = payload.get("sub")
    email = payload.get("email") # check if present
    
    # Check your Clerk JWT Template! verify it includes email!
    # For now, if email missing, we can't sync properly unless we store clerk_id.
    
    # Ideally User model has 'clerk_id'. 
    # Current User model: id, email, hashed_password, ...
    
    if not email:
        # Fallback: try to find user by some other means or fail
        # For this demo, assume email is in token (config Clerk to include it)
        # OR fetch from Clerk API using clerk_id (requires secret key)
        pass 
        
    # Find by email
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    if user:
        return user
        
    # Create User
    # Password not needed. set random/null?
    # User model requires hashed_password? Check model.
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
    profile = UserProfile(
        user_id=user.id,
        name=email.split("@")[0]
    )
    session.add(profile)
    await session.commit()
    
    return user
