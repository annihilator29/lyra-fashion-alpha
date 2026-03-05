/**
 * Product Listing Page
 * Story 7.2: Product Management Interface
 * Phase 2: Product Listing Page with TanStack Table
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';

// Import ProductFilters from actions
import type { ProductFilters } from './actions';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Icons
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
} from 'lucide-react';

// Types
import { getProducts, updateProductStatus, updateProductCategory, updateProductPrices, deleteProduct, exportProductsToCSV } from './actions';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  status: 'draft' | 'active' | 'archived';
  images: string[];
  createdAt: string;
  updatedAt: string;
  variants?: Array<{
    sku: string;
    size: string;
    color: string;
    stock_quantity: number;
  }>;
  inventory?: Array<{
    total_quantity: number;
    reserved_quantity: number;
    low_stock_threshold?: number;
  }>;
}

const productColumnHelper = createColumnHelper<Product>();

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'status' | 'category' | 'price' | 'delete' | 'export' | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState('');
  const [bulkPriceType, setBulkPriceType] = useState<'percentage' | 'fixed'>('percentage');

  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', pagination.pageIndex, pagination.pageSize, categoryFilter, statusFilter, stockFilter, globalFilter],
    queryFn: async () => {
      const filters: ProductFilters = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id || 'created_at',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      };

      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (statusFilter !== 'all') filters.status = statusFilter as 'draft' | 'active' | 'archived';
      if (stockFilter === 'in-stock') filters.inStock = true;
      if (stockFilter === 'out-of-stock') filters.inStock = false;
      if (globalFilter) filters.search = globalFilter;

      const result = await getProducts(filters);
      if (result.error) throw new Error(result.error.message);
      return result;
    },
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: 'draft' | 'active' | 'archived' }) => {
      const result = await updateProductStatus(ids, status);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setRowSelection({});
      toast.success('Product status updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ ids, category }: { ids: string[]; category: string }) => {
      const result = await updateProductCategory(ids, category);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setRowSelection({});
      toast.success('Product category updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePricesMutation = useMutation({
    mutationFn: async ({ ids, adjustment }: { ids: string[]; adjustment: { type: 'percentage' | 'fixed'; value: number } }) => {
      const result = await updateProductPrices(ids, adjustment);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setRowSelection({});
      toast.success('Product prices updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProduct(id, false);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      toast.success('Product archived');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (ids?: string[]) => {
      const result = await exportProductsToCSV(ids);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      // Download CSV
      const blob = new Blob([data.data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Products exported successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Define columns
  const columns = useMemo(
    () => [
      productColumnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),
      productColumnHelper.accessor('name', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Product
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.images?.[0] && (
              <img
                src={row.original.images[0]}
                alt={row.original.name}
                className="h-10 w-10 rounded object-cover"
              />
            )}
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">{row.original.slug}</div>
            </div>
          </div>
        ),
      }),
      productColumnHelper.accessor('category', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Category
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.category}</Badge>
        ),
      }),
      productColumnHelper.accessor('price', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">${(row.original.price / 100).toFixed(2)}</div>
        ),
      }),
      productColumnHelper.accessor('status', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'active'
                ? 'default'
                : row.original.status === 'draft'
                ? 'secondary'
                : 'outline'
            }
          >
            {row.original.status}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      }),
      productColumnHelper.accessor('inventory', {
        header: 'Inventory',
        cell: ({ row }) => {
          const totalQty = row.original.inventory?.[0]?.total_quantity || 0;
          const reservedQty = row.original.inventory?.[0]?.reserved_quantity || 0;
          const available = totalQty - reservedQty;
          // Use low_stock_threshold from inventory record, fallback to env var or default
          const threshold = row.original.inventory?.[0]?.low_stock_threshold || 
                           parseInt(process.env.NEXT_PUBLIC_LOW_INVENTORY_THRESHOLD || '10');

          return (
            <div>
              <div className="font-medium">{available} available</div>
              {available < threshold && available > 0 && (
                <div className="text-xs text-amber-600">Low stock</div>
              )}
              {available === 0 && (
                <div className="text-xs text-red-600">Out of stock</div>
              )}
            </div>
          );
        },
      }),
      productColumnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/products/${row.original.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/products/${row.original.category.toLowerCase()}/${row.original.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProducts([row.original]);
                  setBulkActionType('delete');
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      }),
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: data?.pagination?.total || 0,
  });

  // Handle bulk action
  const handleBulkAction = useCallback(() => {
    const selectedIds = Object.keys(rowSelection).map(
      (index) => data?.data?.[parseInt(index)]?.id
    ).filter((id): id is string => Boolean(id));

    if (selectedIds.length === 0) return;

    switch (bulkActionType) {
      case 'status':
        updateStatusMutation.mutate({ ids: selectedIds, status: bulkActionValue as 'draft' | 'active' | 'archived' });
        break;
      case 'category':
        updateCategoryMutation.mutate({ ids: selectedIds, category: bulkActionValue });
        break;
      case 'price':
        const priceValue = parseFloat(bulkActionValue);
        const priceType = bulkPriceType;
        if (!isNaN(priceValue)) {
          updatePricesMutation.mutate({
            ids: selectedIds,
            adjustment: { type: priceType, value: priceValue },
          });
        }
        break;
      case 'export':
        exportMutation.mutate(selectedIds);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
    }

    setBulkActionDialogOpen(false);
    setBulkActionType(null);
    setBulkActionValue('');
    setBulkPriceType('percentage');
  }, [rowSelection, data, bulkActionType, bulkActionValue, bulkPriceType, updateStatusMutation, updateCategoryMutation, updatePricesMutation, exportMutation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Package className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="h-8 w-8 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Products</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Dresses">Dresses</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setBulkActionDialogOpen(true)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Bulk Actions ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.ceil((data?.pagination?.total || 0) / pagination.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Select an action to perform on {table.getFilteredSelectedRowModel().rows.length} selected products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={bulkActionType || ''} onValueChange={(v) => setBulkActionType(v as 'status' | 'category' | 'price' | 'delete' | 'export')}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Change Status</SelectItem>
                <SelectItem value="category">Change Category</SelectItem>
                <SelectItem value="price">Adjust Prices</SelectItem>
                <SelectItem value="export">Export to CSV</SelectItem>
                <SelectItem value="delete">Archive Products</SelectItem>
              </SelectContent>
            </Select>

            {bulkActionType === 'status' && (
              <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}

            {bulkActionType === 'category' && (
              <Select value={bulkActionValue} onValueChange={setBulkActionValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dresses">Dresses</SelectItem>
                  <SelectItem value="Tops">Tops</SelectItem>
                  <SelectItem value="Bottoms">Bottoms</SelectItem>
                  <SelectItem value="Outerwear">Outerwear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            )}

            {bulkActionType === 'price' && (
              <div className="space-y-4">
                <Select value={bulkPriceType} onValueChange={(v) => setBulkPriceType(v as 'percentage' | 'fixed')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder={bulkPriceType === 'percentage' ? "Percentage (e.g., 10 for +10%)" : "Amount in cents (e.g., 500 for +$5.00)"}
                  value={bulkActionValue}
                  onChange={(e) => setBulkActionValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {bulkPriceType === 'percentage'
                    ? "Percentage: new_price = current_price * (1 + value/100)"
                    : "Fixed: new_price = current_price + value (cents)"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={!bulkActionValue && bulkActionType !== 'export' && bulkActionType !== 'delete'}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Product(s)</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {selectedProducts.length} product(s)? This will hide them from the storefront but they can be restored later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                selectedProducts.forEach((product) => {
                  deleteProductMutation.mutate(product.id);
                });
              }}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
