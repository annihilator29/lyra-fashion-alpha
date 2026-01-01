'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, Search, User, LogOut, Heart } from 'lucide-react';
import { SearchAutocomplete } from '@/components/search/search-autocomplete';
import { CartBadge } from '@/components/shop/cart-badge';
import { CartSlideOver } from '@/components/shop/cart-slide-over';
import { useCartStore } from '@/lib/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Customer } from '@/types/database.types';

// Navigation links
const NAV_LINKS = [
    { href: '/products/dresses', label: 'Dresses' },
    { href: '/products/tops', label: 'Tops' },
    { href: '/products/bottoms', label: 'Bottoms' },
    { href: '/products/outerwear', label: 'Outerwear' },
    { href: '/products/accessories', label: 'Accessories' },
];

interface HeaderProps {
    className?: string;
}

/**
 * Site Header Component
 *
 * Contains logo, navigation, search functionality, and auth navigation.
 * Desktop: Shows full navigation and search bar.
 * Mobile: Hamburger menu + search icon opening full-screen modals.
 */
export function Header({ className }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const setIsCartOpen = useCartStore((state) => state.setIsOpen);
    const { user, loading: authLoading, signOut } = useAuth();
    const [customer, setCustomer] = useState<Customer | null>(null);

    // Fetch customer data when user is authenticated
    useEffect(() => {
        async function fetchCustomer() {
            if (user) {
                const supabase = createClient();
                const { data } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setCustomer(data);
                }
            } else {
                setCustomer(null);
            }
        }
        fetchCustomer();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        setCustomer(null);
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
                className
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 font-serif text-xl font-bold text-foreground transition-colors hover:text-primary"
                >
                    Lyra Fashion
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Search, Cart & Auth */}
                <div className="hidden items-center gap-2 lg:flex">
                    <div className="w-72">
                        <SearchAutocomplete placeholder="Search products..." />
                    </div>
                    <CartBadge onClick={() => setIsCartOpen(true)} />

                    {/* Auth Navigation - Desktop */}
                    {authLoading ? (
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    ) : !user ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login" aria-label="Sign in to your account">
                                    Sign In
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register" aria-label="Create a new account">
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
                                {customer?.avatar_url ? (
                                    <Image
                                        src={customer.avatar_url}
                                        alt={customer.name || 'User avatar'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <Link
                                href="/account"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Go to account page"
                            >
                                {customer?.name || 'Account'}
                            </Link>
                            <Link
                                href="/account/wishlist"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Go to wishlist"
                            >
                                <Heart className="h-5 w-5" />
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSignOut}
                                aria-label="Sign out of your account"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-1 lg:hidden">
                    {/* Cart Badge */}
                    <CartBadge onClick={() => setIsCartOpen(true)} />
                    
                    {/* Mobile Search Button */}
                    <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open search"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="top" className="h-full">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Search Products</SheetTitle>
                            </SheetHeader>
                            <SearchAutocomplete
                                placeholder="Search products..."
                                onClose={() => setIsSearchOpen(false)}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Mobile Menu Button */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                {/* Auth Navigation - Mobile */}
                                <div className="my-4 border-t" />
                                {authLoading ? (
                                    <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                                ) : !user ? (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                            aria-label="Sign in to your account"
                                        >
                                            Sign In
                                        </Link>
                                        <Button
                                            asChild
                                            className="w-full"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Link href="/register" aria-label="Create a new account">
                                                Sign Up
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
                                                {customer?.avatar_url ? (
                                                    <Image
                                                        src={customer.avatar_url}
                                                        alt={customer.name || 'User avatar'}
                                                        fill
                                                        className="object-cover"
                                                        sizes="36px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    href="/account"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="text-sm font-medium text-foreground"
                                                    aria-label="Go to account page"
                                                >
                                                    {customer?.name || 'Account'}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                                <Link
                                                    href="/account/wishlist"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="text-sm font-medium text-foreground"
                                                    aria-label="Go to wishlist"
                                                >
                                                    Wishlist
                                                </Link>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="justify-start px-0"
                                            onClick={() => {
                                                handleSignOut();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            aria-label="Sign out of your account"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Cart Slide-Over */}
            <CartSlideOver />
        </header>
    );
}
