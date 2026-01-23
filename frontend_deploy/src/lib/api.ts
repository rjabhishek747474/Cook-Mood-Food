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

// ============= NEW DASHBOARD APIs =============

// Types for dashboard
export interface MealItem {
  food_name: string;
  grams?: number;
  quantity?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface MealLog {
  id: number;
  user_id: number;
  logged_at: string;
  meal_type: string;
  items: MealItem[];
  calories_total: number;
  protein_total: number;
  carbs_total: number;
  fats_total: number;
  notes?: string;
}

export interface DailySummary {
  date: string;
  calories_total: number;
  protein_total: number;
  carbs_total: number;
  fats_total: number;
  meals_count: number;
  meals: MealLog[];
}

export interface GoalProgress {
  kind: string;
  target: number;
  current: number;
  progress_percent: number;
}

export interface DashboardData {
  authenticated: boolean;
  date: string;
  user?: { email: string; name: string | null };
  nutrition?: Nutrition;
  meals_count?: number;
  goals?: GoalProgress[];
  action_card?: {
    type: string;
    title: string;
    message: string;
    action?: string;
    action_url?: string;
  };
  recipe_of_day?: {
    recipe: RecipeCard | null;
    reason: string;
  };
  message?: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  recipe_id: string;
  recipe_name: string;
  recipe_type: string;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  kind: string;
  target_value: number;
  current_value: number;
  progress_percent: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

// Helper to create authenticated fetch
function fetchAPIWithAuth<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Dashboard
export async function getDashboardToday(token?: string): Promise<DashboardData> {
  if (token) {
    return fetchAPIWithAuth<DashboardData>('/api/dashboard/today', token);
  }
  return fetchAPI<DashboardData>('/api/dashboard/today');
}

export async function getDashboardTrends(token: string, days = 7): Promise<{
  period: string;
  daily: { date: string; calories: number; protein_g: number; carbs_g: number; fats_g: number; meals_count: number }[];
  averages: Nutrition;
  active_days: number;
  total_meals: number;
}> {
  return fetchAPIWithAuth(`/api/dashboard/trends?days=${days}`, token);
}

// Meal Logging
export async function logMeal(token: string, data: {
  meal_type: string;
  items: MealItem[];
  notes?: string;
  logged_at?: string;
}): Promise<MealLog> {
  return fetchAPIWithAuth<MealLog>('/api/meals/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTodayMeals(token: string): Promise<DailySummary> {
  return fetchAPIWithAuth<DailySummary>('/api/meals/today', token);
}

export async function getMeals(token: string, date?: string, limit = 20): Promise<MealLog[]> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  params.append('limit', limit.toString());
  return fetchAPIWithAuth<MealLog[]>(`/api/meals/?${params}`, token);
}

export async function deleteMeal(token: string, mealId: number): Promise<void> {
  await fetchAPIWithAuth(`/api/meals/${mealId}`, token, { method: 'DELETE' });
}

// Favorites
export async function addFavorite(token: string, data: {
  recipe_id: string;
  recipe_name: string;
  recipe_type?: string;
}): Promise<Favorite> {
  return fetchAPIWithAuth<Favorite>('/api/favorites/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getFavorites(token: string): Promise<Favorite[]> {
  return fetchAPIWithAuth<Favorite[]>('/api/favorites/', token);
}

export async function checkFavorite(token: string, recipeId: string): Promise<{ is_favorited: boolean; favorite_id: number | null }> {
  return fetchAPIWithAuth(`/api/favorites/check/${recipeId}`, token);
}

export async function removeFavorite(token: string, favoriteId: number): Promise<void> {
  await fetchAPIWithAuth(`/api/favorites/${favoriteId}`, token, { method: 'DELETE' });
}

export async function removeFavoriteByRecipe(token: string, recipeId: string): Promise<void> {
  await fetchAPIWithAuth(`/api/favorites/recipe/${recipeId}`, token, { method: 'DELETE' });
}

// Goals
export async function createGoal(token: string, data: {
  kind: string;
  target_value: number;
  end_date?: string;
}): Promise<Goal> {
  return fetchAPIWithAuth<Goal>('/api/goals/', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getGoals(token: string, activeOnly = true): Promise<Goal[]> {
  return fetchAPIWithAuth<Goal[]>(`/api/goals/?active_only=${activeOnly}`, token);
}

export async function getGoalProgress(token: string): Promise<{
  goals: Goal[];
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fats: number;
}> {
  return fetchAPIWithAuth('/api/goals/progress', token);
}

export async function updateGoal(token: string, goalId: number, data: {
  target_value?: number;
  is_active?: boolean;
  end_date?: string;
}): Promise<Goal> {
  return fetchAPIWithAuth<Goal>(`/api/goals/${goalId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteGoal(token: string, goalId: number): Promise<void> {
  await fetchAPIWithAuth(`/api/goals/${goalId}`, token, { method: 'DELETE' });
}

