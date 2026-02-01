/**
 * Inventory Table Component
 * 
 * Admin interface for viewing and managing inventory
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInventoryWithProducts } from '@/lib/inventory';
import type { Inventory, Product } from '@/types/database.types';

type InventoryWithProduct = Inventory & {
  products: Product;
  available_quantity: number;
}

interface InventoryTableProps {
  className?: string;
}

export function InventoryTable({ className }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const itemsPerPage = 50;

  const loadInventory = useCallback(async () => {
    setIsLoading(true);

    const { data, count, error } = await getInventoryWithProducts({
      page: currentPage,
      limit: itemsPerPage,
      lowStockOnly: filter === 'low',
      outOfStockOnly: filter === 'out',
    });

    if (!error && data) {
      // Calculate available quantity for each item
      const inventoryWithAvailable = data.map((item) => ({
        ...item,
        available_quantity: item.total_quantity - item.reserved_quantity,
      })) as InventoryWithProduct[];
      setInventory(inventoryWithAvailable);
      setTotalCount(count || 0);
    }

    setIsLoading(false);
  }, [currentPage, filter, itemsPerPage]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  function getStockStatusBadge(item: InventoryWithProduct) {
    const available = item.available_quantity;
    
    if (available <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (available <= item.low_stock_threshold) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Low Stock</Badge>;
    }
    
    return <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>;
  }

  function getStockLevelColor(available: number, threshold: number) {
    if (available <= 0) return 'text-red-600';
    if (available <= threshold) return 'text-amber-600';
    return 'text-green-600';
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'low' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('low')}
        >
          Low Stock
        </Button>
        <Button
          variant={filter === 'out' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('out')}
        >
          Out of Stock
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Reserved</th>
              <th className="px-4 py-3 text-right font-medium">Available</th>
              <th className="px-4 py-3 text-right font-medium">Threshold</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading inventory...
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No inventory found
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={`${item.product_id}-${item.variant_id || 'default'}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.products?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">
                      {item.variant_id ? `Variant: ${item.variant_id}` : 'Default'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{item.total_quantity}</td>
                  <td className="px-4 py-3 text-right text-amber-600">
                    {item.reserved_quantity > 0 ? item.reserved_quantity : '-'}
                  </td>
                  <td className={cn('px-4 py-3 text-right font-semibold', getStockLevelColor(item.available_quantity, item.low_stock_threshold))}>
                    {item.available_quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {item.low_stock_threshold}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStockStatusBadge(item)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
