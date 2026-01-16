'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDrinks, getDrinkDetail, Drink } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NutritionBadge } from '@/components/NutritionBadge';
import { Wine, Loader2, Clock, AlertTriangle, ArrowLeft, Sparkles, Zap } from 'lucide-react';

type Category = 'healthy' | 'energy' | 'protein' | 'detox' | 'refreshing' | 'traditional' | '';

const categories = [
    { value: '' as Category, label: 'All', emoji: '🍹' },
    { value: 'healthy' as Category, label: 'Healthy', emoji: '🥤' },
    { value: 'energy' as Category, label: 'Energy', emoji: '⚡' },
    { value: 'protein' as Category, label: 'Protein', emoji: '💪' },
    { value: 'detox' as Category, label: 'Detox', emoji: '🌿' },
    { value: 'refreshing' as Category, label: 'Refresh', emoji: '❄️' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function DrinkDetail({ drink, onBack }: { drink: Drink; onBack: () => void }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold">{drink.name}</h1>
                    <Badge variant="outline" className="capitalize">{drink.category}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {drink.time_minutes} min prep
                    </span>
                    <span>{drink.serving_size}</span>
                </div>
            </div>

            {/* Health note */}
            {drink.health_note && (
                <Alert className={drink.category === 'alcoholic' ? 'border-amber-300 bg-amber-50 dark:bg-amber-950' : ''}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{drink.health_note}</AlertDescription>
                </Alert>
            )}

            {/* Nutrition */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Nutrition</CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionBadge nutrition={drink.nutrition} />
                </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1">
                        {drink.required_ingredients.map((ing, i) => (
                            <li key={i}>• {ing}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Steps */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {drink.steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    {i + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Drinks
            </Button>
        </div>
    );
}

function DrinkCard({ drink, onClick }: { drink: Drink; onClick: () => void }) {
    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-primary/50"
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{drink.name}</CardTitle>
                    <Badge variant="outline" className="capitalize shrink-0">{drink.category}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {drink.time_minutes} min
                    </span>
                    <span>{drink.serving_size}</span>
                </div>
                <NutritionBadge nutrition={drink.nutrition} showAll={false} size="sm" />
                {drink.health_note && (
                    <p className="text-xs text-muted-foreground italic line-clamp-1">{drink.health_note}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function DrinksPage() {
    const [category, setCategory] = useState<Category>('');
    const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['drinks', category],
        queryFn: () => getDrinks(category || undefined),
    });

    const { data: drinkDetail, isLoading: detailLoading } = useQuery({
        queryKey: ['drink', selectedDrinkId],
        queryFn: () => getDrinkDetail(selectedDrinkId!),
        enabled: !!selectedDrinkId,
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const cat = category || 'healthy';
            const res = await fetch(`${API_BASE}/api/drinks/recommendation/${cat}`);
            if (!res.ok) throw new Error('Failed to generate');
            return res.json();
        },
        onSuccess: (data) => {
            setAiRecommendation(data);
        },
    });

    // Show drink detail if selected
    if (selectedDrinkId && drinkDetail) {
        return <DrinkDetail drink={drinkDetail} onBack={() => setSelectedDrinkId(null)} />;
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
                        <Wine className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Drinks</h1>
                    </div>
                    <Button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
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
                    From healthy smoothies to energy boosters. Quick to make, easy to enjoy.
                </p>
            </div>

            {/* Category Selector */}
            <Tabs value={category} onValueChange={(v) => { setCategory(v as Category); setAiRecommendation(null); }}>
                <TabsList className="grid grid-cols-6 w-full">
                    {categories.map(({ value, label, emoji }) => (
                        <TabsTrigger key={value} value={value} className="gap-1 px-2">
                            <span>{emoji}</span>
                            <span className="hidden sm:inline text-xs">{label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* AI Recommendation */}
            {aiRecommendation && aiRecommendation.drink && (
                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-green-500" />
                                AI Drink Recommendation
                            </CardTitle>
                            <Badge className="bg-green-500 flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {aiRecommendation.category}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold text-lg">{aiRecommendation.drink?.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Best time: {aiRecommendation.best_time} | {aiRecommendation.health_note}
                        </p>
                        <div className="flex gap-2 mt-2">
                            {aiRecommendation.drink?.variations?.slice(0, 2).map((v: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                            ))}
                        </div>
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
                        Couldn't load drinks. Is the backend running?
                    </AlertDescription>
                </Alert>
            )}

            {/* Drink list */}
            {data && data.drinks.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {data.drinks.map((drink) => (
                        <DrinkCard
                            key={drink.id}
                            drink={drink}
                            onClick={() => setSelectedDrinkId(drink.id)}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {data && data.drinks.length === 0 && (
                <Card className="py-12 text-center">
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            No drinks in this category. Generate one with AI!
                        </p>
                        <Button onClick={() => generateMutation.mutate()}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Drink
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
