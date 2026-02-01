/**
 * Product Edit Page
 * Admin interface for editing product details and inventory
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import { updateInventory } from '@/lib/inventory/actions';

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !product) {
    console.error('Error fetching product:', productError);
    redirect('/admin/inventory');
  }

  // Fetch inventory details
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', id)
    .single();

  if (inventoryError) {
    console.error('Error fetching inventory:', inventoryError);
  }

  const totalQty = inventory?.total_quantity ?? inventory?.quantity ?? 0;
  const reservedQty = inventory?.reserved_quantity ?? inventory?.reserved ?? 0;
  const threshold = inventory?.low_stock_threshold ?? 10;
  const availableQty = totalQty - reservedQty;

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Edit Product Inventory</h1>
            <p className="text-muted-foreground">
              {product.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Product Name</Label>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium capitalize">{product.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Price</Label>
              <p className="font-medium">${(product.price / 100).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Product ID</Label>
              <p className="font-mono text-sm">{product.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Stock Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{totalQty}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">{reservedQty}</div>
                <div className="text-sm text-muted-foreground">Reserved</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{availableQty}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateInventory} className="space-y-6">
              {/* Hidden product ID field */}
              <input type="hidden" name="product_id" value={product.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="total_quantity">Total Quantity</Label>
                  <Input
                    id="total_quantity"
                    name="total_quantity"
                    type="number"
                    min="0"
                    defaultValue={totalQty}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Total items in stock
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserved_quantity">Reserved Quantity</Label>
                  <Input
                    id="reserved_quantity"
                    name="reserved_quantity"
                    type="number"
                    min="0"
                    defaultValue={reservedQty}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Items reserved in active carts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    type="number"
                    min="1"
                    defaultValue={threshold}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when available stock falls below this number
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  Update Inventory
                </Button>
                <Link href="/admin/inventory">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
