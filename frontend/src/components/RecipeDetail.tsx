'use client';

import { Recipe } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { NutritionBadge } from './NutritionBadge';
import { Clock, ChefHat, Users, AlertTriangle, Check } from 'lucide-react';

interface RecipeDetailProps {
    recipe: Recipe;
    onCook?: () => void;
    onBack?: () => void;
}

export function RecipeDetail({ recipe, onCook, onBack }: RecipeDetailProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold">{recipe.name}</h1>
                    <Badge variant="outline" className="shrink-0">{recipe.cuisine}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.time_minutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4" />
                        {recipe.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Nutrition */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Nutrition (per serving)</CardTitle>
                </CardHeader>
                <CardContent>
                    <NutritionBadge nutrition={recipe.nutrition} />
                    {recipe.cooking_impact && (
                        <p className="mt-2 text-sm text-muted-foreground italic">{recipe.cooking_impact}</p>
                    )}
                </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Required</p>
                        <ul className="space-y-1">
                            {recipe.required_ingredients.map((ing, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {recipe.optional_ingredients.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Optional</p>
                            <ul className="space-y-1">
                                {recipe.optional_ingredients.map((ing, i) => (
                                    <li key={i} className="text-muted-foreground">• {ing}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cookware */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">You'll Need</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {recipe.cookware.map((item, i) => (
                            <Badge key={i} variant="secondary">{item}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Steps */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {recipe.steps.map((step, i) => (
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

            {/* Common Mistakes */}
            {recipe.common_mistakes.length > 0 && (
                <Alert variant="destructive" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">Avoid These Mistakes</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {recipe.common_mistakes.map((mistake, i) => (
                                <li key={i}>{mistake}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                {onBack && (
                    <Button variant="outline" onClick={onBack}>
                        ← Back
                    </Button>
                )}
                {onCook && (
                    <Button onClick={onCook} className="flex-1">
                        I Cooked This! ✓
                    </Button>
                )}
            </div>
        </div>
    );
}
