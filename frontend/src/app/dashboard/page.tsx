'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { getDashboardToday, DashboardData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardSectionBlue, CardSectionGreen, CardSectionPink, CardSectionCoral } from '@/components/ui/card';
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
                    <h1 className="text-2xl font-bold uppercase tracking-wide">
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
                    {/* Nutrition Summary - Yellow Section */}
                    <div className="yellow-section">
                        <div className="section-label mb-4">
                            <Flame className="h-4 w-4" />
                            Today&apos;s Nutrition
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="stat-number text-foreground">{data.nutrition?.calories || 0}</div>
                                <div className="stat-label">Calories</div>
                            </div>
                            <div className="text-center">
                                <div className="stat-number text-[#E85C3D]">{data.nutrition?.protein_g || 0}g</div>
                                <div className="stat-label">Protein</div>
                            </div>
                            <div className="text-center">
                                <div className="stat-number text-foreground">{data.nutrition?.carbs_g || 0}g</div>
                                <div className="stat-label">Carbs</div>
                            </div>
                            <div className="text-center">
                                <div className="stat-number text-[#00B4D8]">{data.nutrition?.fats_g || 0}g</div>
                                <div className="stat-label">Fats</div>
                            </div>
                        </div>
                    </div>

                    {/* Goals Progress */}
                    {data.goals && data.goals.length > 0 && (
                        <CardSectionGreen>
                            <div className="section-label mb-3">
                                <Target className="h-4 w-4" />
                                Goal Progress
                            </div>
                            <div className="space-y-4">
                                {data.goals.map((goal, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-2 font-medium">
                                            <span className="uppercase tracking-wide">{goal.kind}</span>
                                            <span className="font-mono">{goal.current} / {goal.target}</span>
                                        </div>
                                        <div className="progress-blocks">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`progress-block ${i < Math.ceil(goal.progress_percent / 20) ? 'filled' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardSectionGreen>
                    )}

                    {/* Action Card */}
                    {data.action_card && (
                        <div className={`border-3 border-foreground p-4 ${data.action_card.type === 'success' ? 'bg-section-green' :
                                data.action_card.type === 'warning' ? 'bg-primary' :
                                    'bg-section-blue'
                            }`}>
                            <div className="font-bold uppercase tracking-wide mb-1">{data.action_card.title}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{data.action_card.message}</span>
                                {data.action_card.action && data.action_card.action_url && (
                                    <Link href={data.action_card.action_url}>
                                        <Button size="sm" variant="default">{data.action_card.action}</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/fridge">
                            <CardSectionCoral className="cursor-pointer hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all h-full">
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-[#E85C3D]" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Log Meal</span>
                                </div>
                            </CardSectionCoral>
                        </Link>

                        <Link href="/history">
                            <CardSectionGreen className="cursor-pointer hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all h-full">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-[#00D4AA]" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Trends</span>
                                </div>
                            </CardSectionGreen>
                        </Link>

                        <Link href="/favorites">
                            <CardSectionPink className="cursor-pointer hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all h-full">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-[#FF6B9D]" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Favorites</span>
                                </div>
                            </CardSectionPink>
                        </Link>

                        <Link href="/fitness">
                            <CardSectionBlue className="cursor-pointer hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all h-full">
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5 text-[#00B4D8]" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Goals</span>
                                </div>
                            </CardSectionBlue>
                        </Link>
                    </div>

                    {/* Recipe of the Day */}
                    {data.recipe_of_day?.recipe && (
                        <Card className="border-3 border-foreground">
                            <CardHeader className="pb-2 bg-primary/10">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ChefHat className="h-5 w-5 text-[#E85C3D]" />
                                    Recipe of the Day
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-muted-foreground italic mb-3 border-l-3 border-primary pl-3">{data.recipe_of_day.reason}</p>
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
