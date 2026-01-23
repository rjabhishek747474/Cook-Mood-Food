'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRecipeDetail, saveToHistory } from '@/lib/api';
import { RecipeDetail } from '@/components/RecipeDetail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const recipeId = params.id as string;

    const { data: recipe, isLoading, error } = useQuery({
        queryKey: ['recipe', recipeId],
        queryFn: () => getRecipeDetail(recipeId),
        enabled: !!recipeId,
    });

    const saveMutation = useMutation({
        mutationFn: () => saveToHistory(recipe!.id, recipe!.required_ingredients),
        onSuccess: () => {
            alert('Recipe saved to history! 🎉');
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Recipe not found or couldn't load. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <RecipeDetail
            recipe={recipe}
            onBack={() => router.back()}
            onCook={() => saveMutation.mutate()}
        />
    );
}
