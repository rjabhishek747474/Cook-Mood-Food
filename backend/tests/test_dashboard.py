"""
Test Suite for Auth, Dashboard, Meals, Favorites, Goals, and Admin APIs
Run: python -m pytest tests/test_dashboard.py -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
import json

from main import app
from services.auth_service import get_password_hash


# ============= AUTH TESTS =============

class TestAuth:
    """Test authentication endpoints"""
    
    @pytest.mark.asyncio
    async def test_signup_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/auth/signup", json={
                "email": f"testuser_{id(self)}@test.com",
                "password": "testpass123",
                "name": "Test User"
            })
            assert response.status_code == 201
            data = response.json()
            assert "access_token" in data
            assert data["user"]["email"].startswith("testuser_")
    
    @pytest.mark.asyncio
    async def test_signup_duplicate_email(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            email = f"duplicate_{id(self)}@test.com"
            # First signup
            await client.post("/api/auth/signup", json={
                "email": email,
                "password": "testpass123"
            })
            # Second signup with same email
            response = await client.post("/api/auth/signup", json={
                "email": email,
                "password": "testpass123"
            })
            assert response.status_code == 400
            assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            email = f"logintest_{id(self)}@test.com"
            password = "testpass123"
            # Signup first
            await client.post("/api/auth/signup", json={
                "email": email,
                "password": password
            })
            # Login
            response = await client.post("/api/auth/login", data={
                "username": email,
                "password": password
            }, headers={"Content-Type": "application/x-www-form-urlencoded"})
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            email = f"wrongpass_{id(self)}@test.com"
            # Signup
            await client.post("/api/auth/signup", json={
                "email": email,
                "password": "correctpass"
            })
            # Login with wrong password
            response = await client.post("/api/auth/login", data={
                "username": email,
                "password": "wrongpass"
            }, headers={"Content-Type": "application/x-www-form-urlencoded"})
            assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_profile_authenticated(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            email = f"profile_{id(self)}@test.com"
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": email,
                "password": "testpass123",
                "name": "Profile User"
            })
            token = signup_res.json()["access_token"]
            # Get profile
            response = await client.get("/api/auth/me", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            assert response.json()["name"] == "Profile User"
    
    @pytest.mark.asyncio
    async def test_get_profile_unauthenticated(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/auth/me")
            assert response.status_code == 401


# ============= DASHBOARD TESTS =============

class TestDashboard:
    """Test dashboard endpoints"""
    
    @pytest.mark.asyncio
    async def test_dashboard_today_unauthenticated(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/dashboard/today")
            assert response.status_code == 200
            data = response.json()
            assert data["authenticated"] == False
            assert "recipe_of_day" in data
    
    @pytest.mark.asyncio
    async def test_dashboard_today_authenticated(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"dashboard_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Get dashboard
            response = await client.get("/api/dashboard/today", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            data = response.json()
            assert data["authenticated"] == True
            assert "nutrition" in data
    
    @pytest.mark.asyncio
    async def test_dashboard_trends_requires_auth(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/dashboard/trends")
            assert response.status_code == 401


# ============= MEALS TESTS =============

class TestMeals:
    """Test meal logging endpoints"""
    
    @pytest.mark.asyncio
    async def test_log_meal_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"meals_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Log meal
            response = await client.post("/api/meals/", json={
                "meal_type": "breakfast",
                "items": [
                    {"food_name": "Oatmeal", "calories": 150, "protein_g": 5, "carbs_g": 27, "fats_g": 3}
                ]
            }, headers={"Authorization": f"Bearer {token}"})
            assert response.status_code == 201
            data = response.json()
            assert data["calories_total"] == 150
    
    @pytest.mark.asyncio
    async def test_get_today_meals(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"todaymeals_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Get today's meals
            response = await client.get("/api/meals/today", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            data = response.json()
            assert "calories_total" in data
    
    @pytest.mark.asyncio
    async def test_meals_requires_auth(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/meals/", json={
                "meal_type": "breakfast",
                "items": []
            })
            assert response.status_code == 401


# ============= FAVORITES TESTS =============

class TestFavorites:
    """Test favorites endpoints"""
    
    @pytest.mark.asyncio
    async def test_add_favorite_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"favorites_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Add favorite
            response = await client.post("/api/favorites/", json={
                "recipe_id": "test-recipe-1",
                "recipe_name": "Test Recipe"
            }, headers={"Authorization": f"Bearer {token}"})
            assert response.status_code == 201
    
    @pytest.mark.asyncio
    async def test_get_favorites(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"getfavorites_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Get favorites
            response = await client.get("/api/favorites/", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_check_favorite(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"checkfav_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Check favorite (not added yet)
            response = await client.get("/api/favorites/check/some-recipe-id", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            assert response.json()["is_favorited"] == False


# ============= GOALS TESTS =============

class TestGoals:
    """Test goals endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_goal_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"goals_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Create goal
            response = await client.post("/api/goals/", json={
                "kind": "calorie",
                "target_value": 2000
            }, headers={"Authorization": f"Bearer {token}"})
            assert response.status_code == 201
            data = response.json()
            assert data["target_value"] == 2000
    
    @pytest.mark.asyncio
    async def test_get_goal_progress(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"goalprogress_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Get progress
            response = await client.get("/api/goals/progress", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            data = response.json()
            assert "goals" in data
            assert "daily_calories" in data


# ============= ADMIN TESTS =============

class TestAdmin:
    """Test admin endpoints"""
    
    @pytest.mark.asyncio
    async def test_admin_stats_requires_admin(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup regular user
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"regularuser_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Try to access admin
            response = await client.get("/api/admin/stats", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_admin_users_requires_admin(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Signup regular user
            signup_res = await client.post("/api/auth/signup", json={
                "email": f"regularuser2_{id(self)}@test.com",
                "password": "testpass123"
            })
            token = signup_res.json()["access_token"]
            # Try to list users
            response = await client.get("/api/admin/users", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
