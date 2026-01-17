"""
Seed data script for creating test and admin users
Run: python -m scripts.seed_data
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, async_session, create_db_and_tables
from models.user import User, UserProfile
from services.auth_service import get_password_hash
from sqlmodel import select


# Test and Admin credentials
TEST_USERS = [
    {
        "email": "test@test.com",
        "password": "test123",
        "name": "Test User",
        "is_admin": False
    },
    {
        "email": "admin@dailycook.com",
        "password": "admin123",
        "name": "Admin User",
        "is_admin": True
    }
]


async def seed_users():
    """Create test and admin users"""
    await create_db_and_tables()
    
    async with async_session() as session:
        for user_data in TEST_USERS:
            # Check if user exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"User {user_data['email']} already exists, skipping...")
                continue
            
            # Create user
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                is_admin=user_data["is_admin"],
                is_verified=True,
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            # Create profile
            profile = UserProfile(
                user_id=user.id,
                name=user_data["name"]
            )
            session.add(profile)
            await session.commit()
            
            print(f"Created user: {user_data['email']} (admin: {user_data['is_admin']})")
    
    print("\n=== Test Credentials ===")
    print("Regular User: test@test.com / test123")
    print("Admin User: admin@dailycook.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed_users())
