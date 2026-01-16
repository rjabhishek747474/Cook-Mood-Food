'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Refrigerator, Dumbbell, Globe, Wine, Clock, History } from 'lucide-react';

const navItems = [
    { href: '/fridge', label: 'Fridge', icon: Refrigerator },
    { href: '/fitness', label: 'Fitness', icon: Dumbbell },
    { href: '/cuisine', label: 'Cuisine', icon: Globe },
    { href: '/drinks', label: 'Drinks', icon: Wine },
    { href: '/history', label: 'History', icon: History },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:static md:border-t-0 md:border-b">
            <div className="max-w-4xl mx-auto">
                <ul className="flex justify-around md:justify-center md:gap-8">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-3 py-3 text-xs md:text-sm transition-colors',
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
                </ul>
            </div>
        </nav>
    );
}
