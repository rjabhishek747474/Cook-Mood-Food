'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { getDashboardToday, DashboardData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RecipeCard } from '@/components/RecipeCard';
import {
    Flame, Drumstick, Wheat, Droplets,
    Target, Plus, TrendingUp, Heart,
    ChefHat, LogOut, User
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { token, user, isAuthenticated, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    const { data, isLoading, error } = useQuery<DashboardData>({
        queryKey: ['dashboard', token],
        queryFn: () => getDashboardToday(token || undefined),
        enabled: mounted && !!token,
    });

    const handleLogout = () => {
        logout();
        router.push('/');
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome{data?.user?.name ? `, ${data.user.name}` : ''}! 👋
                    </h1>
                    <p className="text-muted-foreground">Here&apos;s your nutrition dashboard for today</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/profile">
                        <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-1" />
                            Profile
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-1" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-8 text-muted-foreground">Loading your dashboard...</div>
            )}

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>Failed to load dashboard. Please try again.</AlertDescription>
                </Alert>
            )}

            {/* Dashboard Content */}
            {data && data.authenticated && (
                <>
                    {/* Nutrition Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <span className="text-sm text-muted-foreground">Calories</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{data.nutrition?.calories || 0}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Drumstick className="h-5 w-5 text-red-500" />
                                    <span className="text-sm text-muted-foreground">Protein</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{data.nutrition?.protein_g || 0}g</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Wheat className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm text-muted-foreground">Carbs</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{data.nutrition?.carbs_g || 0}g</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm text-muted-foreground">Fats</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{data.nutrition?.fats_g || 0}g</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Goals Progress */}
                    {data.goals && data.goals.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-5 w-5 text-primary" />
                                    Goal Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.goals.map((goal, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize">{goal.kind}</span>
                                            <span>{goal.current} / {goal.target}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${Math.min(100, goal.progress_percent)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Card */}
                    {data.action_card && (
                        <Alert className={
                            data.action_card.type === 'success' ? 'border-green-500 bg-green-500/10' :
                                data.action_card.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-blue-500 bg-blue-500/10'
                        }>
                            <AlertTitle>{data.action_card.title}</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>{data.action_card.message}</span>
                                {data.action_card.action && data.action_card.action_url && (
                                    <Link href={data.action_card.action_url}>
                                        <Button size="sm" variant="secondary">{data.action_card.action}</Button>
                                    </Link>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/fridge">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-medium text-sm">Log Meal</span>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/history">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    </div>
                                    <span className="font-medium text-sm">View Trends</span>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/favorites">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10">
                                        <Heart className="h-5 w-5 text-red-500" />
                                    </div>
                                    <span className="font-medium text-sm">Favorites</span>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/fitness">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Target className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <span className="font-medium text-sm">Set Goals</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Recipe of the Day */}
                    {data.recipe_of_day?.recipe && (
                        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ChefHat className="h-5 w-5 text-primary" />
                                    Recipe of the Day
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic mb-3">{data.recipe_of_day.reason}</p>
                                <Link href={`/fridge/${data.recipe_of_day.recipe.id}`}>
                                    <RecipeCard recipe={data.recipe_of_day.recipe} showNutrition />
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
