'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFitnessRecipes, getRecipeDetail, Recipe, RecipeCard as RecipeCardType } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Loader2, Info, Sparkles, RefreshCw } from 'lucide-react';

type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance';

const goals = [
    { value: 'fat_loss' as Goal, label: 'Fat Loss', emoji: '🔥' },
    { value: 'muscle_gain' as Goal, label: 'Muscle Gain', emoji: '💪' },
    { value: 'maintenance' as Goal, label: 'Maintenance', emoji: '⚖️' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FitnessPage() {
    const [goal, setGoal] = useState<Goal>('muscle_gain');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<any>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['fitness', goal],
        queryFn: () => getFitnessRecipes(goal),
    });

    const { data: recipeDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['recipe', selectedRecipeId],
        queryFn: () => getRecipeDetail(selectedRecipeId!),
        enabled: !!selectedRecipeId,
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/api/fitness/recommendation/${goal}`);
            if (!res.ok) throw new Error('Failed to generate');
            return res.json();
        },
        onSuccess: (data) => {
            setAiRecommendation(data);
        },
    });

    // Show recipe detail if selected
    if (selectedRecipeId && recipeDetail) {
        return (
            <div className="space-y-6">
                <RecipeDetail
                    recipe={recipeDetail}
                    onBack={() => setSelectedRecipeId(null)}
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Fitness Recipes</h1>
                    </div>
                    <Button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                        {generateMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Random
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Recipes optimized for your fitness goals with transparent nutrition info.
                </p>
            </div>

            {/* Goal Selector */}
            <Tabs value={goal} onValueChange={(v) => { setGoal(v as Goal); setAiRecommendation(null); }}>
                <TabsList className="grid grid-cols-3 w-full">
                    {goals.map(({ value, label, emoji }) => (
                        <TabsTrigger key={value} value={value} className="gap-1">
                            <span>{emoji}</span>
                            <span className="hidden sm:inline">{label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* AI Recommendation */}
            {aiRecommendation && (
                <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-orange-500" />
                                AI Recommendation of the Day
                            </CardTitle>
                            <Badge className="bg-orange-500">{goal.replace('_', ' ')}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-lg">{aiRecommendation.recipe?.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{aiRecommendation.tip}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setSelectedRecipeId(aiRecommendation.recipe?.id)}
                        >
                            View Recipe
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Disclaimer */}
            {data?.disclaimer && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {data.disclaimer}
                    </AlertDescription>
                </Alert>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Couldn't load recipes. Is the backend running?
                    </AlertDescription>
                </Alert>
            )}

            {/* Recipe list */}
            {data && data.recipes.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {data.recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => setSelectedRecipeId(recipe.id)}
                            showNutrition
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {data && data.recipes.length === 0 && (
                <Card className="py-12 text-center">
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            No recipes found for this goal. Try generating one with AI!
                        </p>
                        <Button onClick={() => generateMutation.mutate()}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate AI Recipe
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
