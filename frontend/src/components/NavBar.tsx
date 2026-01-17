'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';
import { Refrigerator, Dumbbell, Globe, Wine, History, LayoutDashboard, LogIn, Heart } from 'lucide-react';

const publicNavItems = [
    { href: '/fridge', label: 'Fridge', icon: Refrigerator },
    { href: '/fitness', label: 'Fitness', icon: Dumbbell },
    { href: '/cuisine', label: 'Cuisine', icon: Globe },
    { href: '/drinks', label: 'Drinks', icon: Wine },
    { href: '/history', label: 'History', icon: History },
];

const authNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/fridge', label: 'Fridge', icon: Refrigerator },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/fitness', label: 'Fitness', icon: Dumbbell },
    { href: '/history', label: 'History', icon: History },
];

export function NavBar() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use public nav items until hydrated to avoid mismatch
    const navItems = mounted && isAuthenticated ? authNavItems : publicNavItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:static md:border-t-0 md:border-b">
            <div className="max-w-4xl mx-auto">
                <ul className="flex justify-around md:justify-center md:gap-6">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-2 py-3 text-xs md:text-sm transition-colors',
                                    pathname === href || pathname.startsWith(href + '/')
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}

                    {/* Auth button */}
                    {mounted && !isAuthenticated && (
                        <li>
                            <Link
                                href="/login"
                                className={cn(
                                    'flex flex-col items-center gap-1 px-2 py-3 text-xs md:text-sm transition-colors',
                                    pathname === '/login' || pathname === '/signup'
                                        ? 'text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <LogIn className="h-5 w-5" />
                                <span>Login</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

