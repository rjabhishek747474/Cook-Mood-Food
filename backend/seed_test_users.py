"""
Seed test users for development and testing
Run with: python seed_test_users.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import select
from database import create_db_and_tables, engine, async_session
from models.user import User, UserProfile

async def seed_test_users():
    """Create test users in the database"""
    await create_db_and_tables()
    
    async with async_session() as session:
        # Test User 1 - Regular User
        test_user1_email = "testuser1@dailycook.app"
        result = await session.execute(select(User).where(User.email == test_user1_email))
        existing_user1 = result.scalar_one_or_none()
        
        if not existing_user1:
            user1 = User(
                email=test_user1_email,
                hashed_password="CLERK_AUTH_NO_PASSWORD",  # Clerk handles auth
                is_active=True,
                is_verified=True,
                is_admin=False
            )
            session.add(user1)
            await session.commit()
            await session.refresh(user1)
            
            # Create profile
            profile1 = UserProfile(
                user_id=user1.id,
                name="Test User One",
                height_cm=175,
                weight_kg=70.0,
                activity_level="moderate"
            )
            session.add(profile1)
            await session.commit()
            print(f"✓ Created test user: {test_user1_email}")
        else:
            print(f"→ Test user already exists: {test_user1_email}")
        
        # Test User 2 - Admin User
        test_user2_email = "admin@dailycook.app"
        result = await session.execute(select(User).where(User.email == test_user2_email))
        existing_user2 = result.scalar_one_or_none()
        
        if not existing_user2:
            user2 = User(
                email=test_user2_email,
                hashed_password="CLERK_AUTH_NO_PASSWORD",  # Clerk handles auth
                is_active=True,
                is_verified=True,
                is_admin=True  # Admin user
            )
            session.add(user2)
            await session.commit()
            await session.refresh(user2)
            
            # Create profile
            profile2 = UserProfile(
                user_id=user2.id,
                name="Admin User",
                height_cm=180,
                weight_kg=75.0,
                activity_level="high"
            )
            session.add(profile2)
            await session.commit()
            print(f"✓ Created admin user: {test_user2_email}")
        else:
            print(f"→ Admin user already exists: {test_user2_email}")
        
        print("\n" + "="*50)
        print("TEST CREDENTIALS FOR TESTING")
        print("="*50)
        print("\nIMPORTANT: Since the app uses Clerk for authentication,")
        print("you need to enable Email/Password auth in Clerk Dashboard")
        print("OR sign in with Google accounts that match these emails.\n")
        print("-"*50)
        print("TEST USER 1 (Regular User):")
        print(f"  Email: testuser1@dailycook.app")
        print(f"  Role: Regular User")
        print("-"*50)
        print("TEST USER 2 (Admin User):")
        print(f"  Email: admin@dailycook.app")
        print(f"  Role: Admin")
        print("="*50)

if __name__ == "__main__":
    asyncio.run(seed_test_users())
