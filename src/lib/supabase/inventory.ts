import { createClient } from '@/lib/supabase/client';

export interface StockCheckResult {
  inStock: boolean;
  quantity: number;
}

/**
 * Check real-time inventory stock for a product variant
 * @param productId - Product UUID
 * @param size - Size variant
 * @param color - Color variant
 * @returns Stock availability and quantity
 */
export async function checkStock(
  productId: string,
  size: string,
  color: string
): Promise<StockCheckResult> {
  const supabase = createClient();

  const { data: variant, error } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('product_id', productId)
    .eq('size', size)
    .eq('color', color)
    .single();

  if (error || !variant) {
    return { inStock: false, quantity: 0 };
  }

  return {
    inStock: variant.stock_quantity > 0,
    quantity: variant.stock_quantity,
  };
}

/**
 * Check if multiple cart items are in stock
 * @param items - Array of cart items with productId and variant
 * @returns Map of item IDs to stock status
 */
export async function checkCartItemsStock(
  items: Array<{
    id: string;
    productId: string;
    variant: { size: string; color: string };
  }>
): Promise<Map<string, StockCheckResult>> {
  const stockMap = new Map<string, StockCheckResult>();

  // Check stock for each item in parallel
  await Promise.all(
    items.map(async (item) => {
      const result = await checkStock(
        item.productId,
        item.variant.size,
        item.variant.color
      );
      stockMap.set(item.id, result);
    })
  );

  return stockMap;
}
