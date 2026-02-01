/**
 * Inventory Queries
 * 
 * Database queries for inventory management
 */

import { createClient } from '@/lib/supabase/client';
import type { AvailableInventory, InventoryAuditEntry, InventoryWithProduct, CartReservationWithDetails, StockNotification } from './types';

/**
 * Get available inventory for a product/variant
 */
export async function getAvailableInventory(
  productId: string,
  variantId?: string
): Promise<{ data: AvailableInventory | null; error: Error | null }> {
  const supabase = createClient();
  const query = supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId);

  if (variantId) {
    query.eq('variant_id', variantId);
  } else {
    query.is('variant_id', null);
  }

  const { data, error } = await query.single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return {
    data: {
      product_id: data.product_id,
      variant_id: data.variant_id || undefined,
      total_quantity: data.total_quantity,
      reserved_quantity: data.reserved_quantity,
      available_quantity: data.total_quantity - data.reserved_quantity,
      low_stock_threshold: data.low_stock_threshold,
    },
    error: null,
  };
}

/**
 * Get inventory for multiple products
 */
export async function getInventoryForProducts(
  productIds: string[]
): Promise<{ data: AvailableInventory[]; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .in('product_id', productIds);

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  const inventory = (data || []).map(item => ({
    product_id: item.product_id,
    variant_id: item.variant_id || undefined,
    total_quantity: item.total_quantity,
    reserved_quantity: item.reserved_quantity,
    available_quantity: item.total_quantity - item.reserved_quantity,
    low_stock_threshold: item.low_stock_threshold,
  }));

  return { data: inventory, error: null };
}

/**
 * Get all inventory with product details (for admin)
 */
export async function getInventoryWithProducts(
  options: {
    page?: number;
    limit?: number;
    lowStockOnly?: boolean;
    outOfStockOnly?: boolean;
  } = {}
): Promise<{ data: InventoryWithProduct[]; count: number; error: Error | null }> {
  const supabase = createClient();
  const { page = 1, limit = 50, lowStockOnly = false, outOfStockOnly = false } = options;

  let query = supabase
    .from('inventory')
    .select(
      `
      *,
      products:product_id (id, name, slug, images, category)
    `,
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (lowStockOnly) {
    // Use a filter for low stock (available <= threshold)
    query = query.lte('total_quantity - reserved_quantity', 'low_stock_threshold');
    query = query.gt('total_quantity - reserved_quantity', 0);
  }

  if (outOfStockOnly) {
    query = query.lte('total_quantity - reserved_quantity', 0);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: [], count: 0, error: new Error(error.message) };
  }

  return { data: data || [], count: count || 0, error: null };
}

/**
 * Get active reservations for a cart
 */
export async function getCartReservations(
  cartId: string
): Promise<{ data: CartReservationWithDetails[]; error: Error | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cart_reservations')
    .select(
      `
      *,
      products:product_id (id, name, slug, images),
      product_variants:variant_id (id, size, color)
    `
    )
    .eq('cart_id', cartId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: data || [], error: null };
}

/**
 * Get inventory audit log for a product
 */
export async function getInventoryAuditLog(
  options: {
    productId?: string;
    variantId?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ data: InventoryAuditEntry[]; count: number; error: Error | null }> {
  const supabase = createClient();
  const {
    productId,
    variantId,
    startDate,
    endDate,
    reason,
    page = 1,
    limit = 50,
  } = options;

  let query = supabase
    .from('inventory_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (variantId) {
    query = query.eq('variant_id', variantId);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  if (reason) {
    query = query.eq('reason', reason);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: [], count: 0, error: new Error(error.message) };
  }

  return { data: (data || []) as InventoryAuditEntry[], count: count || 0, error: null };
}

/**
 * Check if product is low stock or out of stock
 */
export async function checkStockStatus(
  productId: string,
  variantId?: string
): Promise<{
  data: {
    isLowStock: boolean;
    isOutOfStock: boolean;
    available: number;
    threshold: number;
  } | null;
  error: Error | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('check_low_stock', {
    p_product_id: productId,
    p_variant_id: variantId,
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return {
    data: {
      isLowStock: data.is_low_stock,
      isOutOfStock: data.is_out_of_stock,
      available: data.available_quantity,
      threshold: data.threshold,
    },
    error: null,
  };
}

/**
 * Get pending stock notifications for a product
 */
export async function getPendingStockNotifications(
  productId: string,
  variantId?: string
): Promise<{ data: StockNotification[]; error: Error | null }> {
  const supabase = createClient();
  let query = supabase
    .from('stock_notifications')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'pending');

  if (variantId) {
    query = query.eq('variant_id', variantId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: data || [], error: null };
}
