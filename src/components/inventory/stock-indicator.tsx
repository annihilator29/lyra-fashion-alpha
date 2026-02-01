/**
 * Stock Indicator Component
 * 
 * Real-time stock status display with live updates via Supabase Realtime
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import type { Inventory } from '@/types/database.types';

interface StockIndicatorProps {
  productId: string;
  variantId?: string;
  showQuantity?: boolean;
  className?: string;
}

export function StockIndicator({
  productId,
  variantId,
  showQuantity = true,
  className,
}: StockIndicatorProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    } else {
      query = query.is('variant_id', null);
    }

    const { data, error } = await query.single();

    if (!error && data) {
      setInventory(data);
    }
    
    setIsLoading(false);
  }, [productId, variantId]);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    fetchInventory();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`inventory:${productId}:${variantId || 'default'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          const newInventory = payload.new as Inventory;
          // Check if variant matches (if specified)
          if (variantId && newInventory.variant_id !== variantId) {
            return;
          }
          if (!variantId && newInventory.variant_id !== null) {
            return;
          }
          setInventory(newInventory);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [productId, variantId, fetchInventory]);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (!inventory) {
    return (
      <span className={cn('text-sm text-gray-500', className)}>
        Stock unavailable
      </span>
    );
  }

  const availableQuantity = inventory.total_quantity - inventory.reserved_quantity;
  const isOutOfStock = availableQuantity <= 0;
  const isLowStock = !isOutOfStock && availableQuantity <= inventory.low_stock_threshold;

  return (
    <span
      className={cn(
        'text-sm font-medium',
        isOutOfStock && 'text-red-600',
        isLowStock && 'text-amber-600',
        !isLowStock && !isOutOfStock && 'text-green-600',
        className
      )}
      aria-label={`Stock status: ${isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock' : 'In stock'}`}
    >
      {isOutOfStock ? (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Out of Stock
        </span>
      ) : isLowStock ? (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {showQuantity ? `Only ${availableQuantity} left` : 'Low Stock'}
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          In Stock
        </span>
      )}
    </span>
  );
}
