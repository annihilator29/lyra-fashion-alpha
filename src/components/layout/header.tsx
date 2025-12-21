'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { SearchAutocomplete } from '@/components/search/search-autocomplete';
import { CartBadge } from '@/components/shop/cart-badge';
import { CartSlideOver } from '@/components/shop/cart-slide-over';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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
 * Contains logo, navigation, and search functionality.
 * Desktop: Shows full navigation and search bar.
 * Mobile: Hamburger menu + search icon opening full-screen modals.
 */
export function Header({ className }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const setIsCartOpen = useCartStore((state) => state.setIsOpen);

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

                {/* Desktop Search & Cart */}
                <div className="hidden items-center gap-2 lg:flex">
                    <div className="w-72">
                        <SearchAutocomplete placeholder="Search products..." />
                    </div>
                    <CartBadge onClick={() => setIsCartOpen(true)} />
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
