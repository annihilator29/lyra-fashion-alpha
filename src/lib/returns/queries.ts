/**
 * Returns Queries
 *
 * Database queries for fetching returns data with proper authorization checks.
 */

import { createClient } from '@/lib/supabase/client';
import type { Return, ReturnWithOrder } from '@/types/returns';

/**
 * Get returns for a specific order
 *
 * @example
 * ```typescript
 * const { returns, error } = await getReturnsForOrder('order-uuid');
 * ```
 */
export async function getReturnsForOrder(
  orderId: string
): Promise<{ returns: Return[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      returns: [],
      error: error.message,
    };
  }

  return {
    returns: (data || []) as Return[],
    error: null,
  };
}

/**
 * Get a single return by ID with order details
 *
 * @example
 * ```typescript
 * const { return: returnData, error } = await getReturnById('return-uuid');
 * ```
 */
export async function getReturnById(
  returnId: string
): Promise<{ return: ReturnWithOrder | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders (
        id,
        order_number,
        customer_id,
        customer_email,
        status,
        total,
        delivered_at,
        shipping_address
      ),
      inspector:profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('id', returnId)
    .single();

  if (error) {
    return {
      return: null,
      error: error.message,
    };
  }

  return {
    return: data as ReturnWithOrder,
    error: null,
  };
}

/**
 * Get return by RMA number (for customer lookup)
 *
 * @example
 * ```typescript
 * const { return: returnData, error } = await getReturnByRMANumber('RMA-ORD-123-20260202');
 * ```
 */
export async function getReturnByRMANumber(
  rmaNumber: string
): Promise<{ return: ReturnWithOrder | null; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders (
        id,
        order_number,
        customer_id,
        customer_email,
        status,
        total,
        delivered_at,
        shipping_address
      ),
      inspector:profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('rma_number', rmaNumber)
    .single();

  if (error) {
    return {
      return: null,
      error: error.message,
    };
  }

  return {
    return: data as ReturnWithOrder,
    error: null,
  };
}

/**
 * Get all returns for admin dashboard
 *
 * @example
 * ```typescript
 * const { returns, error } = await getAllReturns('requested');
 * ```
 */
export async function getAllReturns(
  statusFilter?: string
): Promise<{ returns: ReturnWithOrder[]; error: string | null }> {
  const supabase = createClient();

  let query = supabase
    .from('returns')
    .select(`
      *,
      order:orders (
        id,
        order_number,
        customer_id,
        customer_email,
        status,
        total,
        delivered_at,
        shipping_address
      ),
      inspector:profiles (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    return {
      returns: [],
      error: error.message,
    };
  }

  return {
    returns: (data || []) as ReturnWithOrder[],
    error: null,
  };
}

/**
 * Search returns by RMA number or order ID (admin only)
 *
 * @example
 * ```typescript
 * const { returns, error } = await searchReturns('RMA-ORD-123');
 * ```
 */
export async function searchReturns(
  searchTerm: string
): Promise<{ returns: ReturnWithOrder[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders (
        id,
        order_number,
        customer_id,
        customer_email,
        status,
        total,
        delivered_at,
        shipping_address
      ),
      inspector:profiles (
        id,
        full_name,
        email
      )
    `)
    .or(`rma_number.ilike.%${searchTerm}%,order_id.eq.${searchTerm}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return {
      returns: [],
      error: error.message,
    };
  }

  return {
    returns: (data || []) as ReturnWithOrder[],
    error: null,
  };
}

/**
 * Get returns requiring action (admin dashboard quick view)
 *
 * @example
 * ```typescript
 * const { returns, error } = await getReturnsRequiringAction();
 * ```
 */
export async function getReturnsRequiringAction(): Promise<{
  requested: ReturnWithOrder[];
  received: ReturnWithOrder[];
  error: string | null;
}> {
  const supabase = createClient();

  const [{ data: requested }, { data: received }] = await Promise.all([
    supabase
      .from('returns')
      .select(`
        *,
        order:orders (
          id,
          order_number,
          customer_id,
          customer_email,
          status,
          total,
          delivered_at,
          shipping_address
        )
      `)
      .eq('status', 'requested')
      .order('requested_at', { ascending: true }),
    supabase
      .from('returns')
      .select(`
        *,
        order:orders (
          id,
          order_number,
          customer_id,
          customer_email,
          status,
          total,
          delivered_at,
          shipping_address
        )
      `)
      .eq('status', 'received')
      .order('received_at', { ascending: true }),
  ]);

  return {
    requested: (requested || []) as ReturnWithOrder[],
    received: (received || []) as ReturnWithOrder[],
    error: null,
  };
}

/**
 * Check if items are already in a return
 *
 * @example
 * ```typescript
 * const { alreadyReturned, error } = await checkItemsAlreadyReturned('order-uuid', ['item-1', 'item-2']);
 * ```
 */
export async function checkItemsAlreadyReturned(
  orderId: string,
  itemIds: string[]
): Promise<{ alreadyReturned: string[]; error: string | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('returns')
    .select('order_item_ids')
    .eq('order_id', orderId)
    .not('status', 'eq', 'rejected');

  if (error) {
    return {
      alreadyReturned: [],
      error: error.message,
    };
  }

  const returnedItemIds = new Set<string>();
  (data || []).forEach((returnRecord: { order_item_ids: string[] }) => {
    returnRecord.order_item_ids.forEach((id: string) => returnedItemIds.add(id));
  });

  const alreadyReturned = itemIds.filter(id => returnedItemIds.has(id));

  return {
    alreadyReturned,
    error: null,
  };
}
