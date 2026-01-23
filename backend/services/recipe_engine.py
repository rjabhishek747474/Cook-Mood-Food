"""
Recipe Engine Service
Core logic for matching recipes based on available ingredients
"""
import json
from pathlib import Path
from typing import Optional
from models.recipe import Recipe, RecipeCard, Drink, Nutrition
from services.normalizer import normalizer

class RecipeEngine:
    """Handles recipe matching and filtering"""
    
    def __init__(self):
        self.recipes: list[dict] = []
        self.drinks: list[dict] = []
        self._ai_recipes: dict = {}  # Cache for AI-generated recipes
        self._load_data()
    
    def _load_data(self):
        """Load recipes and drinks from JSON"""
        data_path = Path(__file__).parent.parent / "data" / "recipes_expanded.json"
        if not data_path.exists():
             data_path = Path(__file__).parent.parent / "data" / "recipes.json"
        
        try:
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.recipes = data.get("recipes", [])
                self.drinks = data.get("drinks", [])
                print(f"Loaded {len(self.recipes)} recipes and {len(self.drinks)} drinks from {data_path.name}")
        except Exception as e:
            print(f"Warning: Could not load recipes: {e}")
    
    def match_by_ingredients(
        self, 
        available: list[str], 
        max_missing: int = 2,
        diet: Optional[str] = None
    ) -> list[RecipeCard]:
        """
        Find recipes that can be made with available ingredients.
        Allows up to max_missing optional ingredients.
        """
        normalized = normalizer.normalize_list(available)
        available_set = set(normalized)
        
        matches = []
        
        for recipe in self.recipes:
            # Apply diet filter
            if diet and recipe.get("diet") != diet:
                continue
            
            required = set(normalizer.normalize_list(recipe["required_ingredients"]))
            optional = set(normalizer.normalize_list(recipe.get("optional_ingredients", [])))
            
            # Check if all required ingredients are available
            missing_required = required - available_set
            if len(missing_required) > 0:
                continue
            
            # Check optional ingredients (allow some missing)
            available_optional = optional & available_set
            
            # Create recipe card
            card = RecipeCard(
                id=recipe["id"],
                name=recipe["name"],
                cuisine=recipe["cuisine"],
                difficulty=recipe["difficulty"],
                time_minutes=recipe["time_minutes"],
                required_ingredients=recipe["required_ingredients"],
                optional_ingredients=list(available_optional) if available_optional else [],
                nutrition=Nutrition(**recipe["nutrition"]),
                servings=recipe.get("servings", 1)
            )
            
            # Score: prefer recipes that use more available ingredients
            score = len(required) + len(available_optional)
            matches.append((score, card))
        
        # Sort by score descending, return top 3
        matches.sort(key=lambda x: x[0], reverse=True)
        return [card for _, card in matches[:3]]
    
    def get_recipe_detail(self, recipe_id: str) -> Optional[Recipe]:
        """Get full recipe details by ID"""
        # Check AI-generated recipes first
        if recipe_id in self._ai_recipes:
            return self._ai_recipes[recipe_id]
        
        # Check database recipes
        for recipe in self.recipes:
            if recipe["id"] == recipe_id:
                return Recipe(**recipe)
        return None
    
    def get_fitness_recipes(
        self, 
        goal: str,
        diet: Optional[str] = None
    ) -> list[RecipeCard]:
        """
        Get recipes filtered by fitness goal.
        Goals: fat_loss, muscle_gain, maintenance
        """
        goal_tags = {
            "fat_loss": ["fat_loss", "low_fat", "low_calorie", "high_protein"],
            "muscle_gain": ["muscle_gain", "high_protein"],
            "maintenance": ["maintenance", "balanced"]
        }
        
        target_tags = goal_tags.get(goal, [])
        matches = []
        
        for recipe in self.recipes:
            # Apply diet filter
            if diet and recipe.get("diet") not in [diet, "veg"]:
                continue
            
            fitness_tags = recipe.get("fitness_tags", [])
            
            # Check for tag overlap
            if any(tag in fitness_tags for tag in target_tags) or "high_protein" in fitness_tags:
                card = RecipeCard(
                    id=recipe["id"],
                    name=recipe["name"],
                    cuisine=recipe["cuisine"],
                    difficulty=recipe["difficulty"],
                    time_minutes=recipe["time_minutes"],
                    required_ingredients=recipe["required_ingredients"],
                    optional_ingredients=recipe.get("optional_ingredients", []),
                    nutrition=Nutrition(**recipe["nutrition"]),
                    servings=recipe.get("servings", 1)
                )
                matches.append(card)
        
        return matches
    
    def get_by_cuisine(self, cuisine: str, diet: Optional[str] = None) -> list[RecipeCard]:
        """Get recipes by cuisine type"""
        matches = []
        
        for recipe in self.recipes:
            if recipe["cuisine"].lower() != cuisine.lower():
                continue
            
            # Apply diet filter
            if diet and recipe.get("diet") not in [diet, "veg"]:
                continue
            
            card = RecipeCard(
                id=recipe["id"],
                name=recipe["name"],
                cuisine=recipe["cuisine"],
                difficulty=recipe["difficulty"],
                time_minutes=recipe["time_minutes"],
                required_ingredients=recipe["required_ingredients"],
                optional_ingredients=recipe.get("optional_ingredients", []),
                nutrition=Nutrition(**recipe["nutrition"]),
                servings=recipe.get("servings", 1)
            )
            matches.append(card)
        
        return matches
    
    def get_drinks(self, category: Optional[str] = None) -> list[Drink]:
        """Get drinks, optionally filtered by category"""
        matches = []
        
        for drink in self.drinks:
            if category and drink["category"].lower() != category.lower():
                continue
            
            matches.append(Drink(
                id=drink["id"],
                name=drink["name"],
                category=drink["category"],
                diet=drink["diet"],
                time_minutes=drink["time_minutes"],
                required_ingredients=drink["required_ingredients"],
                optional_ingredients=drink.get("optional_ingredients", []),
                steps=drink["steps"],
                serving_size=drink["serving_size"],
                health_note=drink.get("health_note"),
                nutrition=Nutrition(**drink["nutrition"])
            ))
        
        return matches
    
    def get_drink_detail(self, drink_id: str) -> Optional[Drink]:
        """Get drink details by ID"""
        for drink in self.drinks:
            if drink["id"] == drink_id:
                return Drink(
                    id=drink["id"],
                    name=drink["name"],
                    category=drink["category"],
                    diet=drink["diet"],
                    time_minutes=drink["time_minutes"],
                    required_ingredients=drink["required_ingredients"],
                    optional_ingredients=drink.get("optional_ingredients", []),
                    steps=drink["steps"],
                    serving_size=drink["serving_size"],
                    health_note=drink.get("health_note"),
                    nutrition=Nutrition(**drink["nutrition"])
                )
        return None
    
    def get_recipe_of_the_day(self) -> tuple[RecipeCard, str]:
        """
        Get recipe of the day based on date.
        Returns (recipe, reason)
        """
        from datetime import date
        
        # Use date to deterministically select recipe
        today = date.today()
        day_of_year = today.timetuple().tm_yday
        
        # Filter for beginner-friendly, quick recipes
        eligible = [
            r for r in self.recipes 
            if r["time_minutes"] <= 20 
            and r["difficulty"] == "Easy"
            and len(r["required_ingredients"]) <= 6
        ]
        
        if not eligible:
            eligible = self.recipes
        
        # Select based on day
        index = day_of_year % len(eligible)
        recipe = eligible[index]
        
        # Generate reason
        reasons = []
        if recipe["time_minutes"] <= 15:
            reasons.append("quick to make")
        if recipe["nutrition"]["protein_g"] >= 15:
            reasons.append("protein-rich")
        if len(recipe["required_ingredients"]) <= 5:
            reasons.append("uses everyday ingredients")
        if recipe["difficulty"] == "Easy":
            reasons.append("beginner-friendly")
        
        reason = f"Today's pick: {', '.join(reasons) if reasons else 'balanced and tasty'}"
        
        card = RecipeCard(
            id=recipe["id"],
            name=recipe["name"],
            cuisine=recipe["cuisine"],
            difficulty=recipe["difficulty"],
            time_minutes=recipe["time_minutes"],
            required_ingredients=recipe["required_ingredients"],
            optional_ingredients=recipe.get("optional_ingredients", []),
            nutrition=Nutrition(**recipe["nutrition"]),
            servings=recipe.get("servings", 1)
        )
        
        return card, reason


# Singleton instance
recipe_engine = RecipeEngine()
