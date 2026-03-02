/**
 * Quick Links Grid Component
 * Story 7.1a: Admin Dashboard - Foundation
 * AC4: Quick Navigation Links
 */

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

interface QuickLinksGridProps {
  links: QuickLink[];
  className?: string;
}

export function QuickLinksGrid({ links, className }: QuickLinksGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4',
        className
      )}
      data-testid="quick-links-grid"
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {link.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
