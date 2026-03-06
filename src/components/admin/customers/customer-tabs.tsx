/**
 * Customer Tabs Component
 * Story 7.4a: Customer Lookup & Profile
 * AC2, AC3: Customer Profile View and Order History
 * 
 * Tab navigation for customer detail page
 */

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface CustomerTabsProps {
  children: React.ReactNode;
}

export function CustomerTabs({ children }: CustomerTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Order History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        {children}
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-6">
        {children}
      </TabsContent>
    </Tabs>
  );
}
