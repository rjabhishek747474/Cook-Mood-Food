'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { matchRecipes, FridgeResponse, getRecipeDetail, saveToHistory, Recipe } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardSectionGreen, CardSectionPink } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge, FilterBadge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { Loader2, Refrigerator, Users, Scale, Search, Sparkles, Globe, Lightbulb } from 'lucide-react';

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
        if (recipeDetail && !saveMutation.isPending) {
            saveMutation.mutate(recipeDetail, {
                onSuccess: () => {
                    // Show success briefly, then go back
                    setTimeout(() => {
                        setSelectedRecipeId(null);
                    }, 1500);
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
                    isSaving={saveMutation.isPending}
                    isSaved={saveMutation.isSuccess}
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
                    <div className="p-2 bg-primary border-3 border-foreground">
                        <Refrigerator className="h-6 w-6 text-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">What&apos;s in My Fridge?</h1>
                </div>
                <p className="text-muted-foreground">
                    Enter the ingredients you have, and we&apos;ll create unique recipes just for you.
                </p>
            </div>

            {/* Input Card */}
            <Card className="border-3 border-foreground">
                <CardHeader className="pb-2 bg-primary/10">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Your Ingredients
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Textarea
                        placeholder="EGGS, ONION, TOMATO, OIL, SALT..."
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        rows={3}
                        className="resize-none border-3 border-foreground focus:shadow-[4px_4px_0_0_hsl(var(--primary))] placeholder:uppercase placeholder:tracking-wide"
                    />

                    {/* Serving Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Servings (People) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Servings
                            </label>
                            <select
                                value={servings}
                                onChange={(e) => setServings(Number(e.target.value))}
                                className="w-full h-12 px-3 border-3 border-foreground bg-background text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0_0_hsl(var(--primary))]"
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
                            <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                                Serving Size
                            </label>
                            <select
                                value={servingSize}
                                onChange={(e) => setServingSize(Number(e.target.value))}
                                className="w-full h-12 px-3 border-3 border-foreground bg-background text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0_0_hsl(var(--primary))]"
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
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Separate ingredients with commas
                        </p>
                        <Button
                            onClick={handleGenerate}
                            disabled={!ingredients.trim() || matchMutation.isPending}
                            variant="cta"
                            size="lg"
                        >
                            {matchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Recipes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {matchMutation.isError && (
                <Alert variant="destructive" className="border-3 border-foreground">
                    <AlertDescription>
                        {matchMutation.error?.message || 'Something went wrong. Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {/* Results */}
            {matchMutation.data && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="font-bold uppercase tracking-wide">{matchMutation.data.message}</p>
                        {matchMutation.data.ai_generated && (
                            <Badge variant="cta" className="gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Created
                            </Badge>
                        )}
                    </div>

                    {/* Normalized ingredients */}
                    {matchMutation.data.normalized_ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Recognized:</span>
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
                        <CardSectionGreen>
                            <div className="section-label mb-2">
                                <Lightbulb className="h-4 w-4" />
                                Add These to Enhance Your Recipe
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {matchMutation.data.suggested_ingredients.map((ing, i) => (
                                    <Badge key={i} variant="outline" className="bg-background">
                                        + {ing}
                                    </Badge>
                                ))}
                            </div>
                        </CardSectionGreen>
                    )}

                    {/* Recipe Suggestions */}
                    {matchMutation.data.recipe_suggestions && matchMutation.data.recipe_suggestions.length > 0 && (
                        <CardSectionPink>
                            <div className="section-label mb-2">
                                <Globe className="h-4 w-4" />
                                Popular Recipes You Could Make
                            </div>
                            <div className="space-y-3">
                                {matchMutation.data.recipe_suggestions.map((sug, i) => (
                                    <div key={i} className="p-3 bg-background border-2 border-foreground">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold uppercase tracking-wide text-sm">{sug.name}</span>
                                            <Badge variant="tag" className="text-xs">{sug.region}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Add: {sug.missing_ingredients.join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardSectionPink>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!matchMutation.data && !matchMutation.isPending && (
                <div className="border-3 border-dashed border-muted py-12 text-center">
                    <p className="text-4xl mb-2">🥚🧅🍅</p>
                    <p className="text-muted-foreground uppercase tracking-wide text-sm">
                        Enter your ingredients above to get started
                    </p>
                </div>
            )}
        </div>
    );
}
