/**
 * Admin Inventory Management Page
 * Story 6.2: Inventory Management & Sync (Task 7)
 * 
 * Admin interface for managing inventory levels, viewing stock status,
 * and handling inventory adjustments
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

interface AdminInventoryPageProps {
  searchParams: Promise<{
    filter?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const filter = params.filter || 'all';
  const searchQuery = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 50;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('inventory')
    .select('*, products(id, name, slug, images, category)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply search filter
  if (searchQuery) {
    query = query.or(`products.name.ilike.%${searchQuery}%`);
  }

  const { data: inventory, error, count } = await query;

  if (error) {
    console.error('Error fetching inventory:', error);
  }

  // Helper function to safely get available quantity with defaults
  const getAvailableQuantity = (item: typeof filteredInventory[0]) => {
    const total = item.total_quantity ?? 0;
    const reserved = item.reserved_quantity ?? 0;
    return total - reserved;
  };

  // Filter inventory items based on stock status
  let filteredInventory = inventory || [];
  if (filter === 'low') {
    filteredInventory = filteredInventory.filter(
      (item) => {
        const available = getAvailableQuantity(item);
        const threshold = item.low_stock_threshold ?? 0;
        return available <= threshold && available > 0;
      }
    );
  } else if (filter === 'out') {
    filteredInventory = filteredInventory.filter(
      (item) => getAvailableQuantity(item) <= 0
    );
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Calculate summary stats
  const totalProducts = count || 0;
  const lowStockCount = (inventory || []).filter(
    (item) => {
      const available = getAvailableQuantity(item);
      const threshold = item.low_stock_threshold ?? 0;
      return available <= threshold && available > 0;
    }
  ).length;
  const outOfStockCount = (inventory || []).filter(
    (item) => getAvailableQuantity(item) <= 0
  ).length;

  function getStockStatusBadge(item: typeof filteredInventory[0]) {
    const available = getAvailableQuantity(item);
    const threshold = item.low_stock_threshold ?? 0;
    
    if (available <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (available <= threshold) {
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Low Stock</Badge>;
    }
    
    return <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>;
  }

  function getStockLevelColor(available: number, threshold: number | null | undefined) {
    const safeThreshold = threshold ?? 0;
    if (available <= 0) return 'text-red-600';
    if (available <= safeThreshold) return 'text-amber-600';
    return 'text-green-600';
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground">
                {totalProducts} products tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Products</div>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </div>
        <div className="bg-card border rounded-lg p-4 border-amber-200 bg-amber-50">
          <div className="text-sm text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock
          </div>
          <div className="text-2xl font-bold text-amber-700">{lowStockCount}</div>
        </div>
        <div className="bg-card border rounded-lg p-4 border-red-200 bg-red-50">
          <div className="text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Out of Stock
          </div>
          <div className="text-2xl font-bold text-red-700">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-4" action="/admin/inventory">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              type="search"
              placeholder="Search by product name..."
              defaultValue={searchQuery}
              className="pl-10"
            />
          </div>
          
          <select
            name="filter"
            defaultValue={filter}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <Button type="submit">Filter</Button>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Threshold</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory && filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const totalQty = item.total_quantity ?? 0;
                const reservedQty = item.reserved_quantity ?? 0;
                const available = totalQty - reservedQty;
                const threshold = item.low_stock_threshold ?? 0;
                
                return (
                  <TableRow key={`${item.product_id}-${item.variant_id || 'default'}`}>
                    <TableCell>
                      <div className="font-medium">{item.products?.name || 'Unknown'}</div>
                      <div className="text-muted-foreground text-xs">
                        {item.variant_id ? `Variant: ${item.variant_id.slice(0, 8)}` : 'Default'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{totalQty}</TableCell>
                    <TableCell className="text-right text-amber-600">
                      {reservedQty > 0 ? reservedQty : '-'}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getStockLevelColor(available, threshold)}`}>
                      {available}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {threshold}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStockStatusBadge(item)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/admin/products/${item.product_id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No inventory found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/inventory?filter=${filter}&search=${searchQuery}&page=${page - 1}`}
            >
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          <span className="py-2 px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/inventory?filter=${filter}&search=${searchQuery}&page=${page + 1}`}
            >
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
