'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecipeOfDay, DailyRecipeResponse } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChefHat, Refrigerator, Dumbbell, Globe, Wine, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery<DailyRecipeResponse>({
    queryKey: ['recipeOfDay'],
    queryFn: getRecipeOfDay,
    enabled: mounted,
  });

  const quickLinks = [
    { href: '/fridge', icon: Refrigerator, label: "What's in My Fridge", desc: 'Cook with what you have', bgColor: 'bg-section-blue', accentColor: 'bg-[#00B4D8]', textColor: 'text-[#00B4D8]' },
    { href: '/fitness', icon: Dumbbell, label: 'Fitness Recipes', desc: 'Hit your macro goals', bgColor: 'bg-section-green', accentColor: 'bg-[#00D4AA]', textColor: 'text-[#00D4AA]' },
    { href: '/cuisine', icon: Globe, label: 'Global Cuisine', desc: 'Explore world flavors', bgColor: 'bg-section-pink', accentColor: 'bg-[#FF6B9D]', textColor: 'text-[#FF6B9D]' },
    { href: '/drinks', icon: Wine, label: 'Drinks', desc: 'Healthy to happy hour', bgColor: 'bg-section-coral', accentColor: 'bg-[#E85C3D]', textColor: 'text-[#E85C3D]' },
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 lg:py-12">
        <div className="inline-block -rotate-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-primary px-4 sm:px-6 py-2 sm:py-3 border-3 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] sm:shadow-[6px_6px_0_0_hsl(var(--foreground))]">
            🍳 DailyCook
          </h1>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
          Cook real meals with what you have. No fancy ingredients, no complex steps.
        </p>
      </div>

      {/* Stats Section - Full Width */}
      <div className="full-width-section bg-primary border-t-3 border-b-3 border-foreground py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 lg:gap-8 text-center">
            <div className="stat-block">
              <p className="stat-number text-2xl sm:text-3xl lg:text-4xl text-foreground">500+</p>
              <p className="stat-label text-[10px] sm:text-xs">Recipes</p>
            </div>
            <div className="stat-block">
              <p className="stat-number text-2xl sm:text-3xl lg:text-4xl text-[#E85C3D]">AI</p>
              <p className="stat-label text-[10px] sm:text-xs">Powered</p>
            </div>
            <div className="stat-block">
              <p className="stat-number text-2xl sm:text-3xl lg:text-4xl text-foreground">∞</p>
              <p className="stat-label text-[10px] sm:text-xs">Possibilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickLinks.map(({ href, icon: Icon, label, desc, bgColor, accentColor, textColor }) => (
            <Link key={href} href={href}>
              <div className={`${bgColor} h-full p-4 lg:p-6 border-l-4 ${accentColor.replace('bg-', 'border-l-')} cursor-pointer hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all hover:-translate-y-1`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 lg:p-3 ${accentColor}/20 border-2 border-foreground`}>
                    <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${textColor}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm lg:text-base uppercase tracking-wide">{label}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section - Full Width */}
      <div className="full-width-section bg-section-green border-t-3 border-b-3 border-foreground py-6 lg:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-label mb-4 lg:mb-6">
            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="text-sm lg:text-base">What Makes Us Different</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div className="diamond-bullet text-sm lg:text-base">AI-powered recipe generation from your ingredients</div>
            <div className="diamond-bullet text-sm lg:text-base">Personalized nutrition tracking and goals</div>
            <div className="diamond-bullet text-sm lg:text-base">Global cuisine exploration from 50+ regions</div>
            <div className="diamond-bullet text-sm lg:text-base">Fitness-focused meal planning</div>
          </div>
        </div>
      </div>

      {/* Recipe of the Day */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Card className="border-3 border-foreground bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <ChefHat className="h-5 w-5 lg:h-6 lg:w-6 text-[#E85C3D]" />
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
                <p className="text-sm lg:text-base text-muted-foreground italic border-l-3 border-primary pl-3">{data.reason}</p>
                <Link href={`/fridge/${data.recipe.id}`}>
                  <RecipeCard recipe={data.recipe} showNutrition />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Section - Full Width */}
      <div className="full-width-section bg-[#E85C3D] text-white border-t-3 border-b-3 border-foreground py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-center gap-2 mb-2 lg:mb-4">
              <Zap className="h-6 w-6 lg:h-8 lg:w-8" />
              <span className="font-bold text-xl lg:text-3xl uppercase tracking-wide">Start Cooking Now</span>
            </div>
            <p className="text-sm lg:text-base opacity-90 mb-4 lg:mb-6">Enter your ingredients and let AI create magic</p>
            <Link href="/fridge" className="inline-block bg-background text-foreground font-bold uppercase tracking-wide px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base border-3 border-foreground hover:shadow-[4px_4px_0_0_black] lg:hover:shadow-[6px_6px_0_0_black] transition-all">
              Open My Fridge →
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-xs lg:text-sm text-center text-muted-foreground">
          Nutrition values are estimates. Always verify for dietary requirements.
        </p>
      </div>
    </div>
  );
}
