/**
 * API Client for DailyCook Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Nutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface RecipeCard {
  id: string;
  name: string;
  cuisine: string;
  difficulty: string;
  time_minutes: number;
  required_ingredients: string[];
  optional_ingredients: string[];
  nutrition: Nutrition;
  servings: number;
}

export interface Recipe extends RecipeCard {
  category: string;
  fitness_tags: string[];
  diet: string;
  cookware: string[];
  steps: string[];
  common_mistakes: string[];
  cooking_impact?: string;
}

export interface Drink {
  id: string;
  name: string;
  category: string;
  diet: string;
  time_minutes: number;
  required_ingredients: string[];
  optional_ingredients: string[];
  steps: string[];
  serving_size: string;
  health_note: string | null;
  nutrition: Nutrition;
}


export interface RecipeSuggestion {
  name: string;
  region: string;
  missing_ingredients: string[];
}

export interface FridgeResponse {
  normalized_ingredients: string[];
  recipes: RecipeCard[];
  message: string;
  ai_generated: boolean;
  suggested_ingredients?: string[];
  recipe_suggestions?: RecipeSuggestion[];
}

export interface FitnessResponse {
  goal: string;
  recipes: RecipeCard[];
  disclaimer: string;
}

export interface CuisineResponse {
  cuisine: string;
  recipes: RecipeCard[];
  supported_cuisines: string[];
}

export interface DrinksResponse {
  category: string | null;
  drinks: Drink[];
  categories: string[];
}

export interface DailyRecipeResponse {
  recipe: RecipeCard;
  reason: string;
  date: string;
}

export interface HistoryEntry {
  id: number;
  recipe_id: string;
  recipe_name: string;
  date_cooked: string;
  ingredients_used: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface InsightData {
  total_recipes: number;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fats: number;
  top_ingredients: [string, number][];
  patterns: string[];
}

// API Functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return res.json();
}

// Fridge Recipes
export async function matchRecipes(
  ingredients: string,
  diet?: string,
  servings?: number,
  serving_size?: number
): Promise<FridgeResponse> {
  return fetchAPI<FridgeResponse>('/api/fridge/match', {
    method: 'POST',
    body: JSON.stringify({ ingredients, diet, servings, serving_size }),
  });
}

export async function getRecipeDetail(recipeId: string): Promise<Recipe> {
  return fetchAPI<Recipe>(`/api/fridge/recipe/${recipeId}`);
}

// Fitness Recipes
export async function getFitnessRecipes(goal: string, diet?: string): Promise<FitnessResponse> {
  const params = new URLSearchParams({ goal });
  if (diet) params.append('diet', diet);
  return fetchAPI<FitnessResponse>(`/api/fitness/?${params}`);
}

// Cuisine Recipes
export async function getCuisineRecipes(cuisine: string, diet?: string): Promise<CuisineResponse> {
  const params = new URLSearchParams({ cuisine });
  if (diet) params.append('diet', diet);
  return fetchAPI<CuisineResponse>(`/api/cuisine/?${params}`);
}

// Drinks
export async function getDrinks(category?: string): Promise<DrinksResponse> {
  const params = category ? `?category=${category}` : '';
  return fetchAPI<DrinksResponse>(`/api/drinks/${params}`);
}

export async function getDrinkDetail(drinkId: string): Promise<Drink> {
  return fetchAPI<Drink>(`/api/drinks/${drinkId}`);
}

// Recipe of the Day
export async function getRecipeOfDay(): Promise<DailyRecipeResponse> {
  return fetchAPI<DailyRecipeResponse>('/api/daily/');
}

export async function getRecipeOfDayDetail(): Promise<Recipe> {
  return fetchAPI<Recipe>('/api/daily/detail');
}

// History
export async function saveToHistory(recipeId: string, ingredientsUsed: string[]): Promise<void> {
  await fetchAPI('/api/history/save', {
    method: 'POST',
    body: JSON.stringify({ recipe_id: recipeId, ingredients_used: ingredientsUsed }),
  });
}

export async function getHistory(limit = 20): Promise<{ entries: HistoryEntry[]; total: number }> {
  return fetchAPI(`/api/history/?limit=${limit}`);
}

export async function getInsights(days = 7): Promise<{ insights: InsightData; message: string }> {
  return fetchAPI(`/api/history/insights?days=${days}`);
}
