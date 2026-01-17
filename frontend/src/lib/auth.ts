/**
 * Authentication context and utilities for DailyCook
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
}

export interface UserProfile {
    id: number;
    user_id: number;
    name: string | null;
    dob: string | null;
    gender: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    activity_level: string | null;
    timezone: string;
    dietary_preferences: string[] | null;
    allergies: string[] | null;
    target_goal: Record<string, unknown> | null;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

// Zustand store with persistence
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            setAuth: (token: string, user: User) =>
                set({ token, user, isAuthenticated: true, isLoading: false }),
            logout: () =>
                set({ token: null, user: null, isAuthenticated: false, isLoading: false }),
            setLoading: (loading: boolean) => set({ isLoading: loading }),
        }),
        {
            name: 'dailycook-auth',
        }
    )
);

// API functions
export async function signup(email: string, password: string, name?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(error.detail || 'Signup failed');
    }

    const data = await res.json();
    return { token: data.access_token, user: data.user };
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(error.detail || 'Login failed');
    }

    const data = await res.json();
    return { token: data.access_token, user: data.user };
}

export async function getProfile(token: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error('Failed to get profile');
    }

    return res.json();
}

export async function updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update profile');
    }

    return res.json();
}

// Helper to get auth header
export function getAuthHeader(): Record<string, string> {
    const token = useAuthStore.getState().token;
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
}
