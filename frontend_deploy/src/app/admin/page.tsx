'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield, Users, UtensilsCrossed, Heart, Target,
    History, Trash2, ShieldCheck, ShieldOff, RefreshCw
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AdminStats {
    total_users: number;
    total_meal_logs: number;
    total_favorites: number;
    total_goals: number;
    total_history: number;
    today_new_users: number;
    admin_email: string;
}

interface AdminUser {
    id: number;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    is_admin: boolean;
    created_at: string;
}

async function fetchAdminAPI<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return res.json();
}

export default function AdminPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { token, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [mounted, isAuthenticated, router]);

    // Fetch admin stats
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
        queryKey: ['admin-stats', token],
        queryFn: () => fetchAdminAPI<AdminStats>('/api/admin/stats', token!),
        enabled: mounted && !!token,
    });

    // Fetch users
    const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery<{ users: AdminUser[]; total: number }>({
        queryKey: ['admin-users', token],
        queryFn: () => fetchAdminAPI('/api/admin/users', token!),
        enabled: mounted && !!token,
    });

    // Toggle admin mutation
    const toggleAdminMutation = useMutation({
        mutationFn: (userId: number) =>
            fetchAdminAPI(`/api/admin/users/${userId}/toggle-admin`, token!, { method: 'PATCH' }),
        onSuccess: () => {
            refetchUsers();
            setActionMessage('Admin status updated');
            setTimeout(() => setActionMessage(''), 3000);
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (userId: number) =>
            fetchAdminAPI(`/api/admin/users/${userId}`, token!, { method: 'DELETE' }),
        onSuccess: () => {
            refetchUsers();
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setActionMessage('User deleted');
            setTimeout(() => setActionMessage(''), 3000);
        },
    });

    if (!mounted || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Check if user is admin based on stats response (if 403, they're not admin)
    if (statsError) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        Admin access required. You must be an administrator to view this page.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage users and view system stats</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>

            {/* Action Message */}
            {actionMessage && (
                <Alert className="bg-green-500/10 border-green-500">
                    <AlertDescription>{actionMessage}</AlertDescription>
                </Alert>
            )}

            {/* Stats Grid */}
            {statsLoading && <div className="text-center py-8 text-muted-foreground">Loading stats...</div>}

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <span className="text-sm text-muted-foreground">Total Users</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_users}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                                <span className="text-sm text-muted-foreground">Meal Logs</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_meal_logs}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                <span className="text-sm text-muted-foreground">Favorites</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_favorites}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-muted-foreground">Goals</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_goals}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-500" />
                                <span className="text-sm text-muted-foreground">History</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_history}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm text-muted-foreground">New Today</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.today_new_users}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* User Management */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Management
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => refetchUsers()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {usersLoading && <div className="text-center py-4 text-muted-foreground">Loading users...</div>}

                    {usersData && usersData.users.length > 0 && (
                        <div className="space-y-2">
                            {usersData.users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-medium">{user.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                            {user.is_admin && <span className="ml-2 text-primary font-medium">• Admin</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleAdminMutation.mutate(user.id)}
                                            disabled={toggleAdminMutation.isPending}
                                            title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                        >
                                            {user.is_admin ? (
                                                <ShieldOff className="h-4 w-4 text-yellow-500" />
                                            ) : (
                                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Delete user ${user.email}?`)) {
                                                    deleteUserMutation.mutate(user.id);
                                                }
                                            }}
                                            disabled={deleteUserMutation.isPending}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {usersData && usersData.total > 0 && (
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            Showing {usersData.users.length} of {usersData.total} users
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
