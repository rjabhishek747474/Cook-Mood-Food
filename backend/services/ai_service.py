"""
Gemini AI Service for LLM-powered recipe generation
"""
import google.generativeai as genai
import json
import os
import re
import random
from typing import Optional
from models.recipe import Recipe, Nutrition

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_gemini_model():
    """Initialize and return Gemini model"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel(
        'models/gemini-2.5-flash',
        generation_config={
            "temperature": 0.7,
            "top_p": 0.95,
        }
    )

RECIPE_GENERATION_PROMPT = """You are a creative home cooking chef. Your task is to ALWAYS CREATE a recipe with ANY ingredients provided - never refuse. Also suggest improvements and popular alternatives.

**Available Ingredients:** {ingredients}
**Diet Preference:** {diet}
**Cuisine Style:** {cuisine}
**Fitness Goal:** {goal}
**Servings:** {servings} people
**Serving Size:** {serving_size}g per person

**CRITICAL RULES:**
1. **ALWAYS create a recipe** - even with 1-2 ingredients, create something simple and delicious.
2. Create a UNIQUE recipe name - be creative! Use fusion names, local twists, or fun descriptive names.
3. Use ONLY provided ingredients + basic pantry (salt, pepper, oil, water, common spices).
4. **Adjust ingredient quantities for {servings} people, each serving being {serving_size}g.**
5. Maximum 6 clear steps, each under 15 words.
6. **Nutrition values must be PER SERVING.**
7. **ALWAYS suggest 3-6 ingredients** that would enhance this recipe in "suggested_ingredients".
8. **ALWAYS suggest 2 popular recipes** the user could make with a few more ingredients in "recipe_suggestions".

**VARIETY:** Consider:
- Cooking techniques: stir-fry, sauté, roast, steam, one-pot.
- Textures: crispy, creamy, crunchy, tender.
- Flavor profiles: spicy, tangy, savory, umami.

Generate JSON with this structure:
{{
  "id": "ai-{recipe_slug}",
  "name": "Creative Unique Recipe Name",
  "cuisine": "{cuisine}",
  "category": "food",
  "fitness_tags": ["balanced"],
  "diet": "veg|non-veg",
  "difficulty": "Easy|Medium",
  "time_minutes": 15,
  "required_ingredients": ["200g ingredient1", "100g ingredient2"],
  "optional_ingredients": ["optional enhancement"],
  "cookware": ["pan"],
  "steps": [
    "Step 1: Specific action",
    "Step 2: Next action"
  ],
  "common_mistakes": [
    "Pro tip 1",
    "Pro tip 2"
  ],
  "nutrition": {{
    "calories": 250,
    "protein_g": 20,
    "carbs_g": 15,
    "fats_g": 12
  }},
  "servings": {servings},
  "serving_size_g": {serving_size},
  "cooking_impact": "What makes this dish special",
  "suggested_ingredients": [
    "paneer - adds protein and creaminess",
    "garam masala - enhances flavor",
    "cream - makes it richer",
    "bell pepper - adds crunch and color"
  ],
  "recipe_suggestions": [
    {{
      "name": "Paneer Butter Masala",
      "region": "Punjab, India",
      "missing_ingredients": ["paneer", "butter", "cream"]
    }},
    {{
      "name": "Thai Basil Stir-Fry",
      "region": "Thailand",
      "missing_ingredients": ["basil", "fish sauce", "thai chili"]
    }}
  ]
}}"""

def extract_json_from_response(text: str) -> dict:
    """Extract JSON from response, handling various formats"""
    text = text.strip()
    
    # Try direct parse first
    try:
        return json.loads(text)
    except:
        pass
    
    # Remove markdown code blocks
    if "```" in text:
        # Find JSON block
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            try:
                return json.loads(match.group(1))
            except:
                pass
    
    # Try to find JSON object in text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass
    
    raise ValueError(f"Could not parse JSON from response: {text[:200]}...")

async def generate_recipe_with_ai(
    ingredients: list[str],
    diet: Optional[str] = None,
    cuisine: Optional[str] = None,
    goal: Optional[str] = None,
    servings: int = 2,
    serving_size: int = 200
) -> Optional[Recipe]:
    """
    Generate a recipe using Gemini AI based on available ingredients.
    Adjusts quantities for specified servings and serving size.
    Returns None if AI generation fails.
    """
    try:
        model = get_gemini_model()
        
        # Create a slug for the recipe ID
        recipe_slug = "-".join(ingredients[:3]).lower().replace(" ", "-")[:20]
        
        prompt = RECIPE_GENERATION_PROMPT.format(
            ingredients=", ".join(ingredients),
            diet=diet or "any",
            cuisine=cuisine or "Indian",
            goal=goal or "balanced",
            servings=servings,
            serving_size=serving_size,
            recipe_slug=recipe_slug
        )
        
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        recipe_data = extract_json_from_response(response.text)
        
        # Ensure required fields have valid values
        if "id" not in recipe_data or not recipe_data["id"]:
            recipe_data["id"] = f"ai-{recipe_slug}"
        
        # Normalize numeric fields to int (AI might return floats)
        for field in ['time_minutes', 'servings']:
            if field in recipe_data and recipe_data[field] is not None:
                recipe_data[field] = int(recipe_data[field])
        
        if 'nutrition' in recipe_data:
            for field in ['calories', 'protein_g', 'carbs_g', 'fats_g']:
                if field in recipe_data['nutrition']:
                    recipe_data['nutrition'][field] = int(recipe_data['nutrition'][field])
        
        # Ensure list fields exist
        for field in ['fitness_tags', 'required_ingredients', 'optional_ingredients', 
                      'cookware', 'steps', 'common_mistakes']:
            if field not in recipe_data or recipe_data[field] is None:
                recipe_data[field] = []
        
        # Validate and create Recipe object
        return Recipe(**recipe_data)
        
    except Exception as e:
        print(f"AI recipe generation failed: {e}")
        import traceback
        traceback.print_exc()
        return None

async def enhance_recipe_description(recipe_name: str, steps: list[str]) -> str:
    """
    Use AI to generate a brief, engaging description for a recipe.
    """
    try:
        model = get_gemini_model()
        
        prompt = f"""Write a one-sentence description (max 20 words) for this recipe:
Recipe: {recipe_name}
Steps: {', '.join(steps[:3])}

Return only the description text, nothing else."""
        
        response = model.generate_content(prompt)
        return response.text.strip().strip('"')
        
    except Exception as e:
        print(f"AI description generation failed: {e}")
        return ""

async def suggest_ingredient_substitutes(
    missing_ingredient: str,
    available_ingredients: list[str]
) -> list[str]:
    """
    Use AI to suggest substitutes for a missing ingredient.
    """
    try:
        model = get_gemini_model()
        
        prompt = f"""Suggest 2-3 substitutes for "{missing_ingredient}" from these available ingredients: {', '.join(available_ingredients)}

Rules:
1. Only suggest from the available list
2. Consider flavor and texture similarity

Return as JSON array: ["substitute1", "substitute2"]"""
        
        response = model.generate_content(prompt)
        result = extract_json_from_response(response.text)
        
        if isinstance(result, list):
            return result
        return []
        
    except Exception as e:
        print(f"AI substitute suggestion failed: {e}")
        return []

# ============= FITNESS PROMPTS =============

FITNESS_PROMPT = """You are a sports nutritionist and chef. Create a {goal} recipe recommendation.

**Goal:** {goal_description}
**Diet Preference:** {diet}
**Time Available:** {time_limit} minutes max

**NUTRITION TARGETS for {goal}:**
{nutrition_targets}

**RULES:**
1. Recipe must align with the fitness goal
2. Include exact macros per serving
3. Use common, affordable ingredients
4. Maximum 6 steps
5. Explain WHY this recipe helps the goal

Generate JSON:
{{
  "id": "fitness-{goal}-{slug}",
  "name": "Creative Recipe Name",
  "cuisine": "Fusion/Indian/Global",
  "category": "food",
  "fitness_tags": ["{goal}"],
  "diet": "veg|non-veg",
  "difficulty": "Easy|Medium",
  "time_minutes": {time_limit},
  "required_ingredients": ["200g ingredient with qty"],
  "optional_ingredients": ["enhancement"],
  "cookware": ["pan"],
  "steps": ["Step 1", "Step 2"],
  "common_mistakes": ["Tip 1", "Tip 2"],
  "nutrition": {{
    "calories": 300,
    "protein_g": 25,
    "carbs_g": 20,
    "fats_g": 10
  }},
  "servings": 1,
  "cooking_impact": "Why this helps {goal}",
  "fitness_tip": "Pro tip for {goal} goal"
}}"""

# ============= CUISINE PROMPTS =============

CUISINE_PROMPT = """You are a world-class chef specializing in {cuisine} cuisine. Create an authentic yet accessible recipe.

**Cuisine:** {cuisine}
**Diet Preference:** {diet}
**Difficulty:** {difficulty}

**AUTHENTICITY RULES:**
1. Use traditional {cuisine} cooking techniques
2. Include at least one signature spice/ingredient from {cuisine}
3. Mention the region in {cuisine} where this dish is popular
4. Keep ingredients accessible - suggest substitutes if exotic items needed
5. Maximum 6 clear steps

**CULTURAL CONTEXT:**
- Explain the cultural significance or occasion for this dish
- Mention popular variations from different regions

Generate JSON:
{{
  "id": "cuisine-{cuisine_slug}-{slug}",
  "name": "Authentic {cuisine} Recipe Name",
  "cuisine": "{cuisine}",
  "category": "food",
  "fitness_tags": ["balanced"],
  "diet": "veg|non-veg",
  "difficulty": "{difficulty}",
  "time_minutes": 25,
  "required_ingredients": ["ingredient with qty"],
  "optional_ingredients": ["enhancement"],
  "cookware": ["traditional cookware"],
  "steps": ["Step 1", "Step 2"],
  "common_mistakes": ["Authenticity tip 1", "Cooking tip 2"],
  "nutrition": {{
    "calories": 300,
    "protein_g": 15,
    "carbs_g": 30,
    "fats_g": 12
  }},
  "servings": 2,
  "cooking_impact": "What makes this dish special in {cuisine} cuisine",
  "cultural_note": "When and where this is traditionally served",
  "region": "Specific region in {cuisine} where popular"
}}"""

# ============= DRINKS PROMPTS =============

DRINKS_PROMPT = """You are a beverage expert and mixologist. Create a {category} drink recipe.

**Category:** {category}
**Diet:** {diet}
**Goal:** {goal}

**CATEGORY GUIDELINES:**
{category_guidelines}

**RULES:**
1. Clear step-by-step instructions
2. Include exact measurements
3. Mention health benefits if applicable
4. Suggest variations (hot/cold, sweetness levels)
5. Maximum 5 steps

Generate JSON:
{{
  "id": "drink-{category_slug}-{slug}",
  "name": "Creative Drink Name",
  "category": "{category}",
  "diet": "veg|non-veg",
  "time_minutes": 5,
  "required_ingredients": ["200ml ingredient", "1 tbsp item"],
  "optional_ingredients": ["garnish", "sweetener"],
  "steps": ["Step 1", "Step 2"],
  "serving_size": "250ml",
  "health_note": "Health benefits or suitable occasions",
  "nutrition": {{
    "calories": 80,
    "protein_g": 2,
    "carbs_g": 15,
    "fats_g": 1
  }},
  "best_time": "Morning/Evening/Post-workout",
  "variations": ["Iced version", "Add honey for sweetness"]
}}"""

# ============= FITNESS GENERATION =============

async def generate_fitness_recipe(
    goal: str,
    diet: Optional[str] = None,
    time_limit: int = 30
) -> Optional[Recipe]:
    """Generate a fitness-focused recipe based on goal."""
    try:
        model = get_gemini_model()
        
        goal_configs = {
            "fat_loss": {
                "description": "Low calorie, high protein, low carb for fat loss",
                "targets": "- Calories: 250-400 per serving\n- Protein: 25-35g (high)\n- Carbs: 15-25g (low)\n- Fats: 8-15g (moderate)"
            },
            "muscle_gain": {
                "description": "High protein, moderate carbs for muscle building",
                "targets": "- Calories: 400-600 per serving\n- Protein: 35-50g (very high)\n- Carbs: 40-60g (moderate-high)\n- Fats: 15-25g (moderate)"
            },
            "maintenance": {
                "description": "Balanced macros for maintaining current weight",
                "targets": "- Calories: 350-500 per serving\n- Protein: 20-30g (moderate)\n- Carbs: 35-50g (balanced)\n- Fats: 12-20g (balanced)"
            }
        }
        
        config = goal_configs.get(goal, goal_configs["maintenance"])
        slug = f"{goal}-{random.randint(1000, 9999)}"
        
        prompt = FITNESS_PROMPT.format(
            goal=goal.replace("_", " ").title(),
            goal_description=config["description"],
            diet=diet or "any",
            time_limit=time_limit,
            nutrition_targets=config["targets"],
            slug=slug
        )
        
        response = model.generate_content(prompt)
        recipe_data = extract_json_from_response(response.text)
        
        # Normalize data
        for field in ['time_minutes', 'servings']:
            if field in recipe_data:
                recipe_data[field] = int(recipe_data[field])
        if 'nutrition' in recipe_data:
            for f in ['calories', 'protein_g', 'carbs_g', 'fats_g']:
                if f in recipe_data['nutrition']:
                    recipe_data['nutrition'][f] = int(recipe_data['nutrition'][f])
        
        return Recipe(**recipe_data)
        
    except Exception as e:
        print(f"Fitness recipe generation failed: {e}")
        return None

# ============= CUISINE GENERATION =============

async def generate_cuisine_recipe(
    cuisine: str,
    diet: Optional[str] = None,
    difficulty: str = "Easy"
) -> Optional[Recipe]:
    """Generate an authentic cuisine-specific recipe."""
    try:
        model = get_gemini_model()
        
        cuisine_slug = cuisine.lower().replace(" ", "-")
        slug = f"{random.randint(1000, 9999)}"
        
        prompt = CUISINE_PROMPT.format(
            cuisine=cuisine,
            diet=diet or "any",
            difficulty=difficulty,
            cuisine_slug=cuisine_slug,
            slug=slug
        )
        
        response = model.generate_content(prompt)
        recipe_data = extract_json_from_response(response.text)
        
        # Normalize data
        for field in ['time_minutes', 'servings']:
            if field in recipe_data:
                recipe_data[field] = int(recipe_data[field])
        if 'nutrition' in recipe_data:
            for f in ['calories', 'protein_g', 'carbs_g', 'fats_g']:
                if f in recipe_data['nutrition']:
                    recipe_data['nutrition'][f] = int(recipe_data['nutrition'][f])
        
        return Recipe(**recipe_data)
        
    except Exception as e:
        print(f"Cuisine recipe generation failed: {e}")
        return None

# ============= DRINKS GENERATION =============

async def generate_drink_recipe(
    category: str,
    diet: Optional[str] = None,
    goal: Optional[str] = None
) -> Optional[dict]:
    """Generate a drink recipe based on category."""
    try:
        model = get_gemini_model()
        
        category_guidelines = {
            "healthy": "Focus on natural ingredients, low sugar, high nutrients. Include superfoods if possible.",
            "energy": "Ingredients that boost energy naturally - avoid excessive sugar. Great for pre/post workout.",
            "detox": "Cleansing ingredients like lemon, ginger, greens. Support digestion and hydration.",
            "protein": "High protein content for muscle recovery. Use protein sources like milk, yogurt, nuts.",
            "refreshing": "Light, hydrating, perfect for hot days. Focus on fruits and cooling ingredients.",
            "traditional": "Classic Indian drinks like lassi, chaas, nimbu pani. Authentic recipes."
        }
        
        guidelines = category_guidelines.get(category.lower(), category_guidelines["healthy"])
        category_slug = category.lower().replace(" ", "-")
        slug = f"{random.randint(1000, 9999)}"
        
        prompt = DRINKS_PROMPT.format(
            category=category,
            diet=diet or "veg",
            goal=goal or "general wellness",
            category_guidelines=guidelines,
            category_slug=category_slug,
            slug=slug
        )
        
        response = model.generate_content(prompt)
        drink_data = extract_json_from_response(response.text)
        
        # Normalize data
        if 'time_minutes' in drink_data:
            drink_data['time_minutes'] = int(drink_data['time_minutes'])
        if 'nutrition' in drink_data:
            for f in ['calories', 'protein_g', 'carbs_g', 'fats_g']:
                if f in drink_data['nutrition']:
                    drink_data['nutrition'][f] = int(drink_data['nutrition'][f])
        
        return drink_data
        
    except Exception as e:
        print(f"Drink recipe generation failed: {e}")
        return None

# ============= RECOMMENDATION OF THE DAY =============

async def get_fitness_recommendation_of_day(goal: str) -> Optional[dict]:
    """Get AI-generated fitness recommendation of the day."""
    recipe = await generate_fitness_recipe(goal)
    if recipe:
        return {
            "recipe": recipe,
            "tip": getattr(recipe, 'fitness_tip', f"Stay consistent with your {goal.replace('_', ' ')} journey!"),
            "goal": goal
        }
    return None

async def get_cuisine_recommendation_of_day(cuisine: str) -> Optional[dict]:
    """Get AI-generated cuisine recommendation of the day."""
    recipe = await generate_cuisine_recipe(cuisine)
    if recipe:
        return {
            "recipe": recipe,
            "cultural_note": getattr(recipe, 'cultural_note', f"Explore the flavors of {cuisine}!"),
            "cuisine": cuisine
        }
    return None

async def get_drink_recommendation_of_day(category: str) -> Optional[dict]:
    """Get AI-generated drink recommendation of the day."""
    drink = await generate_drink_recipe(category)
    if drink:
        return {
            "drink": drink,
            "best_time": drink.get('best_time', 'Anytime'),
            "category": category
        }
    return None
