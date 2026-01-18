"""
Backup Recipe Generator
Provides procedural recipe generation when AI services are unavailable or rate-limited.
"""
import random
from models.recipe import Recipe, Nutrition

def generate_backup_recipe(
    ingredients: list[str],
    diet: str = None,
    servings: int = 2,
    serving_size: int = 200
) -> Recipe:
    """
    Generate a simple procedural recipe based on available ingredients.
    This ensures the user always gets a result even if AI fails.
    """
    # Determine type of dish based on key ingredients
    ingredients_lower = [i.lower() for i in ingredients]
    
    recipe_type = "Stir Fry"
    base_calories = 300
    
    if any("egg" in i for i in ingredients_lower):
        recipe_type = "Scramble"
        base_calories = 250
    elif any(i in ["lettuce", "cucumber", "spinach", "kale"] for i in ingredients_lower):
        recipe_type = "Salad"
        base_calories = 150
    elif any(i in ["rice", "pasta", "noodle"] for i in ingredients_lower):
        recipe_type = "Bowl"
        base_calories = 400
    elif any(i in ["chicken", "meat", "beef", "pork"] for i in ingredients_lower):
        recipe_type = "Sauté"
        base_calories = 350
        
    main_ingredient = ingredients[0].title() if ingredients else "Veggie"
    recipe_name = f"Quick {main_ingredient} {recipe_type}"
    
    slug = recipe_name.lower().replace(" ", "-")
    
    return Recipe(
        id=f"backup-{slug}",
        name=recipe_name,
        cuisine="Home Style",
        category="food",
        fitness_tags=["quick", "simple"],
        diet=diet or "any",
        difficulty="Easy",
        time_minutes=15,
        required_ingredients=ingredients,
        optional_ingredients=["salt", "pepper", "oil", "garlic"],
        cookware=["pan", "bowl"],
        steps=[
            f"Prepare all ingredients: {', '.join(ingredients)}.",
            "Heat a pan with some oil over medium heat.",
            f"Add {ingredients[0]} and cook for 2-3 minutes.",
            "Add remaining ingredients and season with salt and pepper.",
            "Cook for another 5-7 minutes until done.",
            "Serve hot and enjoy!"
        ],
        common_mistakes=[
            "Don't overcrowd the pan",
            "Season to taste before serving"
        ],
        nutrition=Nutrition(
            calories=base_calories,
            protein_g=15,
            carbs_g=20,
            fats_g=10
        ),
        servings=servings,
        cooking_impact="A quick and easy meal using what you have.",
        suggested_ingredients=["herbs", "lemon juice", "spices"]
    )
