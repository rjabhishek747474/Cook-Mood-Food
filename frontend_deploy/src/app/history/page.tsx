'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHistory, getInsights, HistoryEntry, InsightData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { History, Loader2, TrendingUp, Flame, Calendar, Utensils } from 'lucide-react';

function InsightsPanel({ insights, message }: { insights: InsightData; message: string }) {
    return (
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Weekly Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{message}</p>

                {insights.total_recipes > 0 && (
                    <>
                        {/* Averages */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-background rounded-lg p-3 border">
                                <p className="text-muted-foreground">Avg Calories</p>
                                <p className="text-lg font-semibold">{Math.round(insights.avg_calories)}</p>
                            </div>
                            <div className="bg-background rounded-lg p-3 border">
                                <p className="text-muted-foreground">Avg Protein</p>
                                <p className="text-lg font-semibold">{Math.round(insights.avg_protein)}g</p>
                            </div>
                        </div>

                        {/* Top ingredients */}
                        {insights.top_ingredients.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Most Used Ingredients</p>
                                <div className="flex flex-wrap gap-2">
                                    {insights.top_ingredients.map(([ing, count]) => (
                                        <Badge key={ing} variant="secondary">
                                            {ing} ({count}x)
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Patterns */}
                        {insights.patterns.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Observations</p>
                                <ul className="space-y-1 text-sm">
                                    {insights.patterns.map((pattern, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            {pattern}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
    // Use a consistent date format that won't differ between server and client
    const date = new Date(entry.date_cooked);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[date.getDay()];

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                    <div className="text-center min-w-[45px]">
                        <p className="text-xs text-muted-foreground">{weekday}</p>
                        <p className="text-lg font-semibold">{day} {month}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.recipe_name}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Flame className="h-3 w-3" />
                                {entry.calories} kcal
                            </span>
                            <span>💪 {entry.protein_g}g</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function HistoryPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: historyData, isLoading: historyLoading, error: historyError } = useQuery({
        queryKey: ['history'],
        queryFn: () => getHistory(20),
        enabled: mounted,
    });

    const { data: insightsData, isLoading: insightsLoading } = useQuery({
        queryKey: ['insights'],
        queryFn: () => getInsights(7),
        enabled: mounted,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <History className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Cooking History</h1>
                </div>
                <p className="text-muted-foreground">
                    Track what you&apos;ve cooked and discover patterns in your eating habits.
                </p>
            </div>

            {/* Insights */}
            {(!mounted || insightsLoading) && (
                <Card className="py-8 text-center">
                    <CardContent>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                </Card>
            )}

            {mounted && insightsData && (
                <InsightsPanel insights={insightsData.insights} message={insightsData.message} />
            )}

            {/* History list */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Recent Recipes
                </h2>

                {(!mounted || historyLoading) && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {mounted && historyError && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Couldn&apos;t load history. Is the backend running?
                        </AlertDescription>
                    </Alert>
                )}

                {mounted && historyData && historyData.entries.length > 0 && (
                    <div className="space-y-2">
                        {historyData.entries.map((entry) => (
                            <HistoryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                )}

                {mounted && historyData && historyData.entries.length === 0 && (
                    <Card className="py-12 text-center">
                        <CardContent className="space-y-2">
                            <Utensils className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No recipes cooked yet. Start cooking to build your history!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
