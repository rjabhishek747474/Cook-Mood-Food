'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecipeOfDay, DailyRecipeResponse } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChefHat, Refrigerator, Dumbbell, Globe, Wine } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery<DailyRecipeResponse>({
    queryKey: ['recipeOfDay'],
    queryFn: getRecipeOfDay,
    enabled: mounted, // Only fetch after mount to avoid hydration issues
  });

  const quickLinks = [
    { href: '/fridge', icon: Refrigerator, label: "What's in My Fridge", desc: 'Cook with what you have' },
    { href: '/fitness', icon: Dumbbell, label: 'Fitness Recipes', desc: 'Hit your macro goals' },
    { href: '/cuisine', icon: Globe, label: 'Global Cuisine', desc: 'Explore world flavors' },
    { href: '/drinks', icon: Wine, label: 'Drinks', desc: 'Healthy to happy hour' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl font-bold tracking-tight">🍳 DailyCook</h1>
        <p className="text-muted-foreground">
          Cook real meals with what you have. No fancy ingredients, no complex steps.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:shadow-md transition-shadow hover:border-primary/50 cursor-pointer">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recipe of the Day */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChefHat className="h-5 w-5 text-primary" />
            Recipe of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!mounted || isLoading) && (
            <div className="text-center py-8 text-muted-foreground">Loading today&apos;s pick...</div>
          )}

          {mounted && error && (
            <Alert variant="destructive">
              <AlertDescription>
                Couldn&apos;t load recipe of the day. Is the backend running?
              </AlertDescription>
            </Alert>
          )}

          {mounted && data && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground italic">{data.reason}</p>
              <Link href={`/fridge/${data.recipe.id}`}>
                <RecipeCard recipe={data.recipe} showNutrition />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground">
        Nutrition values are estimates. Always verify for dietary requirements.
      </p>
    </div>
  );
}
