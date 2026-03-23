'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, User, LogOut, ShoppingBag } from 'lucide-react';
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

export function Header({ className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);
  const { user, loading: authLoading, signOut } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setCustomer(data);
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
        'fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-[#fcfbf9]/90 backdrop-blur-sm',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Navigation */}
        <nav className="hidden items-center space-x-6 text-[11px] font-light tracking-[1px] uppercase text-[#555] md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <div className="flex flex-1 items-center justify-center md:flex-none">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-widest text-black"
          >
            LYRA
          </Link>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-6 text-xs tracking-widest uppercase text-gray-500">
          {authLoading ? (
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 transition-colors hover:text-black sm:flex"
              >
                {customer?.avatar_url ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image
                      src={customer.avatar_url}
                      alt={customer.name || 'Account'}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                ) : (
                  <User className="h-4 w-4" />
                )}
                {customer?.name || 'Account'}
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden items-center gap-1 transition-colors hover:text-black sm:flex"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1 transition-colors hover:text-black sm:flex"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1 transition-colors hover:text-black"
          >
            <ShoppingBag className="h-4 w-4" />
            Bag (0)
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#fcfbf9]">
              <SheetHeader className="mb-6 px-6">
                <SheetTitle className="font-serif text-2xl tracking-widest">LYRA</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-5 px-6 text-left text-[11px] font-light tracking-[1px] uppercase text-[#555]">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="transition-colors hover:text-black"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-gray-200" />
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 transition-colors hover:text-black"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 transition-colors hover:text-black"
                    >
                      {customer?.avatar_url ? (
                        <div className="relative h-5 w-5 overflow-hidden rounded-full">
                          <Image
                            src={customer.avatar_url}
                            alt={customer.name || 'Account'}
                            fill
                            className="object-cover"
                            sizes="20px"
                          />
                        </div>
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      {customer?.name || 'Account'}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-left transition-colors hover:text-black"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <CartSlideOver />
    </header>
  );
}
