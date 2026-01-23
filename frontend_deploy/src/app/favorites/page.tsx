'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { getFavorites, Favorite, removeFavorite } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Trash2, ChefHat, Wine } from 'lucide-react';

export default function FavoritesPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    const { data: favorites, isLoading, error, refetch } = useQuery<Favorite[]>({
        queryKey: ['favorites', token],
        queryFn: () => getFavorites(token!),
        enabled: mounted && !!token,
    });

    const handleRemove = async (favoriteId: number) => {
        if (!token) return;
        try {
            await removeFavorite(token, favoriteId);
            refetch();
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    if (!mounted || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="h-6 w-6 text-red-500" />
                        My Favorites
                    </h1>
                    <p className="text-muted-foreground">Your saved recipes and drinks</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            {isLoading && (
                <div className="text-center py-8 text-muted-foreground">Loading favorites...</div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>Failed to load favorites. Please try again.</AlertDescription>
                </Alert>
            )}

            {favorites && favorites.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No favorites yet</p>
                        <p className="text-muted-foreground mb-4">Start exploring recipes and save your favorites!</p>
                        <Link href="/fridge">
                            <Button>Browse Recipes</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {favorites && favorites.length > 0 && (
                <div className="grid gap-3">
                    {favorites.map((fav) => (
                        <Card key={fav.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-4 flex items-center justify-between">
                                <Link
                                    href={fav.recipe_type === 'drink' ? `/drinks/${fav.recipe_id}` : `/fridge/${fav.recipe_id}`}
                                    className="flex items-center gap-3 flex-1"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        {fav.recipe_type === 'drink' ? (
                                            <Wine className="h-5 w-5 text-primary" />
                                        ) : (
                                            <ChefHat className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{fav.recipe_name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{fav.recipe_type}</p>
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(fav.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
