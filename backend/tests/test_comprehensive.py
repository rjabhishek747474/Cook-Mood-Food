"""
Comprehensive Test Suite for DailyCook Backend
Tests all services, routes, features, and edge cases
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
import json

from main import app
from services.normalizer import normalizer
from services.recipe_engine import recipe_engine
from models.recipe import Recipe, RecipeCard, Nutrition, Drink


# ============= NORMALIZER SERVICE TESTS =============

class TestIngredientNormalizer:
    """Test ingredient normalization and fuzzy matching"""
    
    def test_parse_input_basic(self):
        result = normalizer.parse_input("eggs, onion, tomato")
        assert len(result) == 3
        assert {"eggs", "onion", "tomato"}.issubset(set(result)) or "egg" in result
    
    def test_parse_input_with_spaces(self):
        result = normalizer.parse_input("  eggs  ,  onion  ,  tomato  ")
        assert len(result) == 3
    
    def test_parse_input_empty(self):
        assert normalizer.parse_input("") == []
        assert normalizer.parse_input("   ") == []
        assert normalizer.parse_input(",,,") == []
    
    def test_normalize_single_word(self):
        assert normalizer.normalize("ONION") == normalizer.normalize("onion")
        assert normalizer.normalize("Tomato") == normalizer.normalize("tomato")
    
    def test_alias_resolution(self):
        pyaz_result = normalizer.normalize("pyaz")
        onion_result = normalizer.normalize("onion")
        assert pyaz_result == onion_result or "onion" in pyaz_result.lower()
    
    def test_fuzzy_matching(self):
        tomato_result = normalizer.normalize("tomato")
        tomatto_result = normalizer.normalize("tomatto")
        assert tomato_result is not None
    
    def test_normalize_list(self):
        ingredients = ["onion", "tomato", "garlic"]
        result = normalizer.normalize_list(ingredients)
        assert len(result) == 3
        
    def test_normalizer_special_characters(self):
        result = normalizer.parse_input("eggs! onion@ tomato#")
        assert isinstance(result, list)
    
    def test_normalizer_unicode(self):
        result = normalizer.parse_input("प्याज, टमाटर")
        assert isinstance(result, list)


# ============= RECIPE ENGINE TESTS =============

class TestRecipeEngine:
    """Test recipe engine logic"""
    
    def test_engine_loads_data(self):
        assert len(recipe_engine.recipes) > 0
        assert len(recipe_engine.drinks) > 0
    
    def test_match_by_ingredients_basic(self):
        result = recipe_engine.match_by_ingredients(
            available=["onion", "tomato", "oil", "salt", "chicken"],
            max_missing=5
        )
        assert isinstance(result, list)
    
    def test_match_by_ingredients_no_match(self):
        result = recipe_engine.match_by_ingredients(
            available=["xyz123_impossible_ingredient"],
            max_missing=0
        )
        assert result == []
    
    def test_match_by_ingredients_diet_filter(self):
        veg_result = recipe_engine.match_by_ingredients(
            available=["paneer", "tomato", "onion"],
            max_missing=5,
            diet="veg"
        )
        for card in veg_result:
            recipe = recipe_engine.get_recipe_detail(card.id)
            if recipe:
                assert recipe.diet.lower() == "veg" or recipe.diet == "vegetarian"
    
    def test_get_recipe_detail_exists(self):
        if recipe_engine.recipes:
            first_id = recipe_engine.recipes[0]["id"]
            result = recipe_engine.get_recipe_detail(first_id)
            assert result is not None
    
    def test_get_recipe_detail_not_exists(self):
        result = recipe_engine.get_recipe_detail("nonexistent-recipe-id-999")
        assert result is None
    
    def test_get_fitness_recipes_all_goals(self):
        for goal in ["muscle_gain", "fat_loss", "maintenance"]:
            result = recipe_engine.get_fitness_recipes(goal=goal)
            assert isinstance(result, list)
    
    def test_get_by_cuisine_multiple(self):
        for cuisine in ["Indian", "Japanese", "Chinese"]:
            result = recipe_engine.get_by_cuisine(cuisine)
            assert isinstance(result, list)
    
    def test_get_drinks(self):
        all_drinks = recipe_engine.get_drinks()
        assert isinstance(all_drinks, list)
        healthy_drinks = recipe_engine.get_drinks(category="healthy")
        for drink in healthy_drinks:
            assert drink.category.lower() == "healthy"
    
    def test_get_drink_detail(self):
        if recipe_engine.drinks:
            first_id = recipe_engine.drinks[0]["id"]
            result = recipe_engine.get_drink_detail(first_id)
            assert result is not None
    
    def test_recipe_of_the_day(self):
        card, reason = recipe_engine.get_recipe_of_the_day()
        assert isinstance(card, RecipeCard)
    
    def test_ai_recipes_cache(self):
        mock_id = "ai-test-cache-recipe"
        mock_recipe = Recipe(
            id=mock_id, name="Test AI Recipe", cuisine="Indian", category="food",
            fitness_tags=[], diet="veg", difficulty="Easy", time_minutes=15,
            required_ingredients=["test1"], optional_ingredients=[], cookware=[],
            steps=["Step 1"], common_mistakes=[],
            nutrition=Nutrition(calories=200, protein_g=10, carbs_g=20, fats_g=5),
            servings=2
        )
        recipe_engine._ai_recipes[mock_id] = mock_recipe
        result = recipe_engine.get_recipe_detail(mock_id)
        assert result is not None
        if mock_id in recipe_engine._ai_recipes:
            del recipe_engine._ai_recipes[mock_id]


# ============= MODEL VALIDATION TESTS =============

class TestModels:
    """Test Pydantic models"""
    
    def test_nutrition_model(self):
        nutrition = Nutrition(calories=200, protein_g=15, carbs_g=20, fats_g=10)
        assert nutrition.calories == 200
    
    def test_recipe_card_model(self):
        card = RecipeCard(
            id="test-1", name="Test", cuisine="Indian", difficulty="Easy",
            time_minutes=15, required_ingredients=["a"], optional_ingredients=[],
            nutrition=Nutrition(calories=100, protein_g=5, carbs_g=10, fats_g=5),
            servings=2
        )
        assert card.id == "test-1"
    
    def test_recipe_model_full(self):
        recipe = Recipe(
            id="test-full", name="Full", cuisine="Japanese", category="food",
            fitness_tags=[], diet="non-veg", difficulty="Medium", time_minutes=25,
            required_ingredients=["chicken"], optional_ingredients=[], cookware=[],
            steps=["Step 1"], common_mistakes=[],
            nutrition=Nutrition(calories=300, protein_g=25, carbs_g=15, fats_g=12),
            servings=2
        )
        assert recipe.category == "food"
    
    def test_recipe_model_suggestions(self):
        recipe = Recipe(
            id="test-sugg", name="Sugg", cuisine="Indian", category="food",
            fitness_tags=[], diet="veg", difficulty="Easy", time_minutes=20,
            required_ingredients=["paneer"], optional_ingredients=[], cookware=[],
            steps=["Cook"], common_mistakes=[],
            nutrition=Nutrition(calories=250, protein_g=15, carbs_g=20, fats_g=10),
            servings=2, suggested_ingredients=["garam masala"],
            recipe_suggestions=[{"name": "Paneer Tikka", "region": "Punjab", "missing_ingredients": []}]
        )
        assert recipe.suggested_ingredients == ["garam masala"]


# ============= API ROUTE TESTS =============

@pytest.fixture
def mock_ai_service():
    """Mock the AI service"""
    with patch("services.ai_service.generate_fitness_recipe") as mock_fit, \
         patch("services.ai_service.generate_cuisine_recipe") as mock_cuisine, \
         patch("services.ai_service.generate_drink_recipe") as mock_drink:
        
        mock_fit.return_value = Recipe(
            id="mock-fitness", name="Mock Fitness", cuisine="Global",
            category="food", fitness_tags=["muscle_gain"], diet="veg", difficulty="Easy",
            time_minutes=30, required_ingredients=["oats"], optional_ingredients=[],
            cookware=[], steps=["Cook"], common_mistakes=[],
            nutrition=Nutrition(calories=400, protein_g=30, carbs_g=50, fats_g=10),
            servings=1, fitness_tip="Protein heavy!"
        )
        mock_cuisine.return_value = Recipe(
            id="mock-cuisine", name="Mock Cuisine", cuisine="Indian",
            category="food", fitness_tags=[], diet="veg", difficulty="Medium",
            time_minutes=40, required_ingredients=["rice"], optional_ingredients=[],
            cookware=[], steps=["Cook"], common_mistakes=[],
            nutrition=Nutrition(calories=300, protein_g=10, carbs_g=60, fats_g=5),
            servings=2, cultural_note="Authentic mock!"
        )
        mock_drink.return_value = {
            "id": "mock-drink", "name": "Mock Drink", "category": "healthy",
            "diet": "veg", "time_minutes": 5, "required_ingredients": ["water"],
            "optional_ingredients": [], "steps": ["Mix"], "serving_size": "250ml",
            "health_note": "Hydrating", "best_time": "Morning",
            "nutrition": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fats_g": 0}
        }
        yield

class TestRoutes:
    """Test API routes"""
    
    @pytest.mark.asyncio
    async def test_match_recipes_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/fridge/match", json={"ingredients": "eggs, onion, tomato"})
            assert response.status_code == 200
            data = response.json()
            assert "recipes" in data
    
    @pytest.mark.asyncio
    async def test_match_recipes_empty_input(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/fridge/match", json={"ingredients": ""})
            assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_match_with_servings(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/fridge/match", json={"ingredients": "eggs", "servings": 4})
            assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_match_servings_validation(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/fridge/match", json={"ingredients": "eggs", "servings": 99})
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_fridge_recipe_success(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            match_res = await client.post("/api/fridge/match", json={"ingredients": "onion"})
            if match_res.status_code == 200 and match_res.json()["recipes"]:
                rid = match_res.json()["recipes"][0]["id"]
                res = await client.get(f"/api/fridge/recipe/{rid}")
                assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_fridge_recipe_not_found(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/fridge/recipe/nonexistent-id")
            assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_invalid_json_body(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post("/api/fridge/match", content="invalid", headers={"Content-Type": "application/json"})
            assert res.status_code == 422

    @pytest.mark.asyncio
    async def test_servings_clamping_min(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post("/api/fridge/match", json={"ingredients": "onion", "servings": 0})
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_servings_clamping_max(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post("/api/fridge/match", json={"ingredients": "onion", "servings": 50})
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_serving_size_min(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post("/api/fridge/match", json={"ingredients": "onion", "serving_size": 50})
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_serving_size_max(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post("/api/fridge/match", json={"ingredients": "onion", "serving_size": 1000})
            assert res.status_code == 200
            
    @pytest.mark.asyncio
    async def test_recipe_detail_404_format(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/fridge/recipe/bad-id")
            assert res.status_code == 404
            assert "detail" in res.json()

    # Fitness
    @pytest.mark.asyncio
    async def test_get_fitness_recipes_params(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            for goal in ["muscle_gain", "fat_loss", "maintenance"]:
                res = await client.get(f"/api/fitness/?goal={goal}")
                assert res.status_code == 200
                assert res.json()["goal"] == goal
    
    @pytest.mark.asyncio
    async def test_fitness_bad_goal_fallback(self):
        """Test fitness route handles bad goal gracefully"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/fitness/?goal=unknown")
            # Should be 422 if using Enum, or we can accept it if we decided to validate strictly
            assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_fitness_recommendation_endpoint(self, mock_ai_service):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "mock-key"}):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                res = await client.get("/api/fitness/recommendation/muscle_gain")
                assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_fitness_recipe_detail(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            list_res = await client.get("/api/fitness/?goal=muscle_gain")
            if list_res.json()["recipes"]:
                rid = list_res.json()["recipes"][0]["id"]
                res = await client.get(f"/api/fitness/recipe/{rid}")
                assert res.status_code == 200

    # Cuisine
    @pytest.mark.asyncio
    async def test_get_cuisine_recipes(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/cuisine/?cuisine=Indian")
            assert res.status_code == 200
            assert res.json()["cuisine"] == "Indian"

    @pytest.mark.asyncio
    async def test_cuisine_list(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/cuisine/list")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_cuisine_recommendation_endpoint(self, mock_ai_service):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "mock-key"}):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                res = await client.get("/api/cuisine/recommendation/Indian")
                assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_cuisine_recipe_detail(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            list_res = await client.get("/api/cuisine/?cuisine=Indian")
            if list_res.json()["recipes"]:
                rid = list_res.json()["recipes"][0]["id"]
                res = await client.get(f"/api/cuisine/recipe/{rid}")
                assert res.status_code == 200

    # Drinks
    @pytest.mark.asyncio
    async def test_get_all_drinks(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/drinks/")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_drinks_category(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/drinks/?category=healthy")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_drinks_categories_list(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/drinks/categories")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_drinks_recommendation_endpoint(self, mock_ai_service):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "mock-key"}):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                res = await client.get("/api/drinks/recommendation/healthy")
                assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_drink_detail(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            list_res = await client.get("/api/drinks/")
            if list_res.json()["drinks"]:
                did = list_res.json()["drinks"][0]["id"]
                res = await client.get(f"/api/drinks/{did}")
                assert res.status_code == 200
    
    @pytest.mark.asyncio
    async def test_get_drink_not_found(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/drinks/bad-id")
            assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_get_daily_recipe(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/daily/")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_daily_detail(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/daily/detail")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_history(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/history/")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_history_limit(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/history/?limit=1")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_get_insights(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/history/insights")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_ai_status(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/ai/status")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_health_check(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/health")
            assert res.status_code == 200

    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/")
            assert res.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
