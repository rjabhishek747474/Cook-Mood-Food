'use client';

import { RecipeCard as RecipeCardType } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NutritionBadge } from './NutritionBadge';
import { Clock, ChefHat, Users } from 'lucide-react';

interface RecipeCardProps {
    recipe: RecipeCardType;
    onClick?: () => void;
    showNutrition?: boolean;
}

export function RecipeCard({ recipe, onClick, showNutrition = true }: RecipeCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-primary/50"
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight">{recipe.name}</CardTitle>
                    <Badge variant="outline" className="shrink-0">{recipe.cuisine}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.time_minutes} min
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

                {/* Ingredients preview */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ingredients</p>
                    <p className="text-sm">
                        {recipe.required_ingredients.slice(0, 4).join(', ')}
                        {recipe.required_ingredients.length > 4 && ` +${recipe.required_ingredients.length - 4} more`}
                    </p>
                </div>

                {/* Nutrition */}
                {showNutrition && (
                    <div className="pt-2">
                        <NutritionBadge nutrition={recipe.nutrition} showAll={false} size="sm" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
