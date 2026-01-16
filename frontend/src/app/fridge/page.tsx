'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { matchRecipes, FridgeResponse, getRecipeDetail, saveToHistory, Recipe } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Refrigerator, Users, Scale } from 'lucide-react';

export default function FridgePage() {
    const [ingredients, setIngredients] = useState('');
    const [servings, setServings] = useState(2);
    const [servingSize, setServingSize] = useState(200);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    const matchMutation = useMutation({
        mutationFn: (input: string) => matchRecipes(input, undefined, servings, servingSize),
        onSuccess: () => setSelectedRecipeId(null),
    });

    const { data: recipeDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['recipe', selectedRecipeId],
        queryFn: () => getRecipeDetail(selectedRecipeId!),
        enabled: !!selectedRecipeId,
    });

    const saveMutation = useMutation({
        mutationFn: (recipe: Recipe) => saveToHistory(recipe.id, recipe.required_ingredients),
    });

    const handleGenerate = () => {
        if (ingredients.trim()) {
            matchMutation.mutate(ingredients);
        }
    };

    const handleCook = () => {
        if (recipeDetail) {
            saveMutation.mutate(recipeDetail, {
                onSuccess: () => {
                    alert('Recipe saved to history! 🎉');
                    setSelectedRecipeId(null);
                },
            });
        }
    };

    // Show recipe detail if selected
    if (selectedRecipeId && recipeDetail) {
        return (
            <div className="space-y-6">
                <RecipeDetail
                    recipe={recipeDetail}
                    onBack={() => setSelectedRecipeId(null)}
                    onCook={handleCook}
                />
            </div>
        );
    }

    if (detailLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Refrigerator className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">What's in My Fridge?</h1>
                </div>
                <p className="text-muted-foreground">
                    Enter the ingredients you have, and we'll create unique recipes just for you.
                </p>
            </div>

            {/* Input */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Your Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="eggs, onion, tomato, oil, salt..."
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />

                    {/* Serving Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Servings (People) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Servings
                            </label>
                            <select
                                value={servings}
                                onChange={(e) => setServings(Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? 'Person' : 'People'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Serving Size (grams) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                Serving Size
                            </label>
                            <select
                                value={servingSize}
                                onChange={(e) => setServingSize(Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {[100, 150, 200, 250, 300, 350, 400, 450, 500].map(g => (
                                    <option key={g} value={g}>
                                        {g}g per serving
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                            Separate ingredients with commas
                        </p>
                        <Button
                            onClick={handleGenerate}
                            disabled={!ingredients.trim() || matchMutation.isPending}
                        >
                            {matchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Recipes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {matchMutation.isError && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {matchMutation.error?.message || 'Something went wrong. Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {/* Results */}
            {matchMutation.data && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{matchMutation.data.message}</p>
                        {matchMutation.data.ai_generated && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                ✨ AI Created
                            </Badge>
                        )}
                    </div>

                    {/* Normalized ingredients */}
                    {matchMutation.data.normalized_ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-muted-foreground">Recognized:</span>
                            {matchMutation.data.normalized_ingredients.map((ing, i) => (
                                <Badge key={i} variant="secondary">{ing}</Badge>
                            ))}
                        </div>
                    )}

                    {/* Recipe list */}
                    {matchMutation.data.recipes.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {matchMutation.data.recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => setSelectedRecipeId(recipe.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Suggested Ingredients */}
                    {matchMutation.data.suggested_ingredients && matchMutation.data.suggested_ingredients.length > 0 && (
                        <Card className="border-dashed border-2 border-green-200 bg-green-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    💡 Add these to enhance your recipe
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {matchMutation.data.suggested_ingredients.map((ing, i) => (
                                        <Badge key={i} variant="outline" className="bg-white border-green-300 text-green-700">
                                            + {ing}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recipe Suggestions */}
                    {matchMutation.data.recipe_suggestions && matchMutation.data.recipe_suggestions.length > 0 && (
                        <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    🌍 Popular recipes you could make
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {matchMutation.data.recipe_suggestions.map((sug, i) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{sug.name}</span>
                                            <Badge variant="secondary" className="text-xs">{sug.region}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Add: {sug.missing_ingredients.join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!matchMutation.data && !matchMutation.isPending && (
                <Card className="py-12 text-center">
                    <CardContent className="space-y-2">
                        <p className="text-4xl">🥚🧅🍅</p>
                        <p className="text-muted-foreground">
                            Enter your ingredients above to get started
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
