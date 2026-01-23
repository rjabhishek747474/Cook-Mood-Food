'use client';

import { Nutrition } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface NutritionBadgeProps {
    nutrition: Nutrition;
    showAll?: boolean;
    size?: 'sm' | 'md';
}

export function NutritionBadge({ nutrition, showAll = true, size = 'md' }: NutritionBadgeProps) {
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <div className={`flex flex-wrap gap-2 ${textSize}`}>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                🔥 {nutrition.calories} kcal
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                💪 {nutrition.protein_g}g protein
            </Badge>
            {showAll && (
                <>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                        🍞 {nutrition.carbs_g}g carbs
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        🧈 {nutrition.fats_g}g fats
                    </Badge>
                </>
            )}
        </div>
    );
}
