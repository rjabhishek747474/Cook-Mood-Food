'use client';

import { RecipeCard as RecipeCardType } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NutritionBadge } from './NutritionBadge';
import { Clock, ChefHat, Users, Flame, Loader2 } from 'lucide-react';

interface RecipeCardProps {
    recipe: RecipeCardType;
    onClick?: () => void;
    showNutrition?: boolean;
    madeCount?: number;
    onMadeThis?: (recipe: RecipeCardType) => void;
    isSaving?: boolean;
}

export function RecipeCard({ recipe, onClick, showNutrition = true, madeCount, onMadeThis, isSaving }: RecipeCardProps) {
    const handleMadeThis = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onMadeThis) {
            onMadeThis(recipe);
        }
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0_0_hsl(var(--foreground))] tap-highlight-none relative"
            onClick={onClick}
        >
            {/* NEW badge for recently added */}
            {madeCount !== undefined && madeCount > 5 && (
                <Badge variant="new">HOT</Badge>
            )}

            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold leading-tight">{recipe.name}</CardTitle>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="tag" className="shrink-0">{recipe.cuisine}</Badge>
                        {madeCount !== undefined && madeCount > 0 && (
                            <Badge variant="burned" className="text-xs">
                                <Flame className="h-3 w-3 mr-1" />
                                {madeCount}x
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-4 w-4" />
                        {recipe.time_minutes} min
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                        <ChefHat className="h-4 w-4" />
                        {recipe.difficulty}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                        <Users className="h-4 w-4" />
                        {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Ingredients preview */}
                <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingredients</p>
                    <p className="text-sm">
                        {recipe.required_ingredients.slice(0, 4).join(', ')}
                        {recipe.required_ingredients.length > 4 && ` +${recipe.required_ingredients.length - 4} more`}
                    </p>
                </div>

                {/* Nutrition */}
                {showNutrition && (
                    <div className="pt-2 border-t-2 border-dashed border-muted">
                        <NutritionBadge nutrition={recipe.nutrition} showAll={false} size="sm" />
                    </div>
                )}

                {/* I Made This Button */}
                {onMadeThis && (
                    <div className="pt-2">
                        <Button
                            size="sm"
                            variant="cta"
                            className="w-full"
                            onClick={handleMadeThis}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'I Made This! 🍳'
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
