'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCuisineRecipes, getRecipeDetail } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, Sparkles, MapPin } from 'lucide-react';

type Cuisine = 'Indian' | 'Japanese' | 'Chinese' | 'Italian' | 'Mexican' | 'Thai' | 'Global';

const cuisines = [
    { value: 'Indian' as Cuisine, emoji: '🇮🇳' },
    { value: 'Japanese' as Cuisine, emoji: '🇯🇵' },
    { value: 'Chinese' as Cuisine, emoji: '🇨🇳' },
    { value: 'Italian' as Cuisine, emoji: '🇮🇹' },
    { value: 'Mexican' as Cuisine, emoji: '🇲🇽' },
    { value: 'Thai' as Cuisine, emoji: '🇹🇭' },
    { value: 'Global' as Cuisine, emoji: '🌍' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CuisinePage() {
    const [cuisine, setCuisine] = useState<Cuisine>('Indian');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['cuisine', cuisine],
        queryFn: () => getCuisineRecipes(cuisine),
    });

    const { data: recipeDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['recipe', selectedRecipeId],
        queryFn: () => getRecipeDetail(selectedRecipeId!),
        enabled: !!selectedRecipeId,
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_BASE}/api/cuisine/recommendation/${cuisine}`);
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
                        <Globe className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Global Cuisine</h1>
                    </div>
                    <Button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
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
                    Authentic recipes from around the world, made simple for home cooking.
                </p>
            </div>

            {/* Cuisine Selector */}
            <Tabs value={cuisine} onValueChange={(v) => { setCuisine(v as Cuisine); setAiRecommendation(null); }}>
                <TabsList className="grid grid-cols-7 w-full">
                    {cuisines.map(({ value, emoji }) => (
                        <TabsTrigger key={value} value={value} className="gap-1 px-2">
                            <span>{emoji}</span>
                            <span className="hidden lg:inline text-xs">{value}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* AI Recommendation */}
            {aiRecommendation && (
                <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                AI Recommendation of the Day
                            </CardTitle>
                            <Badge className="bg-blue-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cuisine}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-lg">{aiRecommendation.recipe?.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{aiRecommendation.cultural_note}</p>
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
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {data && data.recipes.length === 0 && (
                <Card className="py-12 text-center">
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            No {cuisine} recipes in the database. Generate one with AI!
                        </p>
                        <Button onClick={() => generateMutation.mutate()}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate {cuisine} Recipe
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
