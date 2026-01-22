'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore, getProfile, updateProfile, UserProfile } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardSectionBlue } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Save, ArrowLeft, Loader2, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const { token, isAuthenticated, user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    useEffect(() => {
        if (mounted && token) {
            getProfile(token)
                .then((data) => setProfile(data))
                .catch(() => setError('Failed to load profile'));
        }
    }, [mounted, token]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserProfile>) => updateProfile(token!, data),
        onSuccess: (data) => {
            setProfile(data);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        },
        onError: () => {
            setError('Failed to update profile');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        updateMutation.mutate({
            name: profile.name,
            height_cm: profile.height_cm,
            weight_kg: profile.weight_kg,
            activity_level: profile.activity_level,
        });
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
                    <h1 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-wide">
                        <div className="p-2 bg-primary border-3 border-foreground">
                            <User className="h-5 w-5 text-foreground" />
                        </div>
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {message && (
                <div className="bg-section-green border-3 border-foreground p-4">
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="border-3 border-foreground">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="border-3 border-foreground">
                <CardHeader className="bg-primary/10">
                    <CardTitle className="uppercase tracking-wide">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wide">Name</label>
                            <Input
                                id="name"
                                value={profile.name || ''}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="YOUR NAME"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="height" className="text-xs font-bold uppercase tracking-wide">Height (cm)</label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={profile.height_cm || ''}
                                    onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value) || undefined })}
                                    placeholder="170"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="weight" className="text-xs font-bold uppercase tracking-wide">Weight (kg)</label>
                                <Input
                                    id="weight"
                                    type="number"
                                    step="0.1"
                                    value={profile.weight_kg || ''}
                                    onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) || undefined })}
                                    placeholder="70"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="activity" className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Activity Level
                            </label>
                            <select
                                id="activity"
                                className="w-full h-12 px-3 border-3 border-foreground bg-background text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                                value={profile.activity_level || 'moderate'}
                                onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                            >
                                <option value="sedentary">Sedentary (little/no exercise)</option>
                                <option value="light">Light (1-3 days/week)</option>
                                <option value="moderate">Moderate (3-5 days/week)</option>
                                <option value="high">High (6-7 days/week)</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={updateMutation.isPending} variant="cta" size="lg" className="w-full">
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
